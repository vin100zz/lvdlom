<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode());

// SQL
$entraineurs = DBAccess::query
("
	SELECT
    dirigeants.IdDirigeant AS id,
    Prenom AS prenom,
    Nom AS nom,
    nbSaisons,
    nbMatches,
    nbVictoires,
    nbNuls,
    bp,
    bc,
    titres,
    periode
    
	FROM dirigeants
  
  LEFT JOIN
   (SELECT dirigeants.IdDirigeant, (strftime('%Y', Min(Debut)) || '-' || strftime('%Y', Max(Fin))) as periode
    FROM dirigeants, dirige
    WHERE dirigeants.IdDirigeant = dirige.IdDirigeant AND IdFonction=1
    GROUP BY dirigeants.IdDirigeant) AS table_periode ON dirigeants.IdDirigeant = table_periode.IdDirigeant
	
	LEFT JOIN
	(
		SELECT IdDirigeant, count(*) as nbMatches
		FROM dirige
		LEFT JOIN matches
		WHERE DateMatch >= Debut AND DateMatch <= Fin
			AND " . Filters::getClause($filtres) . "
			AND IdFonction=1
		GROUP BY IdDirigeant
	) as table_matches ON dirigeants.IdDirigeant = table_matches.IdDirigeant
		
	LEFT JOIN
	(
		SELECT IdDirigeant, count(*) as nbVictoires
		FROM dirige
		LEFT JOIN matches
		WHERE DateMatch >= Debut AND DateMatch <= Fin
			AND " . Filters::getClause($filtres) . "
			AND ( ButsOM > ButsAdv OR (ButsOM = ButsAdv AND TABOM > TABAdv) )
			AND IdFonction=1
		GROUP BY IdDirigeant
	) as table_vict ON dirigeants.IdDirigeant = table_vict.IdDirigeant
	
	LEFT JOIN
	(
		SELECT IdDirigeant, count(*) as nbNuls
		FROM dirige
		LEFT JOIN matches
		WHERE DateMatch >= Debut AND DateMatch <= Fin
			AND " . Filters::getClause($filtres) . "
			AND (ButsOM = ButsAdv AND TABOM IS NULL)
			AND IdFonction=1
		GROUP BY IdDirigeant
	) as table_nuls ON dirigeants.IdDirigeant = table_nuls.IdDirigeant
	
	LEFT JOIN
	(
		SELECT iddirigeant, count(*) as nbSaisons
		FROM
		(
			SELECT DISTINCT iddirigeant, saison
			FROM dirige
			LEFT JOIN matches
			WHERE DateMatch >= Debut AND DateMatch <= Fin
				AND " . Filters::getClause($filtres) . "
				AND IdFonction=1
		)
		GROUP BY iddirigeant
	) as table_saisons ON dirigeants.IdDirigeant = table_saisons.IdDirigeant
	
	LEFT JOIN
	(
		SELECT IdDirigeant, sum(ButsOM) as bp
		FROM dirige
		LEFT JOIN matches
		WHERE DateMatch >= Debut AND DateMatch <= Fin
			AND " . Filters::getClause($filtres) . "
			AND IdFonction=1
		GROUP BY IdDirigeant
	) as table_bp ON dirigeants.IdDirigeant = table_bp.IdDirigeant
	
	LEFT JOIN
	(
		SELECT IdDirigeant, sum(ButsAdv) as bc
		FROM dirige
		LEFT JOIN matches
		WHERE DateMatch >= Debut AND DateMatch <= Fin
			AND " . Filters::getClause($filtres) . "
			AND IdFonction=1
		GROUP BY IdDirigeant
	) as table_bc ON dirigeants.IdDirigeant = table_bc.IdDirigeant 
	
	LEFT JOIN
	(
		SELECT IdDirigeant, group_concat(SousTypeCompetition) as titres
		FROM
		(
			SELECT IdDirigeant, palmares.Saison, SousTypeCompetition
			FROM palmares
			JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
			JOIN matches ON palmares.Match1 = matches.IdMatch
			JOIN dirige
			WHERE DateMatch >= Debut AND DateMatch <= Fin
				AND palmares.titre = 1
				AND " . Filters::getClause($filtres) . "
				AND IdFonction=1
			UNION
			SELECT IdDirigeant, palmares.Saison, SousTypeCompetition
			FROM palmares
			JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
			JOIN matches ON matches.Saison = palmares.Saison
			JOIN dirige
			WHERE DateMatch >= Debut AND DateMatch <= Fin
				AND palmares.titre = 1
				AND " . Filters::getClause($filtres) . "
				AND IdFonction=1
		)
		GROUP BY IdDirigeant
	) as table_palmares ON dirigeants.IdDirigeant = table_palmares.IdDirigeant

	WHERE nbMatches > 0
	
	ORDER BY nbMatches DESC, nbVictoires DESC, nom ASC
");


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

respond($entraineurs);

?>