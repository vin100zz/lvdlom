<?php

require_once 'utils/service.php';

// ********************************************************
// ******* Web Scrapping **********************************
// ********************************************************

function htmlToUtf8 ($input) {
  $output = html_entity_decode ($input);
  $output = str_replace("&acut;", "à", $output);
  $output = str_replace("&acirc;", "â", $output);
  $output = str_replace("&auml;", "ä", $output);
  $output = str_replace("&ecut;", "é", $output);
  $output = str_replace("&egrav;", "è", $output);
  $output = str_replace("&ecirc;", "ê", $output);
  $output = str_replace("&euml;", "ë", $output);
  return $output;
}

$prochainsMatches = array();

$htmlSource = file_get_contents('http://www.footmarseille.com');
preg_match_all("/div class=\"affichematch\">(.*?)div/", $htmlSource, $htmlNextGame, PREG_SET_ORDER);

for($i = 1; $i < count($htmlNextGame); ++$i)
{
  $nextGame = $htmlNextGame[$i][1];
  
  preg_match("/<span>(.*?)<\/span>/", $nextGame, $equipes);
  
  if(count($equipes) > 0)
  {    
    $equipes = $equipes[1];
    
    $equipesDateTele = explode("<br />", $nextGame);
    $date = utf8_encode($equipesDateTele[1]);
    
    $tele = $equipesDateTele[2];        	      	
    $tele = substr($tele, 0, strpos($tele, "</p>"));
    
    $prochainsMatches[] = array("match" => htmlToUtf8($equipes), "date" => $date, "tele" => htmlToUtf8($tele));
  }
}


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// dernier match
$ficheMatch = DBAccess::singleRow
("
  SELECT *
  FROM matches, adversaires
  WHERE matches.Adversaire = adversaires.IdAdversaire
    AND DateMatch =
  (
    SELECT MAX(DateMatch)
    FROM matches
  )
");
$domicile = General::domicile($ficheMatch) || General::neutre($ficheMatch);
$clubGauche = ($domicile ? "OM" : $ficheMatch["NomAdversaire"]);
$clubDroite = ($domicile ? $ficheMatch["NomAdversaire"] : "OM");
$butsGauche = ($domicile ? $ficheMatch["ButsOM"] : $ficheMatch["ButsAdv"]);
$butsDroite = ($domicile ? $ficheMatch["ButsAdv"] : $ficheMatch["ButsOM"]);

$dernierMatch = array(
  "id" => $ficheMatch["IdMatch"],
  "clubGauche" => $clubGauche,
  "clubDroite" => $clubDroite,
  "butsGauche" => $butsGauche,
  "butsDroite" => $butsDroite
);
    

// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$json = array(
  "prochainsMatches" => $prochainsMatches,
  "dernierMatch" => $dernierMatch
);
print json_encode($json, JSON_PRETTY_PRINT);

?>