<?php

require_once 'utils/service.php';

// ********************************************************
// ******* BOM *******************************************
// ******************************************************** 

// niveaux
$champ = array("(D1) Champion" => array(1, 0));
for($i=2; $i<=20; ++$i) {
	$champ["(D1) " . $i . "ème"] = array($i, 0);
}
$champ["(D2) 1er"] = array(21, 0);
for($i=2; $i<=14; ++$i) {
	$champ["(D2) " . $i . "ème"] = array(20+$i, 0);
}
$champ_series = array("'1', '2', '17'" => array("Championnat Pro", "'1ère Division', '2ème Division', 'Ligue 1'"),
					  "'4'" => array("Championnat Fédéral", "'Championnat Fédéral'"),
					  "'20'" => array("Championnat Amateur", "'Championnat de France'"));

$eur = array(
	"Vainqueur" => array(1, 0),
	"Finaliste" => array(2, 0),
	"Demi finale" => array(3, 0),
	"Quart de finale" => array(4, 0),
	"1/8ème de finale" => array(5, 0),
	"Phase de groupes" => array(6, 0),
	"1/16ème de finale" => array(7, 0),
	"1/32ème de finale" => array(8, 0),
	"1er tour" => array(9, 0)
);
$eur_series = array("'12', '18'" => array("C1", "'Coupe des Clubs Champions', 'Ligue des Champions'"),
					"'13'" => array("C2", "'Coupe des Vainqueurs de Coupe'"),
					"'11', '21'" => array("C3", "'Coupe de l''UEFA', 'Ligue Europa'"),
					"'14'" => array("Coupe des Villes de Foire", "'Coupe des Villes de Foire'"));

$cdf = array(
	"Vainqueur" => array(1, 0),
	"Finaliste" => array(2, 0),
	"Demi finale" => array(3, 0),
	"Quart de finale" => array(4, 0),
	"1/8ème de finale" => array(5, 0),
	"1/16ème de finale" => array(6, 0),
	"1/32ème de finale" => array(7, 0),
	"6ème tour" => array(8, 0)
);
$cdf_series = array("'8'" => array("Coupe de France", "'Coupe de France'"),
					"'7'" => array("Coupe Charles-Simon", "'Coupe Charles-Simon'"));

$cdl = array(
	"Vainqueur" => array(1, 0),
	"Finaliste" => array(2, 0),
	"Demi finale" => array(3, 0),
	"Quart de finale" => array(4, 0),
	"1/8ème de finale" => array(5, 0),
	"1/16ème de finale" => array(6, 0),
	"2ème tour" => array(7, 0),
	"1er tour" => array(8, 0)
);
$cdl_series = array("'10'" => array("Coupe de la Ligue", "'Coupe de la Ligue'"),
					"'15'" => array("Coupe Drago", "'Coupe Drago'"),
					"'9'" => array("Coupe de la Libération", "'Coupe de la Libération'"));
          
// competitions
$competitions = array(
	array($champ_series, $champ),
	array($eur_series, $eur),
	array($cdf_series, $cdf),
	array($cdl_series, $cdl),
);

// charts
$charts = array();
for($i=0; $i<count($competitions); ++$i) {
  $comp = $competitions[$i];
  $charts[] = drawChart($comp[0], $comp[1]);
}



// ********************************************************
// ******* JSON *******************************************
// ********************************************************  


respond($charts);


// ********************************************************
// ******* HTML *******************************************
// ******************************************************** 

/*
// begin html
HtmlLayout::beginHTML("Histo");

println("<div class='container'>");

	// titre
	HtmlLayout::drawTitle(25, "Historique des Compétitions");
	
	// JS
	println("<script src='js/histo.js'></script>");
	
	$charts = "";
	for($i=0; $i<count($competitions); ++$i) {
		$comp = $competitions[$i];
		$charts .= drawChart($comp[0], $comp[2], $comp[3], $comp[4]);
	}
	println("<script>(function() { $charts })();</script>");

	// charts
	println("<div class='span-23 push-1'>");
		for($i=0; $i<count($competitions); ++$i) {
			println("<div class='subtitle'>" . $competitions[$i][1] . "</div>");
			println("<div id='" . $competitions[$i][3] . "'></div>");
		}
	println("</div'>");
	
println("</div>");

*/


// ********************************************************
// ******* Helpers ****************************************
// ********************************************************


function drawChart($competitions, $niveaux)
{
	$all_comp = array();
	
	foreach($competitions as $idCompetition => $nomCompetition) {
	
		$comp = array('Nom' => $nomCompetition[0], 'Histo' => array(), 'Matches' => array());
		
		// SQL
		$histo_comp = DBAccess::query
		("
			SELECT Saisons.Saison, Bilan, IdCompetition
			FROM Saisons
			LEFT OUTER JOIN (
				SELECT Saison, Bilan, IdCompetition
				FROM Palmares
				WHERE IdCompetition IN ($idCompetition)
			) AS p
			ON Saisons.Saison = p.Saison
			ORDER BY Saisons.Saison ASC
		");

		$matches_comp = DBAccess::query
		("
			SELECT Saison, NomAdversaire, ButsOM, ButsAdv, RqScore, TABOM, TABAdv
			FROM Matches, Adversaires
			WHERE Matches.Adversaire = Adversaires.IdAdversaire AND Competition IN (" . utf8_decode($nomCompetition[1]) . ")
			ORDER BY DateMatch ASC
		");

		// histo
		$filt_histo = array();
		for($i=0; $i<count($histo_comp); ++$i) {
			$histo = $histo_comp[$i];
			$bilan = array();
			$bilan['Niveau'] = getNiveau($histo, $niveaux);
			$filt_histo[$histo['Saison']] = $bilan;
		}
		$comp['Histo'] = $filt_histo;
		
		// matches
		$filt_matches = array();
		for($i=0; $i<count($matches_comp); ++$i) {
			if(!isset($filt_matches[$matches_comp[$i]['Saison']])) {
				$filt_matches[$matches_comp[$i]['Saison']] = array();
			}
			$filt_matches[$matches_comp[$i]['Saison']][] = $matches_comp[$i]['NomAdversaire'] . " " . $matches_comp[$i]['ButsOM'] . "-" . $matches_comp[$i]['ButsAdv'];
		}
		$comp['Matches'] = $filt_matches;
		
		$all_comp[] = $comp;
	}

	// niveaux
	$filt_niveaux = array();
	foreach($niveaux as $niveau => $val){
		$niv = array();
		$niv['Label'] = $niveau . " [" . $val[1] . "]";
		$niv['Value'] = $val[0];
		$filt_niveaux[] = $niv;
	}
	
	return array(
    "niveaux" => $filt_niveaux,
    "competitions" => $all_comp
  );
}


function getNiveau($saison, &$niveaux) {
	$niveau = $saison['Bilan'];

	// hack
	if($saison['IdCompetition'] == 2) { // D2
		$niveau = "(D2) " . $niveau;
	} else if($saison['IdCompetition'] == 1 || $saison['IdCompetition'] == 17 || $saison['IdCompetition'] == 4 || $saison['IdCompetition'] == 20) { // D1
		$niveau = "(D1) " . $niveau;
	}
	
	if(!isset($niveaux[$niveau])) {
		return null;
	}
	++$niveaux[$niveau][1];
	return $niveaux[$niveau][0];
}


?>
