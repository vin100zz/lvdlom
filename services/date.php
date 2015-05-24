<?php

require_once 'utils/service.php';

// date
$date = General::request("date");
if(!$date)
{
	$date = date("m-d");
}


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// naissances
$dirigeants = DBAccess::query(
"
	SELECT
    IdDirigeant AS id,
    Nom AS nom,
    Prenom AS prenom,
    Nationalite AS nationalite,
    strftime('%Y', DateNaissance) as dateNaissance
	FROM dirigeants
	WHERE strftime('%m-%d', DateNaissance) = '$date'
	ORDER BY DateNaissance, Nom
");
$joueurs = DBAccess::query(
"
	SELECT
    IdJoueur AS id,
    Nom AS nom,
    Prenom AS prenom,
    Nationalite AS nationalite,
    Poste AS poste,
    strftime('%Y', DateNaissance) as dateNaissance
	FROM joueurs
	WHERE strftime('%m-%d', DateNaissance) = '$date'
	ORDER BY DateNaissance, Nom
");

// matches
$matches = DBAccess::query(
"
	SELECT
    IdMatch AS id,
    DateMatch AS date,
    Saison AS saison,
    Competition AS competition,
    SousTypeCompetition AS sousTypeCompetition,
    Lieu AS lieu,
    Niveau AS niveau,
    IdAdversaire AS idAdv,
    NomAdversaire AS nomAdv,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv,
    RqScore AS rqScore,
    TABOM AS tabOM,
    TABAdv AS tabAdv,
    Pays AS pays
	FROM matches, adversaires, competitions
	WHERE matches.Adversaire = adversaires.IdAdversaire
		AND strftime('%m-%d', DateMatch) = '$date'
		AND competitions.NomCompetition = matches.Competition
	ORDER BY Saison
");
    

// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$json = array(
  "date" => $date,
  "dirigeants" => $dirigeants,
  "joueurs" => $joueurs,
  "matches" => $matches,
);
print json_encode($json, JSON_PRETTY_PRINT);

?>