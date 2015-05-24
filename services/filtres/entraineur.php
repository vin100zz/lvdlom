<?php

class FiltreEntraineur
{
	static private $_items;
	private $_selection;
//=========================================================================	
	static public function init()
	{
		if(self::$_items == null)
		{
			self::$_items = DBAccess::keyVal
			(
				"SELECT dirigeants.IdDirigeant, Prenom || ' ' || Nom
				FROM dirigeants
				LEFT JOIN dirige ON dirigeants.IdDirigeant = dirige.IdDirigeant
				WHERE IdFonction = 1
				ORDER BY Nom, Prenom"
			);
		}
	}
//=========================================================================	
	public function __construct()
	{
		self::init();
		$this->_selection = General::request("filtreEntraineur");
		
		// default value
		if($this->_selection == null)
		{
			$this->_selection = "all";
		}
	}	
//=========================================================================	
	public function draw()
	{	 
		println("<div class='filter'>");
		 
			HtmlImage::drawImage("bullet");
	 		println("<span class='filterLabel'>Entraîneur :</span>");
			 
		 	println("<select name='filtreEntraineur'>");
				HtmlForm::drawOption("all", "=== Tous les entraîneurs ===", $this->_selection);
				foreach(self::$_items as $aIdEntraineur => $aNomEntraineur)
				{
					HtmlForm::drawOption($aIdEntraineur, $aNomEntraineur, $this->_selection);
				}		
			 println("</select>"); 
			 
		 println("</div>");
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
			return "IdDirigeant = '" . $this->_selection . "'";
		}
	}	
}

?>