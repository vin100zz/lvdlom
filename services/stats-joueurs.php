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

// SQL
$joueurs = DBAccess::query
("
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
		SELECT joueurs.IdJoueur AS id, COUNT(*) as nbMatches
		FROM joue
		JOIN matches ON joue.IdMatch = matches.IdMatch 
		JOIN joueurs ON joue.IdJoueur = joueurs.IdJoueur
		WHERE " . Filters::getClause($filtres) . "
		GROUP BY joueurs.IdJoueur
	) as table_joue ON joueurs.IdJoueur = table_joue.id
		
	LEFT JOIN
	(
		SELECT joueurs.IdJoueur AS id, COUNT(*) as nbButs
		FROM buteursom
		JOIN matches ON buteursom.IdMatch = matches.IdMatch 
		JOIN joueurs ON buteursom.IdJoueur = joueurs.IdJoueur
		WHERE " . Filters::getClause($filtres) . "
		GROUP BY joueurs.IdJoueur
	) as table_buts ON joueurs.IdJoueur = table_buts.id
	
	LEFT JOIN
	(
		SELECT IdJoueur AS id, COUNT(*) as nbSaisons
		FROM
		(
			SELECT DISTINCT joueurs.IdJoueur AS IdJoueur, Saison
			FROM matches
			JOIN joue ON joue.IdMatch = matches.IdMatch
			JOIN joueurs ON joue.IdJoueur = joueurs.IdJoueur
			WHERE " . Filters::getClause($filtres) . "
		)
		GROUP BY IdJoueur
	) as table_saisons ON joueurs.IdJoueur = table_saisons.id
	
	LEFT JOIN
	(
		SELECT IdJoueur AS id, group_concat(SousTypeCompetition) as titres
		FROM
    (
      SELECT * FROM
      (
        SELECT DISTINCT joueurs.IdJoueur, palmares.Saison, SousTypeCompetition
        FROM palmares
        JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
        JOIN joue ON palmares.Match1 = joue.IdMatch
        JOIN matches ON joue.IdMatch = matches.IdMatch
        JOIN joueurs ON joue.IdJoueur = joueurs.IdJoueur
        WHERE palmares.titre = 1
          AND " . Filters::getClause($filtres) . "
        
        UNION
        
        SELECT DISTINCT joueurs.IdJoueur, palmares.Saison, SousTypeCompetition
        FROM palmares
        JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
        JOIN matches ON matches.Saison = palmares.Saison
        JOIN joue ON matches.IdMatch = joue.IdMatch
        JOIN joueurs ON joue.IdJoueur = joueurs.IdJoueur
        WHERE typecompetition='Championnat'
          AND palmares.titre = 1
          AND " . Filters::getClause($filtres) . "
      )
      ORDER BY
        CASE SousTypeCompetition
        WHEN 'C1' THEN 0
        WHEN 'C2' THEN 1
        WHEN 'C3' THEN 2
        WHEN 'IN' THEN 3
        WHEN 'FO' THEN 4
        WHEN 'L1' THEN 5
        WHEN 'D1' THEN 6
        WHEN 'D2' THEN 7
        WHEN 'CH' THEN 8
        WHEN 'CF' THEN 9
        WHEN 'CL' THEN 10
        WHEN 'TC' THEN 11
      END
    )
		GROUP BY IdJoueur
	) as table_palmares ON joueurs.IdJoueur = table_palmares.id
	
	WHERE nbMatches > 0
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$json = $joueurs;
print json_encode($json, JSON_PRETTY_PRINT);

?>