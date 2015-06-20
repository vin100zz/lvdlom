<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode(),
                 new FiltreFonction());

// SQL
$dirigeants = DBAccess::query
("
	SELECT DISTINCT
    dirigeants.IdDirigeant as id,
    dirigeants.Nom as nom,
    dirigeants.Prenom as prenom,
    dirigeants.DateNaissance as dateNaissance,
    dirigeants.VilleNaissance as villeNaissance,
    dirigeants.TerritoireNaissance as territoireNaissance,
    dirigeants.DateDeces as dateDeces,
    dirigeants.Nationalite as nationalite,
    Poste as poste,
    dirigeants.IdJoueur as idJoueur,
    NbDocs as nbDocs,
    Periode as periode,
    Fonctions as fonctions
    
	FROM dirigeants
	LEFT JOIN dirige ON dirigeants.IdDirigeant = dirige.IdDirigeant
  
	LEFT JOIN matches
  
  LEFT JOIN joueurs ON joueurs.IdJoueur = dirigeants.IdJoueur
  
  LEFT JOIN
   (SELECT dirigeants.IdDirigeant, (strftime('%Y', Min(Debut)) || '-' || strftime('%Y', Max(Fin))) as Periode
    FROM dirigeants, dirige
    WHERE dirigeants.IdDirigeant = dirige.IdDirigeant
    GROUP BY dirigeants.IdDirigeant) AS table_periode ON dirigeants.IdDirigeant = table_periode.IdDirigeant
	
	LEFT JOIN
	 (SELECT IdObjet, COUNT(*) as NbDocs
	  FROM documentsAssoc
	  WHERE AssocType = 'E'
	  GROUP BY IdObjet) AS table_docs ON dirigeants.IdDirigeant = table_docs.IdObjet
    
  LEFT JOIN
	 (SELECT IdDirigeant, group_concat(Titre) as Fonctions
		FROM
		(
			SELECT dirigeants.IdDirigeant, Titre
			FROM dirigeants, dirige, fonctions
      WHERE dirigeants.IdDirigeant = dirige.IdDirigeant AND dirige.IdFonction = fonctions.IdFonction
		)
		GROUP BY IdDirigeant
	) as table_fonctions ON dirigeants.IdDirigeant = table_fonctions.IdDirigeant
	  
	WHERE DateMatch >= Debut AND DateMatch <= Fin
		AND " . Filters::getClause($filtres) . "
    
	ORDER BY Periode ASC, Nom ASC, Prenom ASC
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

respond($dirigeants);

?>