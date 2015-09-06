<?php

require_once 'utils/service.php';

// params
$idJoueur = intval(General::request("id"));


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// premier et dernier match
$datePremierMatch = DBAccess::singleValue
("
  SELECT DateMatch
  FROM matches
  WHERE DateMatch =
    (SELECT Min(DateMatch) FROM joue, matches
     WHERE joue.IdJoueur = $idJoueur AND joue.IdMatch = matches.IdMatch)
");

// dernier match
$dateDernierMatch = DBAccess::singleValue
("
  SELECT DateMatch
  FROM matches
  WHERE DateMatch =
    (SELECT Max(DateMatch) FROM joue, matches
     WHERE joue.IdJoueur = $idJoueur AND joue.IdMatch = matches.IdMatch)
");

// tous les matches
$matches = DBAccess::query
("
  SELECT
    IdMatch AS id,
    DateMatch AS date,
    Saison AS saison,
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
    RqScore as rqScore
  FROM matches
  LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
  LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
  WHERE DateMatch >= '$datePremierMatch'
    AND DateMatch <= '$dateDernierMatch'
  ORDER BY DateMatch ASC
");

// tous les matches joués
$joue = DBAccess::keyObj
("
  SELECT
    IdMatch AS id,
    Ordre AS ordre,
    MinuteRmp AS minuteRmp,
    NumRmp AS numRmp,
    carton AS carton
  FROM joue
  WHERE IdJoueur = $idJoueur
");

// tous les buts
$buts = DBAccess::keyVal
("
  SELECT
    IdMatch as id,
    COUNT(*) as nb
  FROM buteursom
  WHERE IdJoueur = $idJoueur
  GROUP BY IdMatch
");

// remplacements
$remplacements = DBAccess::query
("
  SELECT
    joue.IdMatch AS id,
    MinuteRmp AS minuteRmp
  FROM matches
  LEFT JOIN joue ON matches.IdMatch = joue.IdMatch
  WHERE DateMatch >= '$datePremierMatch'
    AND DateMatch <= '$dateDernierMatch'
    AND Ordre IS NULL
  ORDER BY joue.Id ASC
");


// ********************************************************
// ******* BOM ********************************************
// ********************************************************

$remplacementsAsKeyList = array();
for ($i=0; $i<count($remplacements); ++$i) {
  $rmp = $remplacements[$i];
  $matchId = $rmp["id"];
  if (!isset($remplacementsAsKeyList[$matchId])) {
    $remplacementsAsKeyList[$matchId] = array();
  }
  $remplacementsAsKeyList[$matchId][] = $rmp;
}

foreach ($joue as $id => $joueMatch) {
  // minute in
  $minuteIn = 0;
  if (!$joueMatch["ordre"]) {
    $minuteIn = $joue[$id]["minuteRmp"];
  }

  // minute out
  $minuteOut = null;
  if ($joueMatch["numRmp"]) {
    $minuteOut = $remplacementsAsKeyList[$id][$joueMatch["numRmp"]-1]["minuteRmp"];
  }

  $joue[$id]["minuteIn"] = $minuteIn;
  $joue[$id]["minuteOut"] = $minuteOut;
}


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

$out = array(
  "matches" => $matches,
  "joue" => $joue,
  "buts" => $buts
);

respond($out);

?>