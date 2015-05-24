<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode(),
                 new FiltreNationalite(),
                 new FiltreAuClub(),
                 new FiltrePoste(),
                 new FiltreFormeAuClub(),
                 new FiltreLieuNaissance());

// SQL
$joueurs = DBAccess::query
("
	SELECT DISTINCT
    joueurs.IdJoueur AS id,
    Nom AS nom,
    Prenom AS prenom,
    Poste AS poste,
    DateNaissance AS dateNaissance,
    VilleNaissance AS villeNaissance,
    TerritoireNaissance AS territoireNaissance,
		Nationalite AS nationalite,
    Selections AS selections,
    ClubPrecedent AS clubPrecedent,
    ClubSuivant AS clubSuivant,
    DateDeces AS dateDeces,
    AuClub AS auClub,
    nbDocs,
    periode
    
  FROM joueurs
		  
	LEFT JOIN
	 (SELECT IdObjet, COUNT(*) as nbDocs
	  FROM documentsAssoc
	  WHERE AssocType = 'J'
	  GROUP BY IdObjet) AS table_docs ON joueurs.IdJoueur = table_docs.IdObjet	 
    
  LEFT JOIN
   (SELECT joueurs.IdJoueur, (strftime('%Y', Min(DateMatch)) || '-' || strftime('%Y', Max(DateMatch))) as periode
    FROM joueurs, joue, matches
    WHERE joue.IdJoueur = joueurs.IdJoueur AND joue.IdMatch = matches.IdMatch
    GROUP BY joueurs.IdJoueur) AS table_periode ON joueurs.IdJoueur = table_periode.IdJoueur	 
	  
	WHERE " . Filters::getClause($filtres) . "
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$json = $joueurs;
print json_encode($json, JSON_PRETTY_PRINT);

?>