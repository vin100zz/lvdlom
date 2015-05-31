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
    ClassPts4 as classPts4
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
  WHERE competitions.NomCompetition = '" . str_replace("'", "''", $ficheMatch['competition']) . "'" // FIXME
);

// buteurs OM
$buteursOM = DBAccess::query
("
	SELECT
    joueurs.IdJoueur AS id,
    joueurs.Prenom AS prenom,
    joueurs.Nom AS nom,
    buteursom.MinuteBut AS minute,
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
    Competition AS competition,
    Niveau AS niveau,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv
	FROM matches, adversaires
	WHERE matches.Adversaire = adversaires.IdAdversaire AND DateMatch = (SELECT MIN(DateMatch) FROM matches WHERE DateMatch>'$dateMatch')
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************

$json = array();
$json['fiche'] = $ficheMatch;
$json['adversaire'] = $adversaire;
$json['competition'] = $competition;
$json['buteurs'] = array(
  'om' => $buteursOM,
  'omAutres' => $buteursOMAutres,
  'adv' => $buteursAdv);
$json['joueurs'] = array(
  'titulaires' => $titulaires,
  'remplacants' => $remplacants);
$json['entraineurs'] = $entraineurs;
$json['photos'] = $photos;
$json['navigation'] = array(
  'prev' => $prev,
  'next' => $next);
print json_encode($json, JSON_PRETTY_PRINT);



// ********************************************************
// ******* BOM ********************************************
// ********************************************************

/*
// buteurs CSC
if(count($buteursOMAutres) > 0)
	$buteursOMAvecCSC = regouperButeursOMEtCSC($buteursOM, $buteursOMAutres);
else
	$buteursOMAvecCSC = $buteursOM;
	
// domicile
$aDomicile = General::domicile($ficheMatch) || General::neutre($ficheMatch);
$aIdClubGauche = ($aDomicile ? "OM" : $ficheMatch["IdAdversaire"]);
$aIdClubDroite = ($aDomicile ? $ficheMatch["IdAdversaire"] : "OM");
$aClubGauche = ($aDomicile ? HtmlBom::getOm($ficheMatch["Saison"]) : $ficheMatch["NomAdversaire"]);
$aClubDroite = ($aDomicile ? $ficheMatch["NomAdversaire"] : HtmlBom::getOm($ficheMatch["Saison"]));
$aButsGauche = ($aDomicile ? $ficheMatch["ButsOM"] : $ficheMatch["ButsAdv"]);
$aButsDroite = ($aDomicile ? $ficheMatch["ButsAdv"] : $ficheMatch["ButsOM"]);
$aPaysGauche = ($aDomicile ? "FRA" : $ficheMatch["Pays"]);
$aPaysDroite = ($aDomicile ? $ficheMatch["Pays"] : "FRA");

// titre window
$aTitreWindow = "$aClubGauche - $aClubDroite (" . HtmlBom::getDate($ficheMatch["DateMatch"]) . ")";
				
// titre page
$aRqScore = $ficheMatch["RqScore"];
if($aRqScore == "tab")
{
	$aRqScore = $ficheMatch["TABOM"] . "-" . $ficheMatch["TABAdv"] . " tab";
}	
	
$aTitre = "<div id='structured-title'>"
		. HtmlImage::getLogoClub($aIdClubGauche, ImageSize::Large)	
		. "<span>" . $aClubGauche . "</span>"
		. "<div class='scoreComplet'>"
		. "<span class='score'>$aButsGauche - $aButsDroite</span>"
		. ($aRqScore == "" ? "" : "<span class='rqScore'>($aRqScore)</span>")
		. "</div>"
		. "<span>" . $aClubDroite . "</span>"
		. HtmlImage::getLogoClub($aIdClubDroite, ImageSize::Large)
		. "</div>";
				
// prev-next
$prevId = null;
$prevStr = null;
if($prev)
{
	$prevId = $prev["IdMatch"];
	$prevStr = HtmlBom::getDate($prev["DateMatch"], DateFormat::Long) . " : " . $prev["NomAdversaire"] . " " . $prev["ButsOM"] . "-" . $prev["ButsAdv"]
				. " (" . $prev["Competition"] . ", " . $prev["Niveau"] . ")"; 
};

$nextId = null;
$nextStr = null;
if($next)
{
	$nextId = $next["IdMatch"];
	$nextStr = HtmlBom::getDate($next["DateMatch"], DateFormat::Long) . " : " . $next["NomAdversaire"] . " " . $next["ButsOM"] . "-" . $next["ButsAdv"]
				. " (" . $next["Competition"] . ", " . $next["Niveau"] . ")"; 
};
*/
// ********************************************************
// ******* HTML *******************************************
// ******************************************************** 
/*
// begin html
HtmlLayout::beginHTML($aTitreWindow);

println("<div class='container'>");

	// titre
	HtmlLayout::drawTitle(25, $aTitre, "#ficheMatch/", $prevId, $nextId, $prevStr, $nextStr, $aRqScore);
	
	// fiche + buteurs
	println("<div class='span-8 push-1'>");
		
		// titre fiche
		println("<div class='subtitle span-8'>Informations générales</div>");
		
		// data fiche   
		println("<div class='block span-8'>");
			println("<div class='blockcontent span-8'>");
			
				println("<div class='span-2 leftMaillot'>");
					println("<img src='" . getMaillot($aClubGauche, true) . "' width='105px' />");
					HtmlBom::drawPays($aPaysGauche, ImageSize::Large, false, WritePays::No);
				println("</div>");
				
				println("<div class='span-4 listKeyVal'>");
			
					println("<div class='listItem'>");
						println("<div><b>Saison " . HtmlLink::getSaisonLink($ficheMatch["Saison"]) . "</b></div>");
					println("</div>");
					println("<div class='listItem'>");
						println("<div>"); HtmlBom::drawDate($ficheMatch["DateMatch"], DateFormat::Long); println("</div>");
					println("</div>");
					
					println("<div class='listItem'>");
						println("<div><b>" . $ficheMatch["Lieu"] . "</b></div>");
					println("</div>");
					if($ficheMatch["Spectateurs"])
					{
						println("<div class='listItem'>");
							println("<div>" . $ficheMatch["Spectateurs"] . " spectateurs</div>");
						println("</div>");
					}
					
					println("<div class='listItem'>");
						println("<div><b>"); HtmlBom::drawCompetition($ficheMatch); println("</b></div>");
					println("</div>");
					println("<div class='listItem'>");
						println("<div>" . $ficheMatch["Niveau"] . "</div>");
					println("</div>");
					
				println("</div>");
					
				println("<div class='span-2 last rightMaillot'>");
					println("<img src='" . getMaillot($aClubDroite, false) . "' width='105px' />");
					HtmlBom::drawPays($aPaysDroite, ImageSize::Large, false, WritePays::No);
				println("</div>");
				
			println("</div>");
		println("</div>");
		
		println("<hr/>");
		
		$buteurs = ordonnerButeurs($buteursOMAvecCSC, $buteursAdv, $aDomicile);
		
		if(count($buteurs) > 0)
		{
			// titre buteurs
			println("<div class='subtitle span-8'>Buteurs</div>");
			
			// data buteurs   
			println("<div class='block span-8'>");
				println("<div class='blockcontent listKeyVal span-8'>");
					
					for($i=0; $i<count($buteurs); $i++)
					{												   
						println("<div class='listItem'>");
							println("<div class='listCell minute'>" . ($buteurs[$i]["min_left"]?$buteurs[$i]["min_left"]."'":"") . "</div>");
							println("<div class='listCell nom first-nom'>" . $buteurs[$i]["nom_left"] . "</div>");
							
							println("<div class='listCell score'>" . $buteurs[$i]["score"] . "</div>");
											
							println("<div class='listCell nom second-nom'>" . $buteurs[$i]["nom_right"] . "</div>");
							println("<div class='listCell minute'>" . ($buteurs[$i]["min_right"]?$buteurs[$i]["min_right"]."'":"") . "</div>");
						println("</div>");
					}
					
				println("</div>");
			println("</div>");
		}
		
	println("</div>");
	
	// équipe
	println("<div class='span-8'>");
		
		// titre
		println("<div class='subtitle span-8'>Équipe</div>");
		
		// data   
		println("<div class='block span-8'>");
			println("<div class='blockcontent listKeyVal span-8'>");
			
				for($i=0; $i<count($titulaires); $i++)
				{      
					$aTitulaire = $titulaires[$i];
					
					// titulaire
					drawJoueur(true, $aTitulaire, $dateMatch);
					
					// remplaçant
					$numRmpString = $aTitulaire["NumRmp"];
					if($numRmpString != "")
					{
						$aRemplacant = $remplacants[intval($numRmpString)-1];
						drawJoueur(false, $aRemplacant, $dateMatch);
						
						// remplaçant du remplaçant !
						$numRmpString= $aRemplacant["NumRmp"];
						if($numRmpString!= "")
						{
							$aRemplacant = $remplacants[intval($numRmpString)-1];
							drawJoueur(false, $aRemplacant, $dateMatch);
						}
					}
				}
								
			println("</div>");
		println("</div>");
		
	println("</div>");
	
	// entraineurs + classement + commentaires
	println("<div class='span-7 last'>");
	
		// titre entraineurs
		println("<div class='subtitle span-7'>Entraîneur" . (count($entraineurs) > 1 ? "s" : "") . "</div>");
		
		// data entraineurs 
		println("<div class='block span-7'>");
			println("<div class='blockcontent listKeyVal span-7'>");
				
			for($i = 0; $i < count($entraineurs); ++$i)
			{
				println("<div class='listItem'>");
					println("<div class='listCell'>");
						println(HtmlLink::getDirigeantLink($entraineurs[$i]));
					println("</div>");
				println("</div>");
			}		
				
			println("</div>");
		println("</div>");
		
		// classement
		if($ficheMatch["Class1"] != "")
		{
			println("<hr/>");
			
			// titre classement
			println("<div class='subtitle span-7'>Classement</div>");
			
			// data classement
			println("<div class='block span-7'>");
				println("<div class='blockcontent listKeyVal span-7'>");
					
					// classement
					for($i=1; $i<=4; $i++)
					{
						$aEquipe = $ficheMatch["Class" . $i];
						if($aEquipe != "")
						{
							$aDotPos = strpos($aEquipe, '.');
							if($aDotPos !== false)
							{
								$aPos = intval(substr($aEquipe, 0, $aDotPos));
								$aEquipe = substr($aEquipe, $aDotPos+2);
							}
							else
							{
								$aPos = intval(substr($aEquipe, 0, 3)) > 0 ? intval(substr($aEquipe, 0, 3)) : $i;
							}
								
							println("<div class='listItem " . (strpos($aEquipe, "OM ") !== false ? "classOm" : "") . "'>");
								println("<div class='listCell class'>$aPos.</div>");
								println("<div class='listCell class'>" . $aEquipe . "</div>");
								println("<div class='listCell'>" . $ficheMatch["ClassPts" . $i] . "</div>");
							println("</div>");
						}
					}				
					
				println("</div>");
			println("</div>");
		}
		
		// commentaires
		if($ficheMatch["Comm1"] != "" || $ficheMatch["JYEtais"] != "")
		{
			println("<hr/>");
			
			// titre commentaires
			println("<div class='subtitle span-7'>Commentaires</div>");
			
			// data commentaires 
			println("<div class='block span-7'>");
				println("<div class='blockcontent listKeyVal span-7'>");
					
					println("<div class='listItem'>");
						println("<div class='listCell'>");
						
							if($ficheMatch["IdMatch"] != "3649" && $ficheMatch["JYEtais"] != "")
							{
								HtmlImage::drawImage("premier");
								println($ficheMatch["JYEtais"] . "<br/>");
							}
								
							if($ficheMatch["Comm1"] != "")
								println($ficheMatch["Comm1"] . "<br/>" . $ficheMatch["Comm2"] . "<br/>" . $ficheMatch["Comm3"]);
								
						println("</div>");
					println("</div>");
					
				println("</div>");
			println("</div>");
		}
	
		println("<hr/>");
		
	println("</div>");
	
	// photos
	println("<div class='span-23 push-1 last'>");
    if($ficheMatch["IdMatch"] != "3649") {
      HtmlDoc::drawPhotos($photos);
    }
	println("</div>");
	
println("</div>");

*/

//=========================================================================

function regouperButeursOMEtCSC($buteursOM, $buteursOMAutres)
{      	
	$buteursOMAvecCSC = array();
	
	if(minutesCompletes($buteursOM, $buteursOMAutres))
	{
		$cptOM = 0;
		$cptAutres = 0;
		$cpt = 0;
		$nextButeurIsCSC;
		while($cpt < count($buteursOM) + count($buteursOMAutres))
		{
			$aButeurOM = isset($buteursOM[$cptOM]) ? $buteursOM[$cptOM] : null;
			$aButeurOMAutres = isset($buteursOMAutres[$cptAutres]) ? $buteursOMAutres[$cptAutres] : null;
			
			if($aButeurOM == null)
			{
				$nextButeurIsCSC = true;
			}
			else if($aButeurOMAutres == null)
			{
				$nextButeurIsCSC = false;
			}
			else if(intval($aButeurOM["MinuteBut"]) < intval($aButeurOMAutres["MinuteBut"]))
			{
				$nextButeurIsCSC = false;
			}
			else
			{
				$nextButeurIsCSC = true;
			}
				
			if($nextButeurIsCSC)
			{
				$buteursOMAvecCSC[$cpt] = $buteursOMAutres[$cptAutres];
				$cptAutres++;
			}
			else
			{
				$buteursOMAvecCSC[$cpt] = $buteursOM[$cptOM];
				$cptOM++;
			}
			$cpt++;
		}
	}
	else
	{
		for($i=0; $i<count($buteursOM); $i++)
		{
			$buteursOMAvecCSC[$i] = $buteursOM[$i];
		}
		for($i=0; $i<count($buteursOMAutres); $i++)
		{
			$buteursOMAvecCSC[$i+count($buteursOM)] = $buteursOMAutres[$i];
		}
	}

	return $buteursOMAvecCSC;
}

//=========================================================================

function minutesCompletes($buteursOM, $buteursAdv)
{  	
	// toutes les minutes renseignées ?
	$minutesCompletes = true;
	$n=0;
	while($n<count($buteursOM) && $minutesCompletes)
	{
		$aButeurOM = $buteursOM[$n];
		
		$minutesCompletes = ($aButeurOM["MinuteBut"] != "");
		$n++;
	}
	$n=0;
	while($n<count($buteursAdv) && $minutesCompletes)
	{
		$aButeurAdv = $buteursAdv[$n];
		
		$minutesCompletes = ($aButeurAdv["MinuteBut"] != "");
		$n++;
	}
	
	return $minutesCompletes;
}

//=========================================================================

function ordonnerButeurs($iButeursOM, $iButeursAdv, $iDomicile)
{
	// minutes complètes
	if(minutesCompletes($iButeursOM, $iButeursAdv))
	{
		$cptOM = 0;
		$cptAdv = 0;
		$nextButeurIsOM;
		$aLignesButeurs = array();
		
		for($i=0; $i<count($iButeursOM)+count($iButeursAdv); ++$i)
		{  	
			$aLigneButeur = array();
	
			$aButeurOM = isset($iButeursOM[$cptOM]) ? $iButeursOM[$cptOM] : null;
			$aButeurAdv = isset($iButeursAdv[$cptAdv]) ? $iButeursAdv[$cptAdv] : null;
			
			// but OM ou adversaire ?
			if($aButeurOM == null)
			{
				$nextButeurIsOM = false;
			}
			else if($aButeurAdv == null)
			{
				$nextButeurIsOM = true;
			}
			else if(intval($aButeurOM["MinuteBut"]) < intval($aButeurAdv["MinuteBut"]))
			{
				$nextButeurIsOM = true;
			}
			else
			{
				$nextButeurIsOM = false;
			}
			
			// ajout dans tableau ordonné
			if($nextButeurIsOM)
			{
				if(isset($aButeurOM["IdJoueur"]))
				{
					$aNomJoueur = HtmlLink::getJoueurLink($aButeurOM);
				}
				else
				{
					$aNomJoueur = $aButeurOM["NomJoueur"];
				}
				
				if($aButeurOM["NoteBut"])
				{
					$aNomJoueur .= " (" . $aButeurOM["NoteBut"] . ")";
				}
				
				$aLigneButeur["nom_left"] = ($iDomicile ? $aNomJoueur : "");
				$aLigneButeur["nom_right"] = ($iDomicile ? "" : $aNomJoueur);
			
				$aLigneButeur["min_left"] = ($iDomicile ? $aButeurOM["MinuteBut"] : "");
				$aLigneButeur["min_right"] = ($iDomicile ? "" : $aButeurOM["MinuteBut"]);
				
				$cptOM++;
			}
			else
			{
				$aNomJoueur = $aButeurAdv["NomJoueur"];
				if($aButeurAdv["NoteBut"])
				{
					$aNomJoueur .= " (" . $aButeurAdv["NoteBut"] . ")";
				}
				
				$aLigneButeur["nom_left"] = ($iDomicile ? "" : $aNomJoueur);
				$aLigneButeur["nom_right"] = ($iDomicile ? $aNomJoueur : "");
			
				$aLigneButeur["min_left"] = ($iDomicile ? "" : $aButeurAdv["MinuteBut"]);
				$aLigneButeur["min_right"] = ($iDomicile ? $aButeurAdv["MinuteBut"] : "");
				
				$cptAdv++;
			}
			
			
			$aLigneButeur["score"] = ($iDomicile ? $cptOM . "-" . $cptAdv : $cptAdv . "-" . $cptOM);

			$aLignesButeurs[] = $aLigneButeur;
		}
	}
	else // il manque des minutes
	{
		$aLignesButeurs = array();
				
		$buteursGauche = $iDomicile ? $iButeursOM : $iButeursAdv;
		$buteursDroite = $iDomicile ? $iButeursAdv : $iButeursOM;
				
		for($i=0; $i<max(count($buteursGauche), count($buteursDroite)); ++$i)
		{
			$aLigneButeur = array();
			
			$aButeurGauche = isset($buteursGauche[$i]) ? $buteursGauche[$i] : null;
			$aButeurDroite = isset($buteursDroite[$i]) ? $buteursDroite[$i] : null;
			
			// gauche
			$aNomJoueur = "";
			$encoreButeur = $i < count($buteursGauche);
			if($encoreButeur)
			{
				if(isset($aButeurGauche["IdJoueur"]))
				{
					$aNomJoueur = HtmlLink::getJoueurLink($aButeurGauche);
				}
				else
				{
					$aNomJoueur = $aButeurGauche["NomJoueur"];
				}
				
				if($aButeurGauche["NoteBut"])
				{
					$aNomJoueur .= " (" . $aButeurGauche["NoteBut"] . ")";
				}
			}
			
			$aLigneButeur["nom_left"] = $aNomJoueur;
			$aLigneButeur["min_left"] = ($encoreButeur && $aButeurGauche["MinuteBut"]) ? $aButeurGauche["MinuteBut"] : "";
			
			
			// droite
			$aNomJoueur = "";
			$encoreButeur = $i < count($buteursDroite);
						
			if($encoreButeur)
			{
				if(isset($aButeurDroite["IdJoueur"]))
				{
					$aNomJoueur = HtmlLink::getJoueurLink($aButeurDroite);
				}
				else
				{
					$aNomJoueur = $aButeurDroite["NomJoueur"];
				}
				
				if($aButeurDroite["NoteBut"])
				{
					$aNomJoueur .= " (" . $aButeurDroite["NoteBut"] . ")";
				}
			}
			
			$aLigneButeur["nom_right"] = $aNomJoueur;
			$aLigneButeur["min_right"] = ($encoreButeur && $aButeurDroite["MinuteBut"]) ? $aButeurDroite["MinuteBut"] : "";
			
			$aLigneButeur["score"] = "";			
			
			$aLignesButeurs[] = $aLigneButeur;
		}			
	}
	
	return $aLignesButeurs;	
}

//=========================================================================

function drawJoueur($iTitulaire, $iJoueur, $iDateMatch)
{
	$aCarton = $iJoueur["Carton"];
	$aPoste = $iJoueur["Poste"];
	$aMinuteRmp = isset($iJoueur["MinuteRmp"]) ? $iJoueur["MinuteRmp"] : null;
	$aPremierMatch = premierMatch($iDateMatch, $iJoueur["IdJoueur"]);
	$aDernierMatch = dernierMatch($iDateMatch, $iJoueur["IdJoueur"]);
	
	$aDisplayJoueur = HtmlBom::getPoste($aPoste, false) . HtmlLink::getJoueurLink($iJoueur);

	println("<div class='listItem'>");
	
		println("<div class='listCell" . ($iTitulaire ? " tit" : " rmp") . "'>"
					. ($iTitulaire ? "" : HtmlImage::getImage("fleche", "sprite-nomright"))
					. ($aMinuteRmp ? "<span class='minute'>$aMinuteRmp'</span>" : "") . "$aDisplayJoueur");
		
		$aDisplayCarton = "";
		if($aCarton != "")
		{
			if(substr($aCarton, 0, 1) == "A")
				$aDisplayCarton = HtmlImage::getImage("cartonjaune");
			else
				$aDisplayCarton = HtmlImage::getImage("cartonrouge");
			
			if(strlen($aCarton) > 1)
				$aDisplayCarton .= "<span class='minute minuteRight'>" . substr($aCarton, 1) . "'</span>";
		}
		println("</div>");
		
		println("<div class='listCell'>$aDisplayCarton</div>");
		
		println("<div class='listCell'>" . ($aPremierMatch ? HtmlImage::getImage("premier") : "") . "</div>");
		println("<div class='listCell'>" . ($aDernierMatch ? HtmlImage::getImage("dernier") : "") . "</div>");
		
	println("</div>");
}

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
