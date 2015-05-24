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
    DateDeces AS dateDeces
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
	$sqlBilan[$sqlComp]["tit"] = DBAccess::keyVal
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
	$sqlBilan[$sqlComp]["rmp"] = DBAccess::keyVal
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
	$sqlBilan[$sqlComp]["buts"] = DBAccess::keyVal
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

// premier match
$premierMatch = DBAccess::singleRow
("
	SELECT *
	FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON competitions.NomCompetition = matches.competition
	WHERE DateMatch =
	  (SELECT Min(DateMatch) FROM joue, matches
	   WHERE joue.IdJoueur = $idJoueur AND joue.IdMatch = matches.IdMatch)
");

// age premier match
if($premierMatch)
{
	$agePremierMatch = DBAccess::singleValue
	("
		SELECT julianday(DateMatch) - julianday(DateNaissance)
		FROM joue, matches, joueurs
		WHERE matches.IdMatch=" . $premierMatch["IdMatch"] . " AND joue.IdJoueur = $idJoueur
		 AND joueurs.IdJoueur = $idJoueur
	");
}

// premier but
$premierBut = DBAccess::singleRow
("
	SELECT *
	FROM matches
	LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
	LEFT JOIN competitions ON competitions.NomCompetition = matches.competition
	WHERE DateMatch =
	  (SELECT Min(DateMatch) FROM buteursom, matches
	   WHERE buteursom.IdJoueur = $idJoueur AND matches.IdMatch = buteursom.IdMatch)
");

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
	SELECT Saison, Titre, Bilan, NomCompetition as Competition, TypeCompetition, SousTypeCompetition
	FROM palmares
	JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
	JOIN joue ON palmares.Match1 = joue.IdMatch
	WHERE joue.IdJoueur = $idJoueur
		AND titre NOT NULL
	
	UNION
	
	SELECT distinct palmares.Saison AS Saison, palmares.Titre as Titre, Bilan, NomCompetition as Competition, TypeCompetition, SousTypeCompetition
	FROM palmares
	JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
	JOIN matches ON matches.Saison = palmares.Saison
	JOIN joue ON matches.IdMatch = joue.IdMatch
	WHERE joue.IdJoueur = $idJoueur
		AND typecompetition='Championnat'
		AND palmares.titre NOT NULL
	ORDER BY Saison ASC
");

// photos
$photos = DBAccess::query
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

$concatNomPrenom = $nom . " " . $prenom;
$concatNomPrenom = str_replace("'", "''", $concatNomPrenom);

$prev = DBAccess::singleRow
(
	"SELECT
    IdJoueur AS id,
    Prenom AS prenom,
    Nom AS nom
	FROM joueurs
	WHERE (Nom || ' ' || Prenom) = (SELECT MAX(Nom || ' ' || Prenom) FROM joueurs WHERE (Nom || ' ' || Prenom) < '$concatNomPrenom')"
);
$prevId = null;
$prevNom = null;
if($prev)
{
	$prevId = $prev["id"];
	$prevNom = $prev["prenom"] . " " . $prev["nom"];
}

$next = DBAccess::singleRow
(
	"SELECT
    IdJoueur AS id,
    Prenom AS prenom,
    Nom AS nom
	FROM joueurs
	WHERE (Nom || ' ' || Prenom) = (SELECT MIN(Nom || ' ' || Prenom) FROM joueurs WHERE (Nom || ' ' || Prenom) > '$concatNomPrenom')"
);
$nextId = null;
$nextNom = null;
if($next)
{
	$nextId = $next["id"];
	$nextNom = $next["prenom"] . " " . $next["nom"];
}


// ********************************************************
// ******* BOM ********************************************
// ********************************************************

$bilanOrdonne = ordonnerBilan(listerSaisons($sqlBilan), $sqlBilan);


// ********************************************************
// ******* JSON *******************************************
// ******************************************************** 

$json = array();
$json['id'] = $idJoueur;
$json['fiche'] = $joueur;
$json['premierMatch'] = $premierMatch;
$json['bilan'] = $bilanOrdonne;
$json['premierBut'] = $premierBut;
$json['palmares'] = $palmares;
$json['photos'] = $photos;
$json['dirigeant'] = $dirigeant;
$json['navigation'] = array(
  'prev' => $prev,
  'next' => $next);
print json_encode($json, JSON_PRETTY_PRINT);


/*
// begin html
HtmlLayout::beginHTML("$prenom $nom");

println("<div class='container'>");

	// titre
	HtmlLayout::drawTitle(25, "$prenom $nom", "#ficheJoueur/", $prevId, $nextId, $prevNom, $nextNom);
	
	// photo id
	println("<div class='span-4 push-1'>");
		HtmlImage::drawPhotoIdentite(IdentityType::Joueur, $idJoueur, ImageSize::Large);
		
		println("<hr/>");
		
		// entraîneur
		if($idDirigeant != null)
		{
			println("<div class='span-4 block link-fiche'><a href='#ficheDirigeant/" . $idDirigeant . "'>Fiche dirigeant</a></div>");
		}
	
	println("</div>");
	
		
	// fiche
	println("<div class='span-8'>");
	
		println("<div class='span-4'>");
		
			// titre état civil
			println("<div class='subtitle span-4'>État civil</div>");
			
			// data état civil
			println("<div class='block span-4'>");
				println("<div class='blockcontent listKeyVal span-4'>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Date naiss. :</div>");
						println("<div class='listVal'>"); HtmlBom::drawDate($joueur["DateNaissance"], "long"); println("</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Lieu naiss. :</div>");
						$aTerrNaiss = $joueur["TerritoireNaissance"];
						println("<div class='listVal'>" . $joueur["VilleNaissance"] . ($aTerrNaiss ? " ($aTerrNaiss)" : "") . "</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Nationalité :</div>");
						println("<div class='listVal'>"); HtmlBom::drawPays($joueur["Nationalite"], ImageSize::Small, true, WritePays::Long); println("</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Date décès :</div>");
						println("<div class='listVal'>"); HtmlBom::drawDate($joueur["DateDeces"], "long"); println("</div>");
					println("</div>");
					
				println("</div>");
			println("</div>");
		println("</div>");
		
		println("<div class='span-4 last'>");
			
			// titre carrière
			println("<div class='subtitle span-4 '>Carrière</div>");
			
			// data carrière
			println("<div class='block span-4'>");
				println("<div class='blockcontent listKeyVal span-4'>");
				
					println("<div class='listItem'>");
						println("<div class='listKey'>Poste :</div>");
						println("<div class='listVal'>"); HtmlBom::drawPoste($joueur["Poste"]); println("</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Sél. int. :</div>");
						println("<div class='listVal'>" . $joueur["Selections"] . "</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Club préc. :</div>");
						println("<div class='listVal'>" . $joueur["ClubPrecedent"] . "</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div class='listKey'>Club suiv. :</div>");
						println("<div class='listVal'>" . $joueur["ClubSuivant"] . "</div>");
					println("</div>");
	
				println("</div>");
			println("</div>");
		println("</div>");
		
		println("<hr/>");
		
		
		// titre bilan
		println("<div class='subtitle span-8'>Bilan</div>");
		
		// data bilan
		println("<div class='block span-8'>");
			println("<div class='blockcontent listKeyVal span-8'>");

				// premier match
				println("<div class='listItem'>");
					println("<div class='listKey'>Premier match :</div>");
					println("<div class='listVal'>");
						if($premierMatch)
							{ HtmlBom::drawMatch($premierMatch); println("<br />à l'âge de " . floor($agePremierMatch/365) . " ans"); }
					 	else 
							println("-");
						println("</div>");
				println("</div>");
				
				// premier but
				println("<div class='listItem'>");
					println("<div class='listKey'>Premier but :</div>");
					println("<div class='listVal'>");
					if(count($premierBut) == 0)
						println("-");
					else
					{
						HtmlBom::drawMatch($premierBut); println("<br />pour son " . $nbMatchesAvantPremierBut . ($nbMatchesAvantPremierBut==1?"er":"ème") . " match");
					}
					println("</div>");
				println("</div>");
				
				// palmares
				println("<div class='listItem'>");
					println("<div class='listKey'>Palmarès :</div>");
					println("<div class='listVal'>");
					if(count($palmares) == 0)
					{
						println("-");
					}
					else
					{
						for($i = 0; $i < count($palmares); ++$i)
						{
							$aLignePalmares = $palmares[$i];
							println($aLignePalmares["Saison"] . " : ");
							if($aLignePalmares["Titre"] == "1") {HtmlImage::drawImage("premier", "sprite-mleft");}
							if($aLignePalmares["Titre"] == "2") {HtmlImage::drawImage("dernier", "sprite-mleft");}
							println($aLignePalmares["Bilan"]);
							HtmlBom::drawCompetition($aLignePalmares, "sprite-mleft");
							println("<br/>");
						}	
					}
					println("</div>");
				println("</div>");
					
			println("</div>");
		println("</div>");

	println("</div>");
	
	
	// stats
	println("<div class='span-11 last'>");
		
		// stats
		println("<div class='span-11 last'>");
		
			// table
			println("<table>");
			
				// header
				println("<thead>");
					println("<tr>");
						println("<th class='topleftcorner' rowspan='2'>SAISON</th>");
						println("<th colspan='2'>TOTAL</th>");
						println("<th colspan='2'>CHAMPIONNAT</th>");
						println("<th colspan='2'>COUPES NATIONALES</th>");
						println("<th class='toprightcorner' colspan='2'>COUPES D'EUROPE</th>");
					println("</tr>");
					
					println("<tr>");
						println("<th class='matches'>Matches</th><th class='buts'>Buts</th>");
						println("<th class='matches'>Matches</th><th class='buts'>Buts</th>");
						println("<th class='matches'>Matches</th><th class='buts'>Buts</th>");
						println("<th class='matches'>Matches</th><th class='buts'>Buts</th>");
					println("</tr>");
				println("</thead>");
				
				// stats
				foreach($bilanOrdonne as $aSaison => $aBilanSaison)
				{
					$aIsTotal = ($aSaison == "TOTAL");
					
					if($aIsTotal)
					{
						println("<tfoot>");
					}
					
					println("<tr>");
				
					println("<td>" . ($aIsTotal ? $aSaison : HtmlLink::getSaisonLink($aSaison)) . "</td>");
					
					// total
					HtmlTable::drawCellNbMatches($aBilanSaison["Total"]["tit"], $aBilanSaison["Total"]["rmp"], true);
					HtmlTable::drawCellNbButs($aBilanSaison["Total"]["buts"], true);
					
					// championnat
					HtmlTable::drawCellNbMatches($aBilanSaison["Championnat"]["tit"], $aBilanSaison["Championnat"]["rmp"]);
					HtmlTable::drawCellNbButs($aBilanSaison["Championnat"]["buts"]);
					
					// coupes nationales
					HtmlTable::drawCellNbMatches($aBilanSaison["Coupe Nationale"]["tit"], $aBilanSaison["Coupe Nationale"]["rmp"]);
					HtmlTable::drawCellNbButs($aBilanSaison["Coupe Nationale"]["buts"]);
					
					// europe
					HtmlTable::drawCellNbMatches($aBilanSaison["Coupe d''Europe"]["tit"], $aBilanSaison["Coupe d''Europe"]["rmp"]);
					HtmlTable::drawCellNbButs($aBilanSaison["Coupe d''Europe"]["buts"]);

					println("</tr>");
					
					if($aIsTotal)
					{
						println("</tfoot>");
					}
				}
				
			println("</table>");
      
      println("<div class='span-11 block link-matches'><a href='#matchesJoueur/" . $idJoueur . "'>Tous les matches</a></div>");
		
		println("</div>");
	
	println("</div>");
	
	// photos
	println("<div class='span-23 push-1 last'>");
		HtmlDoc::drawPhotos($photos);
	println("</div>");
	
println("</div>");
*/


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
	$aNewTotalSaison["Total"] = $aBilanCompetition;
	$aNewTotalSaison["Championnat"] = $aBilanCompetition;
	$aNewTotalSaison["Coupe Nationale"] = $aBilanCompetition;
	$aNewTotalSaison["Coupe d''Europe"] = $aBilanCompetition;
	
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
						$aTotalSaison["Total"][$aStatType] += $aTotal;

						$aTotaux[$competition][$aStatType] += $aTotal;
						$aTotaux["Total"][$aStatType] += $aTotal;
					}
				}				
			}
		}

		$aNewBilan[$aCurrentSaison] = $aTotalSaison;
	}

	$aNewBilan["TOTAL"] = $aTotaux;
	
	return $aNewBilan;
}

?>
