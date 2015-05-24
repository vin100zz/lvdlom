<?php

class FiltreFormeAuClub
{
	private $_selection;
//===================================================================	
	public function __construct()
	{
		$this->_selection = General::request("formeAuClub");
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
			return "ClubPrecedent LIKE '%au club%'";
		}
	}	
}

?>