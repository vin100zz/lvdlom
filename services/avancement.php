<?php

require_once 'utils/service.php';


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// SQL
$listeMatches = DBAccess::query
("
  SELECT
    matches.IdMatch AS id,
    Saison AS saison,
    NomAdversaire AS adversaire,
    ButsOM AS butsOM,
    ButsAdv AS butsAdv,
    NbDocs AS nbDocs
  FROM matches
  LEFT JOIN adversaires ON matches.Adversaire = adversaires.IdAdversaire
  LEFT JOIN
  (SELECT IdObjet, COUNT(*) as NbDocs
  FROM documentsAssoc
  WHERE AssocType = 'M'
  GROUP BY IdObjet) AS table_docs ON matches.IdMatch = table_docs.IdObjet  
  ORDER BY DateMatch ASC
");

// SQL
$listeJoueurs = DBAccess::query
("
  SELECT
    joueurs.IdJoueur AS id,
    Prenom AS prenom,
    Nom AS nom,
    NbDocs AS nbDocs
  FROM joueurs
  LEFT JOIN
  (SELECT IdObjet, COUNT(*) as NbDocs
  FROM documentsAssoc
  WHERE AssocType = 'J'
  GROUP BY IdObjet) AS table_docs ON joueurs.IdJoueur = table_docs.IdObjet   
  ORDER BY Nom ASC, Prenom ASC
");


// ********************************************************
// ******* BOM ********************************************
// ********************************************************




// ********************************************************
// ******* JSON ********************************************
// ********************************************************

respond(array(
  "matches" => $listeMatches,
  "joueurs" => $listeJoueurs
));


// ********************************************************
// ******* HTML *******************************************
// ********************************************************  

/*
// begin html
HtmlLayout::beginHTML("Avancement");

println("<div class='container'>");

// titre
HtmlLayout::drawTitle(25, "Avancement");

// matches
println("<div class='span-23 push-1 last'>");

$aNbMatchAvecPhotos = 0;
$aNbMatchSansPhotos = 0;

// table
println("<table id='avancement'>");
    
// liste matches
$aSaison = "";    
for($i=0; $i<count($listeMatches); ++$i)
{
  $aMatch = $listeMatches[$i];
  
  // saison
  if($aSaison != $aMatch["Saison"])
  {
    if($aSaison != "") println("</tr>");
    $aSaison = $aMatch["Saison"];
    println("<tr><td><b>$aSaison</b></td>");
  }

  $aNbDocs = $aMatch["NbDocs"] > 0 ? $aMatch["NbDocs"] : "-";
  if($aNbDocs > 0)
  {
    $aClass = "";
    ++$aNbMatchAvecPhotos;
  }
  else
  {
    $aClass = "todo";
    ++$aNbMatchSansPhotos;
  }
  $aIdMatch = $aMatch["IdMatch"];
  $aTitle = $aMatch["NomAdversaire"] . " " . $aMatch["ButsOM"] . "-" . $aMatch["ButsAdv"];
  println("<td class='$aClass' title='$aTitle'><a href='#ficheMatch/$aIdMatch'>$aNbDocs</a></td>");
}
println("</tr>");
println("</table>");

$aNbMatches = $aNbMatchAvecPhotos + $aNbMatchSansPhotos;
$aPc = round(100 * $aNbMatchAvecPhotos / $aNbMatches, 2);
println("<div id='pcAvancement' class='span-23 last subtitle'>Avancement Matches : $aPc % ($aNbMatchAvecPhotos / $aNbMatches)</div>");

println("</div>");

// ------------------------------------------

// joueurs
println("<div class='span-23 push-1 last'>");

$aNbJoueurAvecPhotos = 0;
$aNbJoueurSansPhotos = 0;

// table
println("<table id='avancement'>");
    
// liste joueurs
$aLettre = "";    
for($i=0; $i<count($listeJoueurs); ++$i)
{
  $aJoueur = $listeJoueurs[$i];
  
  // saison
  if($aLettre != $aJoueur["Nom"][0])
  {
    if($aLettre != "") println("</tr>");
    $aLettre = $aJoueur["Nom"][0];
    println("<tr><td><b>$aLettre</b></td>");
  }

  $aNbDocs = $aJoueur["NbDocs"] > 0 ? $aJoueur["NbDocs"] : "-";
  if($aNbDocs > 0)
  {
    $aClass = "";
    ++$aNbJoueurAvecPhotos;
  }
  else
  {
    $aClass = "todo";
    ++$aNbJoueurSansPhotos;
  }
  $aIdJoueur = $aJoueur["IdJoueur"];
  $aTitle = $aJoueur["Prenom"] . " " . $aJoueur["Nom"];
  println("<td class='$aClass' title='$aTitle'><a href='#ficheJoueur/$aIdJoueur'>$aNbDocs</a></td>");
}
println("</tr>");
println("</table>");

$aNbMatches = $aNbJoueurAvecPhotos + $aNbJoueurSansPhotos;
$aPc = round(100 * $aNbJoueurAvecPhotos / $aNbMatches, 2);
println("<div id='pcAvancement' class='span-23 last subtitle'>Avancement Joueurs : $aPc % ($aNbJoueurAvecPhotos / $aNbMatches)</div>");



println("</div>");


*/

?>