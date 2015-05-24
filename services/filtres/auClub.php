<?php

class FiltreAuClub
{
	private $_selection;
//=========================================================================	
	public function __construct()
	{
		$this->_selection = General::request("auClub");
	}
//=========================================================================	
	public function getClause()
	{	
		if($this->_selection == null)
		{
			return "1";
		}
		else
		{
			return "(AuClub = '1' OR AuClub = 'Y')";
		}
	}	
}

?>