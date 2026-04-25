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
$bilan = array(); // tit, rmp et buts pour chaque comp�tition 

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

// premier et dernier match (une seule requête au lieu de deux)
$matchRange = DBAccess::singleRow
("
	SELECT MIN(DateMatch) AS firstMatch, MAX(DateMatch) AS lastMatch
	FROM matches
	WHERE Saison = '$idSaison'
");
$firstMatch = $matchRange['firstMatch'];
$lastMatch  = $matchRange['lastMatch'];

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
	WHERE (Fin is NULL OR Fin >= '$firstMatch') AND Debut <= '$lastMatch'
		AND fonctions.IdFonction<>1
		AND dirigeants.IdDirigeant = dirige.IdDirigeant
		AND dirige.IdFonction = fonctions.IdFonction
	GROUP BY dirigeants.IdDirigeant
	ORDER BY fonctions.IdFonction ASC
");

// entra�neurs
$entraineurs = DBAccess::query
("
	SELECT
    dirigeants.IdDirigeant as id,
    Prenom as prenom,
    Nom as nom,
	Fin as fin,
    count(*) as nbMatches
	FROM dirige, matches, dirigeants
	WHERE (Fin is NULL OR Fin >= '$firstMatch') AND Debut <= '$lastMatch'
		AND Saison = '$idSaison'
		AND IdFonction=1
		AND DateMatch >= Debut AND (Fin is NULL OR DateMatch <= Fin)
		AND dirigeants.IdDirigeant = dirige.IdDirigeant
	GROUP BY dirigeants.IdDirigeant
");

// palmar�s
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
	    WHEN 'C4' THEN 7
	    WHEN 'FO' THEN 8
	    WHEN 'IN' THEN 9
	    WHEN 'CF' THEN 10
	    WHEN 'CL' THEN 11
	    WHEN 'TC' THEN 12
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

$lastSaison = DBAccess::singleValue("SELECT Max(Saison) FROM Saisons");

// batch : first/last saison pour tous les joueurs en une seule requête
$joueurIds = array_map(function($j) { return intval($j["joueur"]["id"]); }, $bilanOrdonne);
if (!empty($joueurIds)) {
  $idsStr   = implode(',', $joueurIds);
  $rows     = DBAccess::query
  ("
    SELECT joue.IdJoueur AS id, Min(Saison) AS first, Max(Saison) AS last
    FROM matches
    JOIN joue ON matches.IdMatch = joue.IdMatch
    WHERE joue.IdJoueur IN ($idsStr)
    GROUP BY joue.IdJoueur
  ");
  $saisonsMap = array();
  foreach ($rows as $row) {
    $saisonsMap[$row["id"]] = $row;
  }
  for ($i = 0; $i < count($bilanOrdonne); ++$i) {
    $id = $bilanOrdonne[$i]["joueur"]["id"];
    $bilanOrdonne[$i]["joueur"]["firstSaison"] = isset($saisonsMap[$id]) && $saisonsMap[$id]["first"] == $idSaison;
    $bilanOrdonne[$i]["joueur"]["lastSaison"]  = isset($saisonsMap[$id]) && $saisonsMap[$id]["last"]  == $idSaison && $idSaison != $lastSaison;
  }
}

$dateLastMatch = DBAccess::singleValue("SELECT Max(DateMatch) FROM Matches");

// batch : first/last saison pour tous les entraîneurs en une seule requête
$entraineurIds = array_map(function($e) { return intval($e["id"]); }, $entraineurs);
if (!empty($entraineurIds)) {
  $entrIdsStr = implode(',', $entraineurIds);
  $entrRows   = DBAccess::query
  ("
    SELECT dirige.IdDirigeant AS id,
           Min(Saison)        AS first,
           Max(Saison)        AS last,
           Max(dirige.Fin)    AS fin
    FROM matches
    JOIN dirige ON DateMatch >= dirige.Debut AND DateMatch <= dirige.Fin
    WHERE dirige.IdDirigeant IN ($entrIdsStr)
    GROUP BY dirige.IdDirigeant
  ");
  $entrsaisonsMap = array();
  foreach ($entrRows as $row) {
    $entrsaisonsMap[$row["id"]] = $row;
  }
  foreach ($entraineurs as $key => $entraineur) {
    $id = $entraineur["id"];
    $entraineurs[$key]["firstSaison"] = isset($entrsaisonsMap[$id]) && $entrsaisonsMap[$id]["first"] == $idSaison;
    $entraineurs[$key]["lastSaison"]  = isset($entrsaisonsMap[$id]) && $entrsaisonsMap[$id]["last"]  == $idSaison && $dateLastMatch > $entrsaisonsMap[$id]["fin"];
  }
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

$text = "../documents/commentaires/saison/$idSaison/index.html";
if (is_file($text) && $desc = implode(file($text)))
{
	$desc = utf8_encode($desc);
	$desc = str_replace("@PATH@", "documents/commentaires/saison/$idSaison", $desc);
	$out['commentaires'] = $desc;
}

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
		
		// d�tail saison
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
