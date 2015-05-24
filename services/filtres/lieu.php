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
			return "(Lieu='Stade Vél''' OR Lieu='Huveaune')";
		}
		else if($this->_selection == "HUV")
		{
			return "Lieu='Huveaune'";
		}
		else if($this->_selection == "VEL")
		{
			return "Lieu='Stade Vél'''";
		}
		else if($this->_selection == "EXT")
		{
			return "(Lieu<>'Stade Vél''' AND Lieu<>'Huveaune')";
		}
		else
		{
			return "1";
		}
	}	
}

?>