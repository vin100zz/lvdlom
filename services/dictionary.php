<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// SQL
$nationalites = DBAccess::query
("
	SELECT DISTINCT	Nationalite AS key, Nationalite AS label
	FROM joueurs
  WHERE Nationalite IS NOT NULL AND Nationalite <> ''
  ORDER BY Nationalite
");

$saisons = DBAccess::query
("
	SELECT DISTINCT	Saison AS key, Saison AS label
	FROM saisons
  WHERE Saison IS NOT NULL AND Saison <> ''
  ORDER BY Saison DESC
");

$adversaires = DBAccess::query
("
	SELECT DISTINCT	IdAdversaire AS key, NomAdversaire AS label
	FROM adversaires
  ORDER BY NomAdversaire
");

$fonctions = DBAccess::query
("
	SELECT DISTINCT	IdFonction AS key, Titre AS label
	FROM fonctions
  ORDER BY Titre
");

$concatPrenomNom = "(" . General::handleNullStringsInSqlConcat("Prenom") . " || ' ' || Nom)";

$concatPrenomNomReverse = "(Nom || ' ' || " . General::handleNullStringsInSqlConcat("Prenom") . ")";

$joueurs = DBAccess::query
("
	SELECT DISTINCT	IdJoueur AS key, $concatPrenomNom AS label
	FROM joueurs
  ORDER BY Nom
");

$joueursAuClub = DBAccess::query
("
  SELECT DISTINCT IdJoueur AS key, $concatPrenomNomReverse AS label
  FROM joueurs
  WHERE (AuClub = 1 OR AuClub='Y')
  ORDER BY Nom
");

$dirigeants = DBAccess::query
("
	SELECT DISTINCT	IdDirigeant AS key, $concatPrenomNom AS label
	FROM dirigeants
  ORDER BY Nom
");

$matches = DBAccess::query
("
	SELECT DISTINCT	IdMatch AS key, (NomAdversaire || ',' || DateMatch || ',' || ButsOM || ',' || ButsAdv) AS label
	FROM matches
  JOIN adversaires ON adversaires.IdAdversaire = matches.Adversaire
  ORDER BY DateMatch
");

$sources = DBAccess::query
("
  SELECT DISTINCT Source AS key, Source AS label
  FROM documents
  WHERE Source <> ''
  ORDER BY Source COLLATE NOCASE ASC
");

$lieux = DBAccess::query
("
  SELECT DISTINCT Lieu AS key, Lieu AS label
  FROM matches
  WHERE Lieu <> ''
  ORDER BY Lieu
");

$competitions = DBAccess::query
("
  SELECT DISTINCT Competition AS key, Competition AS label
  FROM matches
  WHERE Competition <> ''
  ORDER BY Competition
");

$niveaux = DBAccess::query
("
  SELECT DISTINCT Niveau AS key, Niveau AS label
  FROM matches
  WHERE Niveau <> ''
  ORDER BY Niveau
");

$jyEtais = DBAccess::query
("
  SELECT DISTINCT JYEtais AS key, JYEtais AS label
  FROM matches
  WHERE JYEtais <> ''
  ORDER BY JYEtais
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$dict = array(
  "nationalites" => $nationalites,
  "saisons" => $saisons,
  "adversaires" => $adversaires,
  "fonctions" => $fonctions,
  "joueurs" => $joueurs,
  "joueursAuClub" => $joueursAuClub,
  "dirigeants" => $dirigeants,
  "matches" => $matches,
  "sources" => $sources,
  "lieux" => $lieux,
  "competitions" => $competitions,
  "niveaux" => $niveaux,
  "jyEtais" => $jyEtais
);
respond($dict);

?>