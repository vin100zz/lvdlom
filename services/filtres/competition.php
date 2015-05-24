<?php

class FiltreCompetition
{
	private $_selection;
//=========================================================================	
	public function __construct()
	{
		$this->_selection = General::request("competition");
		
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
		else if($this->_selection == "CH")
		{ 
			return "TypeCompetition = 'Championnat'";
		}
		else if($this->_selection == "CH1")
		{ 
			return "(SousTypeCompetition = 'D1' OR SousTypeCompetition = 'L1')";
		}
		else if($this->_selection == "CH2")
		{ 
			return "(SousTypeCompetition = 'D2' OR SousTypeCompetition = 'L2')";
		}
		else if($this->_selection == "CHX")
		{ 
			return "(TypeCompetition = 'Championnat' AND SousTypeCompetition NOT IN ('D1', 'D2', 'L1', 'L2'))";
		}
		else if($this->_selection == "CE")
		{ 
			return "TypeCompetition = 'Coupe d''Europe'";
		}
		else if($this->_selection == "C1")
		{ 
			return "SousTypeCompetition = 'C1'";
		}
		else if($this->_selection == "C2")
		{ 
			return "SousTypeCompetition = 'C2'";
		}
		else if($this->_selection == "C3")
		{ 
			return "SousTypeCompetition = 'C3'";
		}
		else if($this->_selection == "CEX")
		{ 
			return "(TypeCompetition = 'Coupe d''Europe' AND SousTypeCompetition NOT IN ('C1', 'C2', 'C3'))";
		}
		else if($this->_selection == "CN")
		{ 
			return "TypeCompetition = 'Coupe Nationale'";
		}
		else if($this->_selection == "CNF")
		{ 
			return "SousTypeCompetition = 'CF'";
		}
		else if($this->_selection == "CNX")
		{ 
			return "(TypeCompetition = 'Coupe Nationale' AND SousTypeCompetition NOT IN ('CF'))";
		}
	}	
}

?>