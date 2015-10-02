<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// filtres
$filtres = array(new FiltrePeriode(),
                 new FiltreAdversaire(),
                 new FiltreCompetition(),
                 new FiltreLieu(),
                 new FiltreJyEtais());

// SQL
$filterClause = Filters::getClause($filtres);

$listeMatches = DBAccess::query("
  SELECT
    DateMatch,
    ButsOM,
    ButsAdv,
    TABOM,
    TABAdv,
    RqScore
  FROM matches
  LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
  LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
  WHERE $filterClause
  ORDER BY DateMatch ASC
");


// ********************************************************
// ******* BOM ********************************************
// ********************************************************

$out = array(
  "victoire" => calculateSerie($listeMatches, $filterClause, new Victoire()),
  "nonDefaite" => calculateSerie($listeMatches, $filterClause, new NonDefaite()),
  "defaite" => calculateSerie($listeMatches, $filterClause, new Defaite()),
  "nonVictoire" => calculateSerie($listeMatches, $filterClause, new NonVictoire()),
  "butMarque" => calculateSerie($listeMatches, $filterClause, new ButMarque()),
  "sansEncaisser" => calculateSerie($listeMatches, $filterClause, new SansEncaisser()),
  "sansMarquer" => calculateSerie($listeMatches, $filterClause, new SansMarquer()),
  "butEncaisse" => calculateSerie($listeMatches, $filterClause, new ButEncaisse())
);


// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

respond($out);


//=========================================================================


// victoire
class Victoire
{
  function isTrue($match)
  {
    return General::resultat($match) == "V";
  }
}

// sans défaite
class NonDefaite
{
  function isTrue($match)
  {
    return General::resultat($match) != "D";
  }
}

// défaites
class Defaite
{
  function isTrue($match)
  {
    return General::resultat($match) == "D";
  }
}

// sans victoire
class NonVictoire
{
  function isTrue($match)
  {
    return General::resultat($match) != "V";
  }
}

// en marquant
class ButMarque
{
  function isTrue($match)
  {
    return $match["ButsOM"] > 0;
  }
}

// sans encaisser
class SansEncaisser
{
  function isTrue($match)
  {
    return $match["ButsAdv"] == 0;
  }
}

// sans marquer
class SansMarquer
{
  function isTrue($match)
  {
    return $match["ButsOM"] == 0;
  }
}

// en encaissant
class ButEncaisse
{
  function isTrue($match)
  {
    return $match["ButsAdv"] > 0;
  }
}


//=========================================================================


function calculateSerie($matches, $filterClause, $criterion)
{
  $maxNbMatches = 0;
  $maxSerieBeginDate = 0;
  $maxSerieEndDate = 0;
  
  $currentSerieNbMatches = 0;
  $currentSerieBeginDate = 0;
  $currentSerieEndDate = 0;
  
  $serieOngoing = false;
  
  for($i=0; $i<count($matches); ++$i)
  {
    $match = $matches[$i];

    $criterionTrue = $criterion->isTrue($match);
    
    if($criterionTrue)
    {
      if($serieOngoing) // serie en cours
      {
        $currentSerieEndDate = $match["DateMatch"];
        ++$currentSerieNbMatches;
      }
      else // serie commence
      {
        $currentSerieBeginDate = $match["DateMatch"];
        $currentSerieEndDate = $match["DateMatch"];
        $currentSerieNbMatches = 1;
      }
      
      $serieOngoing = true;
    }

    if (!$criterionTrue || $i == count($matches)-1)
    {
      if($serieOngoing) // fin de serie
      {
        if($currentSerieNbMatches > $maxNbMatches)
        {
          $maxNbMatches = $currentSerieNbMatches;
          $maxSerieBeginDate = $currentSerieBeginDate;
          $maxSerieEndDate = $currentSerieEndDate;
        }
        $currentSerieNbMatches = 0;
      }
    
      $serieOngoing = false;
    }
  }
  
  // matches de la série
  $serie = DBAccess::query
  ("
    SELECT
      IdMatch AS id,
      Saison AS saison,
      DateMatch AS date,
      Lieu AS lieu,
      Niveau AS niveau,
      NomAdversaire AS nomAdv,
      ButsOM AS butsOM,
      ButsAdv AS butsAdv,
      TABOM AS tabOM,
      TABAdv AS tabAdv,
      RqScore AS rqScore,
      Competition AS competition,
      SousTypeCompetition AS sousTypeCompetition
    FROM matches
    LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
    LEFT JOIN competitions ON matches.Competition = competitions.NomCompetition
    WHERE DateMatch >= '$maxSerieBeginDate' AND DateMatch <= '$maxSerieEndDate' AND $filterClause
    ORDER BY DateMatch ASC
  ");
  
  
  return $serie;
}


?>
