<?php

class FiltrePeriode
{
	private $_selection;
//===================================================================	
	public function __construct()
	{
		$this->_selection = General::request("periode");
		
		// default value
		if($this->_selection == null)
		{
			$this->_selection = "all";
		}	
	}
//=========================================================================	
	public function getClause()
	{
		if ($this->_selection == "AVG") {
			return "DateMatch < '1945-08-01'";
		} else if ($this->_selection == "APG") {
			return "DateMatch > '1945-08-01'";
		} else if (is_numeric($this->_selection)) {
      $decade = intval($this->_selection);
      $end = $decade + 10;
			return "DateMatch >= '$decade-01-01' AND DateMatch < '$end-01-01'";
		} else {
      return "1";
    }
	}	
}

?>