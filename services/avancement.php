<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

$matches = DBAccess::query
("
  SELECT
    IdMatch AS id,
    Saison AS saison,
    NomAdversaire AS adversaire,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv,
    NbDocs AS nbDocs
  FROM matches
  LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
  LEFT JOIN
  (SELECT IdObjet, COUNT(*) as NbDocs
  FROM documentsAssoc
  WHERE AssocType = 'M'
  GROUP BY IdObjet) AS table_docs ON matches.IdMatch = table_docs.IdObjet  
  ORDER BY DateMatch ASC
");

$joueurs = DBAccess::query
("
  SELECT
    IdJoueur AS id,
    Prenom AS prenom,
    Nom AS nom,
    NbDocs AS nbDocs
  FROM joueurs
  LEFT JOIN
  (SELECT IdObjet, COUNT(*) as NbDocs
  FROM documentsAssoc
  WHERE AssocType = 'J'
  GROUP BY IdObjet) AS table_docs ON joueurs.IdJoueur = table_docs.IdObjet   
  ORDER BY Nom ASC, Prenom ASC
");

$dirigeants = DBAccess::query
("
  SELECT
    IdDirigeant AS id,
    Prenom AS prenom,
    Nom AS nom,
    NbDocs AS nbDocs
  FROM dirigeants
  LEFT JOIN
  (SELECT IdObjet, COUNT(*) as NbDocs
  FROM documentsAssoc
  WHERE AssocType = 'D'
  GROUP BY IdObjet) AS table_docs ON dirigeants.IdDirigeant = table_docs.IdObjet   
  ORDER BY Nom ASC, Prenom ASC
");

$saisons = DBAccess::query
("
  SELECT
    saison AS id,
    NbDocs AS nbDocs
  FROM saisons
  LEFT JOIN
  (SELECT IdObjet, COUNT(*) as NbDocs
  FROM documentsAssoc
  WHERE AssocType = 'S'
  GROUP BY IdObjet) AS table_docs ON saisons.saison = table_docs.IdObjet   
  ORDER BY id ASC
");


// ********************************************************
// ******* BOM ********************************************
// ********************************************************






// ********************************************************
// ******* JSON ********************************************
// ********************************************************

$out = array(
  "matches" => $matches,
  "joueurs" => $joueurs,
  "dirigeants" => $dirigeants,
  "saisons" => $saisons,
  "idJoueurs" => scandir("../documents/id_joueurs"),
  "idDirigeants" => scandir("../documents/id_dirigeants"),
  "idSaisons" => scandir("../documents/id_saisons")
);

print json_encode($out, JSON_PRETTY_PRINT);


?>