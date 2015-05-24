<?php

class FiltreLieu
{
	private $_selection;
//=========================================================================	
	public function __construct()
	{
		$this->_selection = General::request("lieu");
		
		// default value
		if($this->_selection == null)
		{
			$this->_selection = "all";
		}	
	}
//=========================================================================	
	public function getClause()
	{
		if($this->_selection == "DOM")
		{
			return "(Lieu='Stade V�l''' OR Lieu='Huveaune')";
		}
		else if($this->_selection == "HUV")
		{
			return "Lieu='Huveaune'";
		}
		else if($this->_selection == "VEL")
		{
			return "Lieu='Stade V�l'''";
		}
		else if($this->_selection == "EXT")
		{
			return "(Lieu<>'Stade V�l''' AND Lieu<>'Huveaune')";
		}
		else
		{
			return "1";
		}
	}	
}

?>