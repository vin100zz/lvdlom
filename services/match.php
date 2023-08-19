<?php

require_once 'utils/service.php';


// params
$idMatch = intval(General::request("id"));


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// fiche match
$ficheMatch = DBAccess::singleRow
("
  SELECT
    IdMatch AS id,
    Saison AS saison,
    Lieu AS lieu,
    DateMatch AS date,
    Competition AS competition,
    Niveau AS niveau,
    Adversaire AS idAdv,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv,
    TABOM as tabOM,
    TABAdv as tabAdv,
    RqScore as rqScore,
    JYEtais as jyEtais,
    Spectateurs AS spectateurs,
    Class1 as class1,
    ClassPts1 as classPts1,
    Class2 as class2,
    ClassPts2 as classPts2,
    Class3 as class3,
    ClassPts3 as classPts3,
    Class4 as class4,
    ClassPts4 as classPts4,
    Commentaire as commentaire
  FROM matches
  WHERE IdMatch = $idMatch
");
$dateMatch = $ficheMatch["date"];

// adversaire
$adversaire = DBAccess::singleRow
("
  SELECT
    IdAdversaire AS id,
    NomAdversaire AS nom,
    Pays AS pays
  FROM adversaires
  WHERE adversaires.IdAdversaire = " . $ficheMatch['idAdv']
);

// competition
$competition = DBAccess::singleRow
("
  SELECT
    IdCompetition AS id,
    NomCompetition AS nom,
    SousTypeCompetition AS sousType,
    TypeCompetition AS type
  FROM competitions
  WHERE competitions.NomCompetition = '" . utf8_decode(str_replace("'", "''", $ficheMatch['competition'])) . "'" // FIXME
);

// buteurs OM
$buteursOM = DBAccess::query
("
  SELECT
    joueurs.IdJoueur AS id,
    joueurs.Prenom AS prenom,
    joueurs.Nom AS nom,
    buteursom.MinuteBut AS minute,
    buteursom.MinuteButExtra AS minuteExtra,
    buteursom.NoteBut AS note
  FROM matches, buteursom, joueurs
  WHERE buteursom.IdMatch = matches.IdMatch AND buteursom.IdJoueur = joueurs.IdJoueur AND buteursom.IdMatch = $idMatch
  ORDER BY buteursom.MinuteBut ASC
");

// buteurs OM autres
$buteursOMAutres = DBAccess::query
("
  SELECT
    buteursomautres.NomJoueur AS nom,
    buteursomautres.MinuteBut AS minute,
    buteursomautres.MinuteButExtra AS minuteExtra,
    buteursomautres.NoteBut AS note
  FROM matches, buteursomautres
  WHERE matches.IdMatch = buteursomautres.IdMatch AND buteursomautres.IdMatch = $idMatch
  ORDER BY buteursomautres.MinuteBut ASC
");

// buteurs adversaire
$buteursAdv = DBAccess::query
("
  SELECT
    buteursadv.NomJoueur AS nom,
    buteursadv.MinuteBut AS minute,
    buteursadv.MinuteButExtra AS minuteExtra,
    buteursadv.NoteBut AS note
  FROM matches, buteursadv
  WHERE matches.IdMatch = buteursadv.IdMatch AND buteursadv.IdMatch = $idMatch
  ORDER BY buteursadv.MinuteBut ASC
");

// titulaires
$titulaires = DBAccess::query
("
  SELECT
    joueurs.IdJoueur AS id,
    joueurs.Prenom AS prenom,
    joueurs.Nom AS nom,
    joue.NumRmp AS numRmp,
    joue.Carton AS carton,
    joueurs.Poste AS poste
  FROM matches, joue, joueurs
  WHERE matches.IdMatch = joue.IdMatch AND joueurs.IdJoueur = joue.IdJoueur AND Ordre IS NOT NULL AND joue.IdMatch = $idMatch
  ORDER BY Ordre ASC"
);

// remplacants
$remplacants = DBAccess::query
("
  SELECT
    joueurs.IdJoueur AS id,
    joueurs.Prenom AS prenom,
    joueurs.Nom AS nom,
    joue.MinuteRmp as minuteRmp,
    joue.Carton AS carton,
    joue.NumRmp AS numRmp,
    joueurs.Poste AS poste
  FROM matches, joue, joueurs
  WHERE matches.IdMatch = joue.IdMatch AND joueurs.IdJoueur = joue.IdJoueur AND Ordre IS NULL AND joue.IdMatch = $idMatch"
);

// entraineurs
$entraineurs = DBAccess::query
("
  SELECT
    dirigeants.IdDirigeant AS id,
    Prenom AS prenom,
    Nom AS nom
  FROM dirige, dirigeants
  WHERE IdFonction=1 AND dirige.IdDirigeant = dirigeants.IdDirigeant AND dirige.Debut <= '$dateMatch' AND dirige.Fin >= '$dateMatch'
");

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
    AND AssocType = 'M'
    AND IdObjet = $idMatch
  ORDER BY OrdreAffichage ASC, DateDoc ASC
");

// prev/next
$prev = DBAccess::singleRow
("
  SELECT
    IdMatch AS id,
    NomAdversaire AS nomAdv,
    DateMatch AS date,
    Lieu AS lieu,
    Competition AS competition,
    Niveau AS niveau,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv
  FROM matches, adversaires
  WHERE matches.Adversaire = adversaires.IdAdversaire AND DateMatch = (SELECT MAX(DateMatch) FROM matches WHERE DateMatch<'$dateMatch')
");

$next = DBAccess::singleRow
("
  SELECT
    IdMatch AS id,
    NomAdversaire AS nomAdv,
    DateMatch AS date,
    Lieu AS lieu,
    Competition AS competition,
    Niveau AS niveau,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv
  FROM matches, adversaires
  WHERE matches.Adversaire = adversaires.IdAdversaire AND DateMatch = (SELECT MIN(DateMatch) FROM matches WHERE DateMatch>'$dateMatch')
");

// first-last match
function decorateJoueurWithFirstLastMatch ($joueur, $dateMatch, $dateLastMatch) {

  $dates = DBAccess::singleRow
  ("
    SELECT Min(DateMatch) as firstMatch, Max(DateMatch) as lastMatch
    FROM matches, joue
    WHERE matches.IdMatch = joue.IdMatch AND joue.IdJoueur = " . $joueur["id"]
  );
  $joueur["firstMatch"] = $dates["firstMatch"] == $dateMatch;
  $joueur["lastMatch"] = $dates["lastMatch"] == $dateMatch && $dateMatch != $dateLastMatch;

 return $joueur;
}

$dateLastMatch = DBAccess::singleValue("SELECT Max(DateMatch) FROM matches");

foreach ($titulaires as $key => $joueur) {
  $titulaires[$key] = decorateJoueurWithFirstLastMatch($joueur, $dateMatch, $dateLastMatch);
}
foreach ($remplacants as $key => $joueur) {
  $remplacants[$key] = decorateJoueurWithFirstLastMatch($joueur, $dateMatch, $dateLastMatch);
}


function decorateEntraineurWithFirstLastMatch ($entraineur, $dateMatch, $dateLastMatch) {

  $dates = DBAccess::singleRow
  ("
    SELECT Min(DateMatch) as firstMatch, Max(DateMatch) as lastMatch
    FROM matches, dirige 
    WHERE dirige.IdDirigeant = " . $entraineur["id"] . "
          AND DateMatch >= Debut AND DateMatch <= Fin"
  );
  $entraineur["firstMatch"] = $dates["firstMatch"] == $dateMatch;
  $entraineur["lastMatch"] = $dates["lastMatch"] == $dateMatch && $dateMatch != $dateLastMatch;

 return $entraineur;
}

foreach ($entraineurs as $key => $entraineur) {
  $entraineurs[$key] = decorateEntraineurWithFirstLastMatch($entraineur, $dateMatch, $dateLastMatch);
}


// ********************************************************
// ******* BOM *******************************************
// ********************************************************

for ($i=0; $i<count($documents); ++$i)
{    
  $document = $documents[$i];
  $documents[$i]['path'] = Document::findPath($document['fichier']);
}


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

$out = array();
$out['id'] = $idMatch;
$out['fiche'] = $ficheMatch;
$out['adversaire'] = $adversaire;
$out['competition'] = $competition;
$out['buteurs'] = array(
  'om' => $buteursOM,
  'omAutres' => $buteursOMAutres,
  'adv' => $buteursAdv);
$out['joueurs'] = array(
  'titulaires' => $titulaires,
  'remplacants' => $remplacants);
$out['entraineurs'] = $entraineurs;
$out['documents'] = $documents;
$out['navigation'] = array(
  'prev' => $prev,
  'next' => $next);
respond($out);


//=========================================================================

function premierMatch($iDateMatch, $idJoueur)
{
  $aDatePremierMatch = DBAccess::singleValue
  ("
    SELECT Min(DateMatch) FROM matches, joue
    WHERE matches.IdMatch = joue.IdMatch AND joue.IdJoueur = $idJoueur
  ");
  return $aDatePremierMatch == $iDateMatch;
}

//=========================================================================

function dernierMatch($iDateMatch, $idJoueur)
{
  $aDateDernierMatch = DBAccess::singleValue
  ("
    SELECT Max(DateMatch) FROM matches, joue
    WHERE matches.IdMatch = joue.IdMatch AND joue.IdJoueur = $idJoueur
  ");
  return $aDateDernierMatch == $iDateMatch;
}

?>
