<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltreAdversaire(),
                 new FiltreCompetition(),
                 new FiltreLieu(),
                 new FiltreJyEtais());
$filtresClause = Filters::getClause($filtres);

// SQL
$saisons = DBAccess::query
("	
	SELECT
    matches.Saison AS id,
    COUNT(*) as nbMatches,
    nbVictoires,
    nbNuls,
    SUM(ButsOM) AS bp,
    SUM(ButsAdv) AS bc,
    nbJoueurs,
    titres,
    finales,
    nbDocs 
  
	FROM matches
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	
	LEFT JOIN (SELECT Saison, COUNT(*) as nbVictoires
	FROM matches
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	WHERE ( ButsOM > ButsAdv OR (ButsOM = ButsAdv AND TABOM > TABAdv) ) AND $filtresClause
	GROUP BY Saison) as table_vict ON matches.Saison = table_vict.Saison
	
	LEFT JOIN (SELECT Saison, COUNT(*) as nbNuls
	FROM matches
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	WHERE (ButsOM = ButsAdv AND TABOM IS NULL) AND $filtresClause
	GROUP BY Saison) as table_nul ON matches.Saison = table_nul.Saison
	
	LEFT JOIN (SELECT Saison, COUNT(*) as nbJoueurs
	FROM
	(
		SELECT DISTINCT Saison, joueurs.IdJoueur
		FROM matches
		JOIN joue ON joue.IdMatch = matches.IdMatch
		JOIN joueurs ON joue.IdJoueur = joueurs.IdJoueur
		LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
		WHERE $filtresClause
	)
	GROUP BY Saison) as table_nbJ ON matches.Saison = table_nbJ.Saison
	
	LEFT JOIN
	(
		SELECT Saison, group_concat(SousTypeCompetition) as titres
		FROM
		(
			SELECT DISTINCT palmares.Saison, SousTypeCompetition
			FROM palmares
			JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
			JOIN matches ON matches.Competition = competitions.NomCompetition
			WHERE palmares.Titre = 1 AND $filtresClause
		)
		GROUP BY Saison
	) as table_titres ON matches.Saison = table_titres.Saison
	
	LEFT JOIN
	(
		SELECT Saison, group_concat(SousTypeCompetition) as finales
		FROM
		(
			SELECT DISTINCT palmares.Saison, SousTypeCompetition
			FROM palmares
			JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
			JOIN matches ON matches.Competition = competitions.NomCompetition
			WHERE palmares.Titre = 2 AND $filtresClause
		)
		GROUP BY Saison
	) as table_finales ON matches.Saison = table_finales.Saison
	
	LEFT JOIN
	 (SELECT IdObjet, COUNT(*) as nbDocs
	  FROM documentsAssoc
	  WHERE AssocType = 'S'
	  GROUP BY IdObjet) AS table_docs ON matches.Saison = table_docs.IdObjet
	
	WHERE matches.Saison <> '' AND $filtresClause
	
	GROUP BY matches.Saison
");

foreach($saisons as $key => $row)
{
  $saisons[$key]["nbDefaites"] = intval($row["nbMatches"]) - intval($row["nbVictoires"]) - intval($row["nbNuls"]);
  $saisons[$key]["diff"] = intval($row["bp"]) - intval($row["bc"]);
}


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

$json = $saisons;
print json_encode($json, JSON_PRETTY_PRINT);

?>