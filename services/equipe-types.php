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
      Nom as nom,
      Prenom AS prenom,
      Poste as poste,
      AuClub as auClub,
      nbTit,
      nbMatches

		FROM joueurs

    LEFT JOIN (
      SELECT joueurs.IdJoueur AS id, COUNT(*) as nbTit
      FROM joueurs, joue, matches
      WHERE Saison = '$id'
      AND joue.IdMatch = matches.IdMatch
      AND joue.IdJoueur = joueurs.IdJoueur
      AND Ordre IS NOT NULL
      GROUP BY joueurs.IdJoueur
    ) AS table_tit ON joueurs.IdJoueur = table_tit.id

    LEFT JOIN (
      SELECT joueurs.IdJoueur AS id, COUNT(*) as nbMatches
      FROM joueurs, joue, matches
      WHERE Saison = '$id'
      AND joue.IdMatch = matches.IdMatch
      AND joue.IdJoueur = joueurs.IdJoueur
      GROUP BY joueurs.IdJoueur
    ) AS table_matches ON joueurs.IdJoueur = table_matches.id  

    WHERE nbMatches > 0

    ORDER BY nbTit DESC
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

  // dirigeants
  $yearDebut = substr($id, 0, 4);
  $debut = $yearDebut . "-08-01";
  $fin = (intval($yearDebut)+1) . "-06-01";

  $dirigeants = DBAccess::query
  ("
    SELECT
      dirigeants.IdDirigeant as id, dirigeants.Prenom as prenom, dirigeants.Nom as nom, dirige.IdFonction as idFonction, fonctions.Titre as titre
    FROM dirigeants, dirige, fonctions
    WHERE (Debut <= '$fin' AND (Fin IS NULL OR Fin >= '$debut'))
      AND dirigeants.IdDirigeant = dirige.IdDirigeant
      AND dirige.IdFonction = fonctions.IdFonction
  ");
  
  $out[] = array(
    "id" => $id,
    "joueurs" => $joueurs,
    "buteurs" => $buteurs,
    "dirigeants" => $dirigeants
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
