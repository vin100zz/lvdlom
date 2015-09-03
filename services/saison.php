<?php

require_once 'utils/service.php';


// id saison
$idSaison = General::request("id");
$dateDebutSaison = substr($idSaison, 0, 4) . "-08-01";


// ********************************************************
// ******* SQL ********************************************
// ********************************************************
	
// bilan joueur par joueur
$listeComp = array();
$listeComp["ch"] = "Championnat";
$listeComp["cn"] = "Coupe Nationale";
$listeComp["ce"] = "Coupe d''Europe";
$bilan = array(); // tit, rmp et buts pour chaque compétition 

foreach($listeComp as $comp => $sqlComp)
{	
	// titulaire
	$bilan[$comp]["tit"] = DBAccess::query
	("
		SELECT
      joueurs.IdJoueur as id,
      Count(*) as total,
      julianday(date('$dateDebutSaison')) - julianday(DateNaissance) as age,
      Prenom as prenom,
      Nom as nom,
      Nationalite as nationalite,
      Poste as poste
		FROM joue, matches, joueurs, competitions
		WHERE Saison = '$idSaison'
			AND competitions.TypeCompetition = '$sqlComp'
			AND Ordre IS NOT NULL
			AND matches.Competition = competitions.NomCompetition
			AND joue.IdMatch = matches.IdMatch
			AND joue.IdJoueur = joueurs.IdJoueur
		GROUP BY joueurs.IdJoueur
	");	
	
	// remplacant
	$bilan[$comp]["rmp"] = DBAccess::query
	("
		SELECT
      joueurs.IdJoueur as id,
      Count(*) as total,
      julianday(date('$dateDebutSaison')) - julianday(DateNaissance) as age,
      Prenom as prenom,
      Nom as nom,
      Nationalite as nationalite,
      Poste as poste
		FROM joue, matches, joueurs, competitions
		WHERE Saison = '$idSaison'
			AND competitions.TypeCompetition = '$sqlComp'
			AND Ordre IS NULL
			AND matches.Competition = competitions.NomCompetition
			AND joue.IdMatch = matches.IdMatch
			AND joue.IdJoueur = joueurs.IdJoueur
		GROUP BY joueurs.IdJoueur
	");	
	
	// buts
	$bilan[$comp]["buts"] = DBAccess::query
	("
		SELECT
      joueurs.IdJoueur as id,
      Count(*) as total,
      julianday(date('$dateDebutSaison')) - julianday(DateNaissance) as age,
      Prenom as prenom,
      Nom as nom,
      Nationalite as nationalite,
      Poste as poste
		FROM buteursom, matches, joueurs, competitions
		WHERE Saison = '$idSaison'
			AND competitions.TypeCompetition = '$sqlComp'
			AND matches.Competition = competitions.NomCompetition
			AND buteursom.IdMatch = matches.IdMatch
			AND buteursom.IdJoueur = joueurs.IdJoueur
		GROUP BY joueurs.IdJoueur
	");	
}

// premier et dernier match
$firstMatch = DBAccess::singleValue
("
	SELECT MIN(DateMatch)
	FROM matches
	WHERE Saison = '$idSaison'
");
$lastMatch = DBAccess::singleValue
("
	SELECT MAX(DateMatch)
	FROM matches
	WHERE Saison = '$idSaison'
");

// dirigeants
$dirigeants = DBAccess::query
("
	SELECT
    dirigeants.IdDirigeant as id,
    Prenom as prenom,
    Nom as nom,
    Titre as titre,
    Debut as debut,
    Fin as fin
	FROM dirige, dirigeants, fonctions
	WHERE Fin >= '$firstMatch' AND Debut <= '$lastMatch'
		AND fonctions.IdFonction<>1
		AND dirigeants.IdDirigeant = dirige.IdDirigeant
		AND dirige.IdFonction = fonctions.IdFonction
	GROUP BY dirigeants.IdDirigeant
	ORDER BY fonctions.IdFonction ASC
");

// entraîneurs
$entraineurs = DBAccess::query
("
	SELECT
    dirigeants.IdDirigeant as id,
    Prenom as prenom,
    Nom as nom,
    MAX(DateMatch) as fin,
    count(*) as nbMatches
	FROM dirige, matches, dirigeants
	WHERE Fin >= '$firstMatch' AND Debut <= '$lastMatch'
		AND Saison = '$idSaison'
		AND IdFonction=1
		AND DateMatch >= Debut AND DateMatch <= Fin
		AND dirigeants.IdDirigeant = dirige.IdDirigeant
	GROUP BY dirigeants.IdDirigeant
");

// palmarès
$palmares = DBAccess::query
("
	SELECT
    NomCompetition as nomCompetition,
    TypeCompetition as typeCompetition,
    SousTypeCompetition as sousTypeCompetition,
    Bilan as bilan,
    Titre as titre,
    Match1 as match1,
    Match2 as match2
	FROM palmares
	LEFT JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
	WHERE Saison = '$idSaison'
	ORDER BY
  		CASE SousTypeCompetition
	    WHEN 'D1' THEN 0
	    WHEN 'L1' THEN 1
	    WHEN 'D2' THEN 2
	    WHEN 'CH' THEN 3
	    WHEN 'C1' THEN 4
	    WHEN 'C2' THEN 5
	    WHEN 'C3' THEN 6
	    WHEN 'FO' THEN 7
	    WHEN 'IN' THEN 8
	    WHEN 'CF' THEN 9
	    WHEN 'CL' THEN 10
	    WHEN 'TC' THEN 11
	  END
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
		AND AssocType = 'S'
		AND IdObjet = '$idSaison'
	ORDER BY OrdreAffichage ASC, DateDoc ASC
");

$prev = DBAccess::singleValue
("
	SELECT MAX(Saison)
	FROM saisons
	WHERE Saison < '$idSaison'
");

$next = DBAccess::singleValue
("
	SELECT MIN(Saison)
	FROM saisons
	WHERE Saison > '$idSaison'
");


// ********************************************************
// ******* BOM ********************************************
// ********************************************************

$bilanOrdonne = ordonnerBilan(listerJoueurs($bilan), $bilan);

for($i=0; $i<count($documents); ++$i)
{    
  $document = $documents[$i];
  $documents[$i]['path'] = Document::findPath($document['fichier']);
}

// first-last saison
function decorateJoueurWithFirstLastSaison ($joueur, $saison, $lastSaison) {

  $saisons = DBAccess::singleRow
  ("
    SELECT Min(Saison) as first, Max(Saison) as last
    FROM matches, joue
    WHERE matches.IdMatch = joue.IdMatch AND joue.IdJoueur = " . $joueur["joueur"]["id"]
  );
  $joueur["joueur"]["firstSaison"] = $saisons["first"] == $saison;
  $joueur["joueur"]["lastSaison"] = $saisons["last"] == $saison && $saison != $lastSaison;

 return $joueur;
}

$lastSaison = DBAccess::singleValue("SELECT Max(Saison) FROM Saisons");

for ($i=0; $i<count($bilanOrdonne); ++$i) {
  $bilanOrdonne[$i] = decorateJoueurWithFirstLastSaison($bilanOrdonne[$i], $idSaison, $lastSaison);
}


function decorateEntraineurWithFirstLastSaison ($entraineur, $saison, $dateLastMatch) {

  $saisons = DBAccess::singleRow
  ("
    SELECT Min(Saison) as first, Max(Saison) as last, Fin as fin
    FROM matches, dirige 
    WHERE dirige.IdDirigeant = " . $entraineur["id"] . "
          AND DateMatch >= Debut AND DateMatch <= Fin"
  );
  $entraineur["firstSaison"] = $saisons["first"] == $saison;
  $entraineur["lastSaison"] = $saisons["last"] == $saison && $dateLastMatch > $saisons["fin"];

 return $entraineur;
}

$dateLastMatch = DBAccess::singleValue("SELECT Max(DateMatch) FROM Matches");

foreach ($entraineurs as $key => $entraineur) {
  $entraineurs[$key] = decorateEntraineurWithFirstLastSaison($entraineur, $idSaison, $dateLastMatch);
}


// ********************************************************
// ******* HTML *******************************************
// ********************************************************  

$out = array(
  "id" => $idSaison,
  "bilan" => $bilanOrdonne,
  "palmares" => $palmares,
  "documents" => $documents,
  "dirigeants" => $dirigeants,
  "entraineurs" => $entraineurs,
  "navigation" => array(
    "prev" => $prev,
    "next" => $next)
);
respond($out);


//=========================================================================

function listerJoueurs($bilan)
{
	// on liste d'abord tous les joueurs
	$aJoueurs = array();
	foreach($bilan as $competition => $aStatsCompetition)
	{
		foreach($aStatsCompetition as $aStatType => $aStatsPerJoueur)
		{
			for($aJoueurCnt = 0; $aJoueurCnt < count($aStatsPerJoueur); ++$aJoueurCnt)
			{
				$aJoueurs[] = $aStatsPerJoueur[$aJoueurCnt]["id"];
			}
		}
	}
	
	$aJoueurs = array_values(array_unique($aJoueurs));
		
	return $aJoueurs;
}

//=========================================================================

function ordonnerBilan($iJoueursArray, $iBilan)
{	
	$aNewBilan = array();
	
	$aBilanCompetition = array();
	$aBilanCompetition["tit"] = 0;
	$aBilanCompetition["rmp"] = 0;
	$aBilanCompetition["buts"] = 0;
	
	$aNewTotalJoueur = array();
	$aNewTotalJoueur["total"] = $aBilanCompetition;
	$aNewTotalJoueur["ch"] = $aBilanCompetition;
	$aNewTotalJoueur["cn"] = $aBilanCompetition;
	$aNewTotalJoueur["ce"] = $aBilanCompetition;
		
	for($aCurrentJoueurCnt = 0; $aCurrentJoueurCnt < count($iJoueursArray); ++$aCurrentJoueurCnt)
	{
		$aCurrentJoueur = $iJoueursArray[$aCurrentJoueurCnt];
				
		$aTotalJoueur = $aNewTotalJoueur;
		
		// détail saison
		foreach($iBilan as $competition => $aStatsCompetition)
		{
			foreach($aStatsCompetition as $aStatType => $aStatsPerJoueur)
			{
				for($aJoueurCnt = 0; $aJoueurCnt < count($aStatsPerJoueur); ++$aJoueurCnt)
				{
					if($aStatsPerJoueur[$aJoueurCnt]["id"] == $aCurrentJoueur)
					{
						$aTotalJoueur["joueur"] = $aStatsPerJoueur[$aJoueurCnt];

						$aTotal = intval($aStatsPerJoueur[$aJoueurCnt]["total"]);
						$aTotalJoueur[$competition][$aStatType] = $aTotal;
						$aTotalJoueur["total"][$aStatType] += $aTotal;
					}
				}				
			}
		}
		
		$aNewBilan[] = $aTotalJoueur;
	}
		
	return $aNewBilan;
}

?>
