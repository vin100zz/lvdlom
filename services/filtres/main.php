<?php

require_once 'filtres/auClub.php';
require_once 'filtres/formeAuClub.php';
require_once 'filtres/lieuNaissance.php';
require_once 'filtres/nationalite.php';
require_once 'filtres/periode.php';
require_once 'filtres/poste.php';

require_once 'filtres/saison.php';
require_once 'filtres/adversaire.php';
require_once 'filtres/competition.php';
require_once 'filtres/date.php';
require_once 'filtres/fonction.php';
require_once 'filtres/lieu.php';
require_once 'filtres/jyEtais.php';
require_once 'filtres/entraineur.php';


class Filters
{
	static public function getClause($iFilters)
	{
		$aNbFilters = count($iFilters);
		if($aNbFilters == 0) return "";
		
		$aClause = $iFilters[0]->getClause();
		for($i=1; $i<$aNbFilters; $i++)
		{
			$aClause .= " AND " . $iFilters[$i]->getClause();
		}
		return $aClause;
	}
}

?>