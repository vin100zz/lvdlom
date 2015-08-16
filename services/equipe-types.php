<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

$saisons = DBAccess::singleColumn
("
  SELECT Saison
  FROM Saisons
  ORDER BY Saison ASC
");

$out = array();

for($i=0; $i<count($saisons); $i++)
{
	$id = $saisons[$i];
  $bilan = array();
	
  // joueurs
	$joueurs = DBAccess::query
	("
		SELECT
      joueurs.IdJoueur as id,
      COUNT(*) as nbMatches,
      Nom as nom,
      Prenom AS prenom,
      Poste as poste,
      AuClub as auClub
		FROM joue, matches, joueurs
		WHERE Saison = '$id'
			AND joue.IdMatch = matches.IdMatch
			AND joue.IdJoueur = joueurs.IdJoueur
      AND Ordre IS NOT NULL
		GROUP BY joueurs.IdJoueur
    ORDER BY nbMatches DESC
	");	
	
	// buteurs
	$buteurs = DBAccess::query
	("
		SELECT
      joueurs.IdJoueur as id,
      Count(*) as nbButs
		FROM buteursom, matches, joueurs
		WHERE Saison = '$id'
			AND buteursom.IdMatch = matches.IdMatch
			AND buteursom.IdJoueur = joueurs.IdJoueur
		GROUP BY joueurs.IdJoueur
	");
  
  $out[] = array(
    "id" => $id,
    "joueurs" => $joueurs,
    "buteurs" => $buteurs
  );
}

// ********************************************************
// ******* BOM ********************************************
// ********************************************************




// ********************************************************
// ******* HTML *******************************************
// ********************************************************  

respond($out);


?>
