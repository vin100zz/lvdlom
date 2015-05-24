<?php

class FiltreNationalite
{
  private $_selection;
//=================================================================== 
  public function __construct()
  {
    $this->_selection = General::request("nationalite");
    
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
      return "Nationalite = '" . $this->_selection . "'";
    }
  } 
}

?>