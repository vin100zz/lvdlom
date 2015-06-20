<?php

require_once 'utils/service.php';

// date
$date = General::request("date");


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// naissances
$dirigeants = DBAccess::query(
"
	SELECT
    IdDirigeant as id
	FROM dirigeants
	WHERE strftime('%m-%d', DateNaissance) = '$date'
	ORDER BY DateNaissance, Nom
");
$joueurs = DBAccess::query(
"
	SELECT
    IdJoueur as id
	FROM joueurs
	WHERE strftime('%m-%d', DateNaissance) = '$date'
	ORDER BY DateNaissance, Nom
");

// matches
$matches = DBAccess::query(
"
	SELECT
    IdMatch as id
	FROM matches, adversaires, competitions
	WHERE matches.Adversaire = adversaires.IdAdversaire
		AND strftime('%m-%d', DateMatch) = '$date'
		AND competitions.NomCompetition = matches.Competition
	ORDER BY Saison
");
    

// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$out = array(
  "date" => $date,
  "dirigeants" => $dirigeants,
  "joueurs" => $joueurs,
  "matches" => $matches
);
respond($out);

?>