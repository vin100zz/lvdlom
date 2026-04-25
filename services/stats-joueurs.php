<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode(),
                 new FiltreNationalite(),
                 new FiltreAuClub(),
                 new FiltrePoste(),
                 new FiltreFormeAuClub(),
                 new FiltreLieuNaissance());

// clause calculée une seule fois
$clause = Filters::getClause($filtres);

// SQL — les CTEs filtered_joue et filtered_buts centralisent le filtrage
// pour éviter de répéter la clause WHERE 5 fois dans la même requête
$joueurs = DBAccess::query
("
  WITH filtered_joue AS (
    SELECT joue.IdJoueur AS IdJoueur, joue.IdMatch AS IdMatch, matches.Saison AS Saison
    FROM joue
    JOIN matches ON joue.IdMatch = matches.IdMatch
    JOIN joueurs ON joue.IdJoueur = joueurs.IdJoueur
    WHERE $clause
  ),
  filtered_buts AS (
    SELECT buteursom.IdJoueur AS IdJoueur
    FROM buteursom
    JOIN matches ON buteursom.IdMatch = matches.IdMatch
    JOIN joueurs ON buteursom.IdJoueur = joueurs.IdJoueur
    WHERE $clause
  )
  SELECT
    joueurs.IdJoueur AS id,
    Nom AS nom,
    Prenom AS prenom,
    Poste AS poste,
    Periode AS periode,
    AuClub AS auClub,
    nbSaisons,
    nbMatches,
    nbButs,
    titres
  
  FROM joueurs

  LEFT JOIN
   (SELECT joueurs.IdJoueur AS id, (strftime('%Y', Min(DateMatch)) || '-' || strftime('%Y', Max(DateMatch))) as Periode
    FROM joueurs, joue, matches
    WHERE joue.IdJoueur = joueurs.IdJoueur AND joue.IdMatch = matches.IdMatch
    GROUP BY joueurs.IdJoueur) AS table_periode ON joueurs.IdJoueur = table_periode.id

  LEFT JOIN
  (
    SELECT IdJoueur as id, COUNT(*) as nbMatches
    FROM filtered_joue
    GROUP BY IdJoueur
  ) as table_joue ON joueurs.IdJoueur = table_joue.id

  LEFT JOIN
  (
    SELECT IdJoueur as id, COUNT(*) as nbButs
    FROM filtered_buts
    GROUP BY IdJoueur
  ) as table_buts ON joueurs.IdJoueur = table_buts.id

  LEFT JOIN
  (
    SELECT IdJoueur as id, COUNT(*) as nbSaisons
    FROM (SELECT DISTINCT IdJoueur, Saison FROM filtered_joue)
    GROUP BY IdJoueur
  ) as table_saisons ON joueurs.IdJoueur = table_saisons.id

  LEFT JOIN
  (
    SELECT IdJoueur AS id, group_concat(SousTypeCompetition) as titres
    FROM
    (
      SELECT * FROM
      (
        SELECT DISTINCT filtered_joue.IdJoueur, palmares.Saison, SousTypeCompetition
        FROM palmares
        JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
        JOIN filtered_joue ON palmares.Match1 = filtered_joue.IdMatch
        WHERE palmares.titre = 1

        UNION

        SELECT DISTINCT filtered_joue.IdJoueur, palmares.Saison, SousTypeCompetition
        FROM palmares
        JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
        JOIN filtered_joue ON filtered_joue.Saison = palmares.Saison
        WHERE typecompetition='Championnat'
          AND palmares.titre = 1
      )
      ORDER BY
        CASE SousTypeCompetition
        WHEN 'C1' THEN 0
        WHEN 'C2' THEN 1
        WHEN 'C3' THEN 2
        WHEN 'C4' THEN 3
        WHEN 'IN' THEN 4
        WHEN 'FO' THEN 5
        WHEN 'L1' THEN 6
        WHEN 'D1' THEN 7
        WHEN 'D2' THEN 8
        WHEN 'CH' THEN 9
        WHEN 'CF' THEN 10
        WHEN 'CL' THEN 11
        WHEN 'TC' THEN 12
        END
    )
    GROUP BY IdJoueur
  ) as table_palmares ON joueurs.IdJoueur = table_palmares.id

  WHERE nbMatches > 0
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

respond($joueurs);

?>