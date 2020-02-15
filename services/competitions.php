<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode(),
                 new FiltreSaison(),
                 new FiltreCompetition(),
                 new FiltreLieu(),
                 new FiltreJyEtais());

// SQL
$competitions = DBAccess::query
("
	SELECT
    competitions.SousTypeCompetition AS sousTypeCompetition,
    competitions.TypeCompetition AS typeCompetition,
    competitions.NomCompetition AS competition,
	  nbSaisons,
    nbMatches,
    nbVictoires,
    nbNuls,
    bp,
    bc,
    nbTitres,
    titres,
    nbFinales,
    finales
  
	FROM competitions
	
	LEFT JOIN
	(
		SELECT NomCompetition, count(*) as nbMatches
		FROM matches, competitions
		WHERE matches.Competition = competitions.NomCompetition
			AND " . Filters::getClause($filtres) . "
		GROUP BY competitions.NomCompetition
	) as table_matches ON competitions.NomCompetition = table_matches.NomCompetition
	
	LEFT JOIN
	(
		SELECT NomCompetition, count(*) as nbVictoires
		FROM matches, competitions
		WHERE matches.Competition = competitions.NomCompetition
			AND ( ButsOM > ButsAdv OR (ButsOM = ButsAdv AND TABOM > TABAdv) )
			AND " . Filters::getClause($filtres) . "
		GROUP BY competitions.NomCompetition
	) as table_vict ON competitions.NomCompetition = table_vict.NomCompetition
	
	LEFT JOIN
	(
		SELECT NomCompetition, count(*) as nbNuls
		FROM matches, competitions
		WHERE matches.Competition = competitions.NomCompetition
			AND (ButsOM = ButsAdv AND (TABOM IS NULL OR (TABOM=0 AND TABAdv=0)))
			AND " . Filters::getClause($filtres) . "
		GROUP BY competitions.NomCompetition
	) as table_nuls ON competitions.NomCompetition = table_nuls.NomCompetition
		
	LEFT JOIN
	(
		SELECT NomCompetition, count(*) as nbSaisons
		FROM
		(
			SELECT DISTINCT NomCompetition, saison
			FROM matches, competitions
			WHERE matches.Competition = competitions.NomCompetition
				AND " . Filters::getClause($filtres) . "
		)
		GROUP BY NomCompetition
	) as table_saisons ON competitions.NomCompetition = table_saisons.NomCompetition
	
	LEFT JOIN
	(
		SELECT NomCompetition, sum(ButsOM) as bp
		FROM matches, competitions
		WHERE matches.Competition = competitions.NomCompetition
			AND " . Filters::getClause($filtres) . "
		GROUP BY competitions.NomCompetition
	) as table_bp ON competitions.NomCompetition = table_bp.NomCompetition
	
	LEFT JOIN
	(
		SELECT NomCompetition, sum(ButsAdv) as bc
		FROM matches, competitions
		WHERE matches.Competition = competitions.NomCompetition
			AND " . Filters::getClause($filtres) . "
		GROUP BY competitions.NomCompetition
	) as table_bc ON competitions.NomCompetition = table_bc.NomCompetition
	
	LEFT JOIN
	(
		SELECT NomCompetition, count(*) as nbTitres, group_concat(Saison, '\n') as titres
		FROM
		(
			SELECT DISTINCT NomCompetition, palmares.Saison
			FROM palmares
			JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
			JOIN matches ON matches.Saison = palmares.Saison
			WHERE palmares.titre = 1
				AND " . Filters::getClause($filtres) . "
		)
		GROUP BY NomCompetition
	) as table_titres ON competitions.NomCompetition = table_titres.NomCompetition
	
	LEFT JOIN
	(
		SELECT NomCompetition, count(*) as nbFinales, group_concat(Saison, '\n') as finales
		FROM
		(
			SELECT DISTINCT NomCompetition, palmares.Saison
			FROM palmares
			JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
			JOIN matches ON matches.Saison = palmares.Saison
			WHERE palmares.titre = 2
				AND " . Filters::getClause($filtres) . "
		)
		GROUP BY NomCompetition
	) as table_finales ON competitions.NomCompetition = table_finales.NomCompetition
	
	WHERE nbMatches > 0
");

foreach($competitions as $key => $row)
{
  $competitions[$key]["id"] = $row["competition"];
  $competitions[$key]["nbDefaites"] = intval($row["nbMatches"]) - intval($row["nbVictoires"]) - intval($row["nbNuls"]);
  $competitions[$key]["diff"] = intval($row["bp"]) - intval($row["bc"]);
}


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

respond($competitions);

?>