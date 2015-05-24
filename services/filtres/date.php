<?php

class FiltreDate
{
	private $_min;
	private $_max;
//=========================================================================	
	public function __construct()
	{
		$this->_min = General::request("filtreMinDate");
		$this->_max = General::request("filtreMaxDate");
		
		// default value
		if($this->_min == null)
		{
			$this->_min = "1899-01-01";
		}
		if($this->_max== null)
		{
			$this->_max = "2016-01-01";
		}
	}	
//=========================================================================	
	public function draw()
	{	 
		println("<div class='filter'>");
		 
	 		HtmlImage::drawImage("bullet");
	 		println("<span class='filterLabel'>Dates :</span>");
	 
 			println("<div id='slider'>");
		 	    println("<span id='slider_highlight'></span>");
			    println("<div id='slider_min_thumb'><img src='style/images/thumb-left.gif'></div>");
			    println("<div id='slider_max_thumb'><img src='style/images/thumb-right.gif'></div>");
			println("</div>");
			println("<div id='slider_range'></div>");
			
			println("<input type='hidden' id='filtreMinDate' name='filtreMinDate' value='" . $this->_min . "' />");
			println("<input type='hidden' id='filtreMaxDate' name='filtreMaxDate' value='" . $this->_max . "' />");
			
			println("<script>initSlider();</script>");

		 println("</div>");
	}
//=========================================================================	
	public function getClause()
	{
		return "DateMatch >= '" . $this->_min . "' AND DateMatch <= '" . $this->_max . "'";
	}	
}

?>