<?php

class FiltreJyEtais
{
	private $_selection;
//=========================================================================	
	public function __construct()
	{
		$this->_selection = General::request("jyEtais");
	}
//=========================================================================	
	public function getClause()
	{	
		if ($this->_selection == 'P') {
			return "JYEtais <> ''";
		} else if ($this->_selection == 'V') {
			return "JYEtais LIKE '%V%'";
		} else {
			return "1";
		}
	}	
}

?>