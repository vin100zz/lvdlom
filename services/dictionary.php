﻿<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

function handleNullStrings ($column) {
  return "(case when $column is null then '' else $column || ' ' end)";
};

// SQL
$nationalites = DBAccess::query
("
	SELECT DISTINCT	Nationalite AS key, Nationalite AS label
	FROM joueurs
  WHERE Nationalite IS NOT NULL AND Nationalite <> ''
  ORDER BY Nationalite
");

$saisons = DBAccess::query
("
	SELECT DISTINCT	Saison AS key, Saison AS label
	FROM matches
  WHERE Saison IS NOT NULL AND Saison <> ''
  ORDER BY Saison DESC
");

$adversaires = DBAccess::query
("
	SELECT DISTINCT	IdAdversaire AS key, NomAdversaire AS label
	FROM adversaires
  ORDER BY NomAdversaire
");

$fonctions = DBAccess::query
("
	SELECT DISTINCT	IdFonction AS key, Titre AS label
	FROM fonctions
  ORDER BY Titre
");

$joueurs = DBAccess::query
("
	SELECT DISTINCT	IdJoueur AS key, (" . handleNullStrings("Prenom") . " || Nom) AS label
	FROM joueurs
  ORDER BY Nom
");

$dirigeants = DBAccess::query
("
	SELECT DISTINCT	IdDirigeant AS key, (" . handleNullStrings("Prenom") . " || Nom) AS label
	FROM dirigeants
  ORDER BY Nom
");

$matches = DBAccess::query
("
	SELECT DISTINCT	IdMatch AS key, (NomAdversaire || ',' || DateMatch || ',' || ButsOM || ',' || ButsAdv) AS label
	FROM matches
  JOIN adversaires ON adversaires.IdAdversaire = matches.Adversaire
  ORDER BY DateMatch
");

$sources = DBAccess::query
("
  SELECT DISTINCT Source AS key, Source AS label
  FROM documents
  WHERE Source <> ''
  ORDER BY Source
");

$lieux = DBAccess::query
("
  SELECT DISTINCT Lieu AS key, Lieu AS label
  FROM matches
  WHERE Lieu <> ''
  ORDER BY Lieu
");

$competitions = DBAccess::query
("
  SELECT DISTINCT Competition AS key, Competition AS label
  FROM matches
  WHERE Competition <> ''
  ORDER BY Competition
");

$niveaux = DBAccess::query
("
  SELECT DISTINCT Niveau AS key, Niveau AS label
  FROM matches
  WHERE Niveau <> ''
  ORDER BY Niveau
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$dict = array(
  "nationalites" => $nationalites,
  "saisons" => $saisons,
  "adversaires" => $adversaires,
  "fonctions" => $fonctions,
  "joueurs" => $joueurs,
  "dirigeants" => $dirigeants,
  "matches" => $matches,
  "sources" => $sources,
  "lieux" => $lieux,
  "competitions" => $competitions,
  "niveaux" => $niveaux
);
respond($dict);

?>