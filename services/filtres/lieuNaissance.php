<?php

class FiltreLieuNaissance
{
	private $_selection;
//===================================================================	
	public function __construct()
	{
		$this->_selection = General::request("lieuNaissance");
		
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
		else if($this->_selection == "MRS")
		{
			return "VilleNaissance = 'Marseille'";
		}
    else if($this->_selection == "13")
		{
			return "TerritoireNaissance = '13'";
		}
	}	
}

?>