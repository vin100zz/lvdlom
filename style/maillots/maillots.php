<?php

class Maillot
{
	// constructor
	public function __construct($iTemplate, $iColor1, $iColor2, $iColor3)
	{
		$this->_template = $iTemplate;
		$this->_color1 = $iColor1;
		$this->_color2 = $iColor2;
		$this->_color3 = $iColor3;
	}
		
	var $_template;
	var $_color1;
	var $_color2;
	var $_color3;
}

$maillots = array
(
"AJAX AMSTERDAM" => new Maillot(16, "FFFFFF", "EC1346", "EC1346"),
"ARLES-AVIGNON" => new Maillot(5, "FFDD02", "045395", "045395"),
"ARSENAL" => new Maillot(2, "EE0007", "FFFFFF", "FFFFFF"),
"ATLETICO MADRID" => new Maillot(3, "FFFFFF", "FF2900", "0A127C"),
"AUXERRE" => new Maillot(10, "FFFFFF", "233686", "233686"),
"BASTIA" => new Maillot(30, "005BAB", "FFFFFF", "FFFFFF"),
"BENFICA" => new Maillot(25, "EE2E24", "FFFFFF", "FFFFFF"),
"BORDEAUX" => new Maillot(29, "001C50", "FFFFFF", "FFFFFF"),
"BOULOGNE" => new Maillot(11, "ED1C24", "231F20", "231F20"),
"CAEN" => new Maillot(3, "00529C", "ED1C24", "00529C"),
"CHAKTHIAR DONETSK" => new Maillot(25, "F07328", "000000", "000000"),
"COPENHAGUE" => new Maillot(1, "FFFFFF", "3C1B7F", "3C1B7F"),
"ÉVIAN-THONON-GAILLARD" => new Maillot(19, "F7A8D8", "FFFFFF", "5B79CD"),
"GRENOBLE" => new Maillot(5, "FFFFFF", "005DA3", "005DA3"),
"GUINGAMP" => new Maillot(34, "EC1C23", "020202", "FFFFFF"),
"LE HAVRE" => new Maillot(5, "78BDE8", "004990", "004990"),
"LE MANS" => new Maillot(10, "E41F26", "FDB714", "FDB714"),
"LENS" => new Maillot(13, "ED1C24", "FFF200", "FFF200"),
"LILLE" => new Maillot(1, "DA2032", "FFFFFF", "FFFFFF"),
"LIVERPOOL" => new Maillot(1, "DA0229", "FFFFFF", "FFFFFF"),
"LORIENT" => new Maillot(21, "F68B1F", "FFFFFF", "000000"),
"LYON" => new Maillot(22, "FFFFFF", "023F88", "E11B22"),
"METZ" => new Maillot(1, "B0063A", "FFFFFF", "FFFFFF"),
"MILAN AC" => new Maillot(3, "ED1C24", "231F20", "231F20"),
"MONACO" => new Maillot(28, "FFFFFF", "ED1C24", "ED1C24"),
"MONTPELLIER" => new Maillot(15, "005BA6", "F37021", "FFFFFF"),
"NANCY" => new Maillot(17, "FFFFFF", "EE3224", "EE3224"),
"NANTES" => new Maillot(3, "FFDD00", "006736", "006736"),
"NICE" => new Maillot(3, "CD1E25", "231F20", "231F20"),
"PARIS SG" => new Maillot(16, "002561", "ED1C24", "FFFFFF"),
"PSV EINDHOVEN" => new Maillot(11, "ED1C24", "FFFFFF", "000000"),
"REAL MADRID" => new Maillot(1, "FFFFFF", "004799", "004799"),
"REIMS" => new Maillot(2, "D2232A", "FFFFFF", "FFFFFF"),
"RENNES" => new Maillot(2, "E03127", "000000", "000000"),
"SOCHAUX" => new Maillot(2, "FFCC32", "003F7A", "003F7A"),
"ST-ÉTIENNE" => new Maillot(1, "00A351", "FFFFFF", "FFFFFF"),
"SPARTAK MOSCOU" => new Maillot(15, "FF0D00", "FFFFFF", "FFFFFF"),
"STRASBOURG" => new Maillot(25, "00AEEF", "FFFFFF", "FFFFFF"),
"TOULOUSE" => new Maillot(12, "7D71B4", "FFFFFF", "FFFFFF"),
"TRÉLISSAC" => new Maillot(1, "41A5C0", "000000", "000000"),
"TWENTE" => new Maillot(1, "F6002F", "FFFFFF", "FFFFFF"),
"VALENCIENNES" => new Maillot(29, "EA1D2A", "FFFFFF", "FFFFFF"),
"ZURICH" => new Maillot(12, "FFFFFF", "004799", "004799"),

	
	
);


function getMaillot($club, $domicile)
{
	if($club == "OM" || $club == "MARSEILLE-PROVENCE")
	{
		return "static/maillots/om.png";
	}
	
	global $maillots;
	$aMaillot = new Maillot(1, "BBBBBB", "BBBBBB", "BBBBBB");
	
	if(isset($maillots[$club]))
		$aMaillot = $maillots[$club];
		
	return "maillot.php?template=" . $aMaillot->_template .
				"&col1=" . $aMaillot->_color1 .
				"&col2=" . $aMaillot->_color2 .
				"&col3=" . $aMaillot->_color3 .
				"&rtl=" . "true"; //( $domicile ? "true" : "false" );	
}

?>