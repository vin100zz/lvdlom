<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

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
	SELECT DISTINCT	IdJoueur AS key, (Prenom || ' ' || Nom) AS label
	FROM joueurs
  ORDER BY Nom
");

$dirigeants = DBAccess::query
("
	SELECT DISTINCT	IdDirigeant AS key, (Prenom || ' ' || Nom) AS label
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
  "matches" => $matches
);
respond($dict);

?>