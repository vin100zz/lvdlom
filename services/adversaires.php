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
$filtresClause = Filters::getClause($filtres);

// SQL
$adversaires = DBAccess::query
("
	SELECT
    table_total.IdAdversaire AS idAdv,
    NomAdversaire AS nomAdv,
    Pays AS pays,
    nbMatches,
    nbVictoires,
    nbNuls,
    bp,
    bc
	
	FROM
	(SELECT IdAdversaire, COUNT(*) as nbMatches
	FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	WHERE $filtresClause
	GROUP BY IdAdversaire) as table_total
	
	LEFT JOIN (SELECT IdAdversaire, COUNT(*) as nbVictoires
	FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	WHERE ( ButsOM > ButsAdv OR (ButsOM = ButsAdv AND TABOM > TABAdv) ) AND $filtresClause
	GROUP BY IdAdversaire) as table_vict ON table_total.IdAdversaire = table_vict.IdAdversaire
	
	LEFT JOIN (SELECT IdAdversaire, COUNT(*) as nbNuls
	FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	WHERE (ButsOM = ButsAdv AND (TABOM IS NULL OR (TABOM=0 AND TABAdv=0))) AND $filtresClause
	GROUP BY IdAdversaire) as table_nul ON table_total.IdAdversaire = table_nul.IdAdversaire
	
	LEFT JOIN (SELECT IdAdversaire, SUM(ButsOM) as bp, SUM(ButsAdv) as bc
	FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	WHERE $filtresClause
	GROUP BY IdAdversaire) as table_bp ON table_total.IdAdversaire = table_bp.IdAdversaire
	
	LEFT JOIN adversaires ON table_total.IdAdversaire = adversaires.IdAdversaire 
");

foreach($adversaires as $key => $row)
{
  $adversaires[$key]["id"] = intval($row["idAdv"]);
  $adversaires[$key]["nbDefaites"] = intval($row["nbMatches"]) - intval($row["nbVictoires"]) - intval($row["nbNuls"]);
  $adversaires[$key]["diff"] = intval($row["bp"]) - intval($row["bc"]);
}


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

respond($adversaires);

?>