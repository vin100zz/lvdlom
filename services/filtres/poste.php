<?php

class FiltrePoste
{
	private $_selection;
//===================================================================	
	public function __construct()
	{
		$this->_selection = General::request("poste");
		
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
			return "Poste = '" . $this->_selection . "'";
		}
	}	
}

?>