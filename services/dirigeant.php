<?php

require_once 'utils/service.php';


// params
$idDirigeant = intval(General::request("id"));


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

$dirigeant = DBAccess::singleRow
(
	"SELECT
    Nom AS nom,
    Prenom AS prenom,
    DateNaissance AS dateNaissance,
    VilleNaissance AS villeNaissance,
    TerritoireNaissance AS territoireNaissance,
    Nationalite AS nationalite,
    DateDeces AS dateDeces,
    IdJoueur AS idJoueur
	FROM dirigeants
	WHERE IdDirigeant = " . $idDirigeant
);

// fonctions
$fonctions = DBAccess::query
(
	"SELECT
    fonctions.IdFonction AS id,
    Debut AS debut,
    Fin AS fin,
    Titre AS titre
	FROM dirige
	JOIN fonctions ON dirige.IdFonction = fonctions.IdFonction
	WHERE IdDirigeant = " . $idDirigeant . "
	ORDER BY Debut"
);

// documents
$documents = DBAccess::query
("
	SELECT
    Fichier AS fichier,
    DateDoc AS date,
    Source AS source,
    Legende AS legende
	FROM documents, documentsassoc
	WHERE documents.IdDoc = documentsassoc.IdDoc
		AND AssocType = 'D'
		AND IdObjet = $idDirigeant
	ORDER BY OrdreAffichage ASC, DateDoc ASC
");

// navigation
$nom = $dirigeant["nom"]; 
$prenom = $dirigeant["prenom"]; 

$concatNomPrenomRef = $nom . " " . $prenom;
$concatNomPrenomRef = utf8_decode(str_replace("'", "''", $concatNomPrenomRef));

$concatNomPrenomSql = "(Nom || ' ' || " . General::handleNullStringsInSqlConcat("Prenom") . ")";

$prev = DBAccess::singleRow
(
	"SELECT
    IdDirigeant AS id,
    Prenom AS prenom,
    Nom AS nom
	FROM dirigeants
	WHERE $concatNomPrenomSql = (SELECT MAX($concatNomPrenomSql) FROM dirigeants WHERE $concatNomPrenomSql < '$concatNomPrenomRef')"
);

$next = DBAccess::singleRow
(
	"SELECT
    IdDirigeant AS id,
    Prenom AS prenom,
    Nom AS nom
	FROM dirigeants
	WHERE $concatNomPrenomSql = (SELECT MIN($concatNomPrenomSql) FROM dirigeants WHERE $concatNomPrenomSql > '$concatNomPrenomRef')"
);


// ********************************************************
// ******* BOM ********************************************
// ********************************************************

for($i=0; $i<count($documents); ++$i)
{    
  $document = $documents[$i];
  $documents[$i]['path'] = Document::findPath($document['fichier']);
}


// ********************************************************
// ******* JSON *******************************************
// ******************************************************** 

$out = array();
$out['id'] = $idDirigeant;
$out['fiche'] = $dirigeant;
$out['fonctions'] = $fonctions;
$out['documents'] = $documents;
$out['navigation'] = array(
  'prev' => $prev,
  'next' => $next);
respond($out);


?>
