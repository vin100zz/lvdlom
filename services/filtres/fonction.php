<?php

class FiltreFonction
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
				"SELECT IdFonction, Titre
				FROM fonctions
				ORDER BY Titre"
			);
		}
	}
//=========================================================================	
	public function __construct()
	{
		self::init();
		$this->_selection = General::request("filtreFonction");
		
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
	 		println("<span class='filterLabel'>Fonction :</span>");
			 
		 	println("<select name='filtreFonction'>");
				HtmlForm::drawOption("all", "=== Toutes les fonctions ===", $this->_selection);
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
			return "IdFonction = '" . $this->_selection . "'";
		}
	}	
}

?>