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


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$dict = array(
  "nationalites" => $nationalites,
  "saisons" => $saisons,
  "adversaires" => $adversaires,
  "fonctions" => $fonctions
);
respond($dict);

?>