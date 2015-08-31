<?php

require_once 'utils/service.php';


// params
$idJoueur = intval(General::request("id"));


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

$joueur = DBAccess::singleRow
(
	"SELECT
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
    AuClub AS auClub
	FROM joueurs
	WHERE IdJoueur = " . $idJoueur
);

// bilan saison par saison
$listeComp = array();
$listeComp["ch"] = "Championnat";
$listeComp["cn"] = "Coupe Nationale";
$listeComp["ce"] = "Coupe d''Europe";
$sqlBilan = array(); // tit, rmp et buts pour chaque compétition 

foreach($listeComp as $comp => $sqlComp)
{
	// titulaire   
	$sqlBilan[$comp]["tit"] = DBAccess::keyVal
	(
		"SELECT Saison, Count(*) as nbTot
		FROM joue, matches, competitions
		WHERE joue.IdJoueur = $idJoueur
			AND competitions.TypeCompetition = '$sqlComp'
			AND Ordre IS NOT NULL
			AND matches.Competition = competitions.NomCompetition AND joue.IdMatch = matches.IdMatch
		GROUP BY Saison
		ORDER BY Saison ASC"
	);
	
	// remplacant
	$sqlBilan[$comp]["rmp"] = DBAccess::keyVal
	(
		"SELECT Saison, Count(*) as nbTot
		FROM joue, matches, competitions
		WHERE joue.IdJoueur = $idJoueur
			AND competitions.TypeCompetition = '$sqlComp'
			AND Ordre IS NULL
			AND matches.Competition = competitions.NomCompetition AND joue.IdMatch = matches.IdMatch
		GROUP BY Saison
		ORDER BY Saison ASC"
	);
	
	// buts
	$sqlBilan[$comp]["buts"] = DBAccess::keyVal
	(
		"SELECT Saison, Count(*) as nbTot
		FROM buteursom, matches, competitions
		WHERE buteursom.IdJoueur = $idJoueur
			AND competitions.TypeCompetition = '$sqlComp'
			AND matches.Competition = competitions.NomCompetition AND buteursom.IdMatch=matches.IdMatch
		GROUP BY Saison
		ORDER BY Saison ASC"
	);
}

$selectMatch =
"SELECT
  IdMatch AS id,
  Saison AS saison,
  Lieu AS lieu,
  DateMatch AS date,
  Competition AS competition,
  SousTypeCompetition AS sousTypeCompetition,
  Niveau AS niveau,
  Adversaire AS idAdv,
  NomAdversaire AS nomAdv,
  ButsOM AS butsOM,
  ButsAdv AS butsAdv,
  TABOM as tabOM,
  TABAdv as tabAdv,
  RqScore as rqScore 
";

// premier match
$premierMatch = DBAccess::singleRow
("$selectMatch
  FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON competitions.NomCompetition = matches.competition
	WHERE DateMatch =
	  (SELECT Min(DateMatch) FROM joue, matches
	   WHERE joue.IdJoueur = $idJoueur AND joue.IdMatch = matches.IdMatch)
");

// age premier match
$agePremierMatch = null;
if($premierMatch)
{
	$agePremierMatch = DBAccess::singleValue
	("
		SELECT julianday(DateMatch) - julianday(DateNaissance)
		FROM joue, matches, joueurs
		WHERE matches.IdMatch=" . $premierMatch["id"] . " AND joue.IdJoueur = $idJoueur
		 AND joueurs.IdJoueur = $idJoueur
	");
}

// premier but
$premierBut = DBAccess::singleRow
("$selectMatch
  FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON competitions.NomCompetition = matches.competition
	WHERE DateMatch =
	  (SELECT Min(DateMatch) FROM buteursom, matches
	   WHERE buteursom.IdJoueur = $idJoueur AND matches.IdMatch = buteursom.IdMatch)
");

$nbMatchesAvantPremierBut = null;
if(count($premierBut)>0)
{    	
	// quantième match du premier but
	$nbMatchesAvantPremierBut = DBAccess::singleValue
	(
		"SELECT Count(*)
		FROM (SELECT DISTINCT matches.IdMatch
		      FROM joue, matches 
		      WHERE joue.IdJoueur = $idJoueur 
		      AND DateMatch < (SELECT Min(DateMatch)
		                       FROM buteursom, matches
		                       WHERE buteursom.IdJoueur = $idJoueur AND matches.IdMatch = buteursom.IdMatch)
		     AND matches.IdMatch=joue.IdMatch
		     GROUP BY matches.IdMatch) T"
	);
	$nbMatchesAvantPremierBut = intval($nbMatchesAvantPremierBut)+1;
}

// palmarès
$palmares = DBAccess::query
("
	SELECT
    Saison as saison,
    palmares.Titre as titre,
    Bilan as bilan,
    NomCompetition as competition,
    TypeCompetition as typeCompetition,
    SousTypeCompetition as sousTypeCompetition
	FROM palmares
	JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
	JOIN joue ON palmares.Match1 = joue.IdMatch
	WHERE joue.IdJoueur = $idJoueur
		AND palmares.titre NOT NULL
	
	UNION
	
	SELECT
    distinct palmares.Saison AS saison,
    palmares.Titre as titre,
    Bilan as bilan,
    NomCompetition as competition,
    TypeCompetition as typeCompetition,
    SousTypeCompetition as sousTypeCompetition
	FROM palmares
	JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
	JOIN matches ON matches.Saison = palmares.Saison
	JOIN joue ON matches.IdMatch = joue.IdMatch
	WHERE joue.IdJoueur = $idJoueur
		AND typecompetition='Championnat'
		AND palmares.titre NOT NULL
	ORDER BY saison ASC
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
		AND AssocType = 'J'
		AND IdObjet = $idJoueur
	ORDER BY OrdreAffichage ASC, DateDoc ASC
");

// dirigeant
$dirigeant = DBAccess::singleValue
(
	"SELECT IdDirigeant AS id
	FROM dirigeants
	WHERE IdJoueur = $idJoueur
");

$nom = $joueur["nom"]; 
$prenom = $joueur["prenom"]; 

$concatNomPrenomRef = $nom . " " . $prenom;
$concatNomPrenomRef = utf8_decode(str_replace("'", "''", $concatNomPrenomRef));

$concatNomPrenomSql = "(Nom || ' ' || " . General::handleNullStringsInSqlConcat("Prenom") . ")";

$prev = DBAccess::singleRow
(
	"SELECT
    IdJoueur AS id,
    Prenom AS prenom,
    Nom AS nom
	FROM joueurs
	WHERE $concatNomPrenomSql = (SELECT MAX($concatNomPrenomSql) FROM joueurs WHERE $concatNomPrenomSql < '$concatNomPrenomRef')"
);

$next = DBAccess::singleRow
(
	"SELECT
    IdJoueur AS id,
    Prenom AS prenom,
    Nom AS nom
	FROM joueurs
	WHERE $concatNomPrenomSql = (SELECT MIN($concatNomPrenomSql) FROM joueurs WHERE $concatNomPrenomSql > '$concatNomPrenomRef')"
);


// ********************************************************
// ******* BOM ********************************************
// ********************************************************

$bilanOrdonne = ordonnerBilan(listerSaisons($sqlBilan), $sqlBilan);

for($i=0; $i<count($documents); ++$i)
{    
  $document = $documents[$i];
  $documents[$i]['path'] = Document::findPath($document['fichier']);
}


// ********************************************************
// ******* JSON *******************************************
// ******************************************************** 

$out = array();
$out['id'] = $idJoueur;
$out['fiche'] = $joueur;
$out['premierMatch'] = $premierMatch;
$out['premierMatch']['age'] = $agePremierMatch;
$out['bilan'] = $bilanOrdonne;
$out['premierBut'] = $premierBut;
$out['premierBut']['card'] = $nbMatchesAvantPremierBut;
$out['palmares'] = $palmares;
$out['documents'] = $documents;
$out['dirigeant'] = $dirigeant;
$out['navigation'] = array(
  'prev' => $prev,
  'next' => $next);
respond($out);


//=========================================================================

function listerSaisons($iSqlBilan)
{
	// on liste d'abord toutes les saisons auxquelles le joueurs a participé
	$aSaisons = array();
	foreach($iSqlBilan as $competition => $aStatsCompetition)
	{
		foreach($aStatsCompetition as $aStatType => $aStatsPerSaison)
		{		
			foreach($aStatsPerSaison as $aSaison => $aTitRmpButs)
			{
				$aSaisons[] = $aSaison;
			}
		}
	}
	
	$aSaisons = array_values(array_unique($aSaisons));
	sort($aSaisons);
	
	$completedSaisons = array();
	
	if($aSaisons)
	{
		
		$completedSaisons[] = $aSaisons[0];
		for($i=1; $i<count($aSaisons); ++$i)
		{
			$aYear = intval(substr($aSaisons[$i], 0, 4));
			$prevYear = intval(substr($aSaisons[$i-1], 0, 4));
			for($j=$prevYear+1; $j<$aYear; ++$j)
			{
				$completedSaisons[] = $j . "-" . substr($j+1, 2);
			}
			$completedSaisons[] = $aSaisons[$i];
		}
	}
	return $completedSaisons;
}

//=========================================================================

function ordonnerBilan($iSaisonsArray, $iBilan)
{	
	$aNewBilan = array();
	
	$aBilanCompetition = array();
	$aBilanCompetition["tit"] = 0;
	$aBilanCompetition["rmp"] = 0;
	$aBilanCompetition["buts"] = 0;
	
	$aNewTotalSaison = array();
	$aNewTotalSaison["total"] = $aBilanCompetition;
	$aNewTotalSaison["ch"] = $aBilanCompetition;
	$aNewTotalSaison["cn"] = $aBilanCompetition;
	$aNewTotalSaison["ce"] = $aBilanCompetition;
	
	$aTotaux = $aNewTotalSaison;
	
	for($aCurrentSaisonCnt = 0; $aCurrentSaisonCnt < count($iSaisonsArray); ++$aCurrentSaisonCnt)
	{
		$aCurrentSaison = $iSaisonsArray[$aCurrentSaisonCnt];
				
		$aTotalSaison = $aNewTotalSaison;
		
		// détail saison
		foreach($iBilan as $competition => $aStatsCompetition)
		{
			foreach($aStatsCompetition as $aStatType => $aStatsPerSaison)
			{
				foreach($aStatsPerSaison as $aSaison => $aTitRmpButs)
				{
					if($aSaison == $aCurrentSaison)
					{
						$aTotal = intval($aStatsPerSaison[$aSaison]);
						$aTotalSaison[$competition][$aStatType] = $aTotal;
						$aTotalSaison["total"][$aStatType] += $aTotal;

						$aTotaux[$competition][$aStatType] += $aTotal;
						$aTotaux["total"][$aStatType] += $aTotal;
					}
				}				
			}
		}

		$aNewBilan[$aCurrentSaison] = $aTotalSaison;
	}

	$aNewBilan["total"] = $aTotaux;
	
	return $aNewBilan;
}

?>
