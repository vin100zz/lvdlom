<?php

class General
{
	public static function session($param)
	{
		return ( isset($_SESSION[$param]) ? unserialize(rawurldecode($_SESSION[$param])) : null);
	}
//=========================================================================	
	public static function save($key, $value)
	{
		$_SESSION[$key] = rawurlencode(serialize(($value)));
	}
//=========================================================================	
	public static function request($param)
	{
		return ( isset($_REQUEST[$param]) ? $_REQUEST[$param] : null);
	}
//=========================================================================	
	public static function payload()
	{
		return json_decode(file_get_contents('php://input'), true);
	}	
//=========================================================================	
	public static function stripAccents($string)
	{
		return strtr($string, 'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
						 	  'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY');
	}
//=========================================================================
	public static function domicile($iMatch)
	{
		if(!isset($iMatch["Lieu"])) return false;
		$aLieu = $iMatch["Lieu"];
		if($aLieu == null) return false;
		if(strncmp($aLieu, "Stade V", 7) == 0 || strncmp($aLieu, "Orange V", 8) == 0 || $aLieu == "Huveaune")
		{
			return true;
		}		
		return false;
	}
//=========================================================================
	public static function neutre($iMatch)
	{			
		if(!isset($iMatch["Niveau"])) return false;
		$aNiveau = $iMatch["Niveau"];
		if($aNiveau == null) return false;
		if($aNiveau == "FINALE")
		{
			return true;
		}		
		return false;
	}
//=========================================================================
	public static function corrigeDisplayPourSQL($data) //String corrigeDisplayPourSQL(String $data)
	{
		$res = $data;
		
		$res = str_replace("'", "''", $res);
		$res = str_replace("&apos;", "''", $res);

		return $res;
	}
//=========================================================================
	public static function resultat($iMatch)
	{
		$aButsOM = intval($iMatch["ButsOM"]);
		$aButsAdv = intval($iMatch["ButsAdv"]);
		
		$aTabOM = null;
		$aTabAdv = null;  
		if($iMatch["RqScore"] == "tab")
		{		
			$aTabOM = intval($iMatch["TABOM"]);
			$aTabAdv = intval($iMatch["TABAdv"]);
		}
		
		if($aButsOM > $aButsAdv)
		{
			return "V";
		}
		if($aButsOM < $aButsAdv)
		{
			return "D";
		}
		if($aTabOM == null)
		{
			return "N";
		}		
		if($aTabOM > $aTabAdv)
		{
			return "V";
		}
		return "D";
	}
//=========================================================================
	public static function chart($aBilan, $colors, $legend)
	{
		$aParams = "cht=bhs"; // chart type
		
		// data
		$aParams .= "&chd=t:"; 
		$aParams .= $aBilan[0];
		for($i=1; $i<count($aBilan); $i++)
		{
			$aParams .= "," . $aBilan[$i];
		}
		
		// colors
		$aParams .= "&chco="; 
		$aParams .= $colors[0];
		for($i=1; $i<count($colors); $i++)
		{
			$aParams .= "|" . $colors[$i];
		}
		
		// legend
		$aParams .= "&chdl="; 
		$aParams .= $legend[0];
		for($i=1; $i<count($legend); $i++)
		{
			$aParams .= "|" . $legend[$i];
		}
		
		$aMax = max(max($aBilan) + 2, floor(max($aBilan)*1.2));
		$aParams .= "&chds=0,$aMax"; // min,max
		$aParams .= "&chs=250x75"; // size
		$aParams .= "&chf=bg,s,FFFFFF00"; // background
		$aParams .= "&chm=N,251A6D,0,-1,12,,:5:0"; //markers
		$aParams .= "&chbh=15"; // bar width
		
		return "<img src='http://chart.apis.google.com/chart?$aParams' />";
	}
//=========================================================================	
	static public function consolidateBilan($iBilan)
	{
		// bilan
		$aBilanMatches = array(0, 0, 0); // vict, nul, déf
		$aBilanButs = array(0, 0); // bp, bc
		
		for($i=0; $i<count($iBilan); $i++)
		{		
			$aLigne = $iBilan[$i];
			
			$aBilanMatches[0] += $aLigne["nb_vict"];
			$aBilanMatches[1] += $aLigne["nb_nul"];
			$aBilanMatches[2] += $aLigne["nb_matches"] - $aLigne["nb_vict"] - $aLigne["nb_nul"];
			
			$aBilanButs[0] += $aLigne["bp"];
			$aBilanButs[1] += $aLigne["bc"];
		}
		
		return array("matches" => $aBilanMatches, "buts" => $aBilanButs, "count" => count($iBilan));
	}
//=========================================================================
	public static function consolidateAndBuildBilan($iBilan, $iTitre)
	{
		$aConsolidatedBilan = General::consolidateBilan($iBilan);
		return General::buildBilan($aConsolidatedBilan["matches"], $aConsolidatedBilan["buts"], $aConsolidatedBilan["count"], $iTitre);
	}
//=========================================================================
	public static function buildBilan($iBilanMatches, $iBilanButs, $iNbItems, $iTitre)
	{		
		// titre
		$aTitre = $iNbItems . " " . $iTitre . ($iNbItems>1?"s":"");
					
		// bilan matches
		$aColors = array("008000", "FF9900", "FF0000");
		$aLegend = array("V", "N", "D");	
		
		$aStats = "<div id='bilan-title'>$aTitre</div>";
		$aStats .= General::chart($iBilanMatches, $aColors, $aLegend);
		
		// bilan buts
		$aColors = array("008000", "FF0000");
		$aLegend = array("BP", "BC");
		$aStats .= General::chart($iBilanButs, $aColors, $aLegend);
		
		return $aStats;
	}
//=========================================================================
	public static function handleNullStringsInSqlConcat ($column) {
	  return "(case when $column is null then '' else $column end)";
	}

}

?>
