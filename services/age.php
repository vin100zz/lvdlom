<?php

require_once 'utils/service.php';

// params
$type = General::request("type");
$sort = General::request("sort");


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// SQL
$listeJoueurs = DBAccess::query
("
	SELECT
    IdJoueur AS id,
    Prenom as prenom,
    Nom as nom,
    AuClub as auClub
	FROM joueurs
  WHERE DateNaissance IS NOT NULL and DateNaissance > '1900-01-01'
");
 
// liste matches          
for($i=0; $i<count($listeJoueurs); ++$i)
{
  $joueur = $listeJoueurs[$i];
  $idJoueur = $joueur["id"];
  
  $criterion = ($sort == "min" ? 'Min' : 'Max');
  
  // match
  if ($type == "match") {
    $match = DBAccess::singleValue
    ("
      SELECT IdMatch as id
      FROM matches
      WHERE DateMatch =
        (SELECT $criterion(DateMatch) FROM joue, matches
         WHERE joue.IdJoueur = $idJoueur AND joue.IdMatch = matches.IdMatch)
    ");
  } else {
    $match = DBAccess::singleValue
    ("
      SELECT IdMatch as id
      FROM matches
      WHERE DateMatch =
        (SELECT $criterion(DateMatch) FROM buteursom, matches
         WHERE buteursom.IdJoueur = $idJoueur AND buteursom.IdMatch = matches.IdMatch)
    ");
  }
  $listeJoueurs[$i]['match'] = $match;
  
  $ageMatch = null;

  // age match
  if($match)
  {
    $ageMatch = DBAccess::singleValue
    ("
      SELECT julianday(DateMatch) - julianday(DateNaissance)
      FROM matches, joueurs
      WHERE matches.IdMatch = $match  AND joueurs.IdJoueur = $idJoueur
    ");
  }
  $listeJoueurs[$i]['age'] = $ageMatch;
}

// remove empty values
function noEmpty($joueur) {
  return $joueur['age'] != null;
}
$listeJoueurs = array_filter($listeJoueurs, "noEmpty");

// sort
function compare($a, $b) {
  global $sort;
  return ($sort == "min" ? 1 : -1) * ($a['age'] - $b['age']);
}
usort($listeJoueurs, "compare");

// keep 20 first
$listeJoueurs = array_slice($listeJoueurs, 0, 20);

respond($listeJoueurs);


?>