<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode(),
                 new FiltreSaison(),
                 new FiltreAdversaire(),
                 new FiltreCompetition(),
                 new FiltreLieu(),
                 new FiltreJyEtais());

// SQL
$matches = DBAccess::query
("
	SELECT DISTINCT
    matches.IdMatch AS id,
    DateMatch AS date,
    Competition AS competition,
    SousTypeCompetition AS sousTypeCompetition,
    Niveau AS niveau,
    Lieu AS lieu,
	Pays AS pays,
    IdAdversaire AS idAdv,
    NomAdversaire AS nomAdv,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv,
    TABOM as tabOM,
    TABAdv as tabAdv,
    RqScore as rqScore,
    JYEtais as jyEtais,
    NbDocs as nbDocs
	 FROM matches
	 LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	 LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
	 LEFT JOIN
	 (SELECT IdObjet, COUNT(*) as NbDocs
	  FROM documentsAssoc
	  WHERE AssocType = 'M'
	  GROUP BY IdObjet) AS table_docs ON matches.IdMatch = table_docs.IdObjet	 
	 
	 WHERE " . Filters::getClause($filtres) . "
	 ORDER BY DateMatch ASC
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

respond($matches);

?>