<?php

class FiltreSaison
{
	private $_selection;
//=========================================================================	
	public function __construct($iDefaut = null)
	{
		$this->_selection = General::request("saison");
		
		// default value
		if($this->_selection == null)
		{
			$this->_selection = "all";
		}	
	}
//=========================================================================	
	public function getClause()
	{
		if($this->_selection == "all")
		{
			return "1";
		}
		else
		{
			return "matches.Saison = '" . $this->_selection . "'";
		}
	}	
}

?>