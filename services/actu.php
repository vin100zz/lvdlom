<?php

require_once 'utils/service.php';

// ********************************************************
// ******* Web Scrapping **********************************
// ********************************************************

$prochainsMatches = array();

$context = stream_context_create([
  'http' => [
    'timeout'     => 10,
    'method'      => 'GET',
    'header'      => implode("\r\n", [
      'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language: fr-FR,fr;q=0.9',
      'Connection: close',
    ]),
  ],
  'ssl' => [
    'verify_peer'      => false,
    'verify_peer_name' => false,
  ],
]);
$htmlSource = @file_get_contents('https://www.footmarseille.com', false, $context);
if ($htmlSource) {
  // Sélectionne uniquement les blocs de prochains matches (class="match-item next ...")
  preg_match_all('/<a[^>]*class="[^"]*match-item next[^"]*"[^>]*>(.*?)<\/a>/s', $htmlSource, $nextMatches, PREG_SET_ORDER);

  foreach ($nextMatches as $matchBlock) {
    $block = $matchBlock[1];

    // Date et heure : <div\nclass=date-hour> (retour à la ligne entre tag et attribut dans le HTML live)
    preg_match('/<div\s+class=date-hour>(.*?)<\/div>/s', $block, $dateHourMatch);
    $dateHour = '';
    if (!empty($dateHourMatch[1])) {
      // Remplace <small>20h45</small> par " 20h45"
      $dateHour = preg_replace('/<small>(.*?)<\/small>/', ' $1', $dateHourMatch[1]);
      $dateHour = preg_replace('/\s+/', ' ', trim(strip_tags($dateHour)));
    }

    // Équipe domicile : <div\nclass="team home"> et <div\nclass=name>
    preg_match('/<div\s+class="team home">.*?<div\s+class=name>(.*?)<\/div>/s', $block, $homeMatch);
    $homeTeam = !empty($homeMatch[1]) ? trim(strip_tags($homeMatch[1])) : '';

    // Équipe extérieure : <div\nclass="team away">
    preg_match('/<div\s+class="team away">.*?<div\s+class=name>(.*?)<\/div>/s', $block, $awayMatch);
    $awayTeam = !empty($awayMatch[1]) ? trim(strip_tags($awayMatch[1])) : '';

    if ($homeTeam && $awayTeam) {
      $homeTeam = ($homeTeam === 'Marseille') ? 'OM' : $homeTeam;
      $awayTeam = ($awayTeam === 'Marseille') ? 'OM' : $awayTeam;

      // "dim 26 20h45" → "dimanche 26 (20h45)"
      $joursComplets = [
        'lun' => 'lundi', 'mar' => 'mardi', 'mer' => 'mercredi',
        'jeu' => 'jeudi', 'ven' => 'vendredi', 'sam' => 'samedi', 'dim' => 'dimanche'
      ];
      $dateFormatee = preg_replace_callback(
        '/^(\w{3})\s+(\d+)\s+(\S+)$/',
        function($m) use ($joursComplets) {
          $jour = isset($joursComplets[$m[1]]) ? $joursComplets[$m[1]] : $m[1];
          return $jour . ' ' . $m[2] . ' (' . $m[3] . ')';
        },
        $dateHour
      );

      $prochainsMatches[] = array(
        "match" => $homeTeam . " - " . $awayTeam,
        "date"  => $dateFormatee
      );
    }
  }
}


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

// dernier match
$ficheMatch = DBAccess::singleRow
("
  SELECT *
  FROM matches, adversaires
  WHERE matches.Adversaire = adversaires.IdAdversaire
    AND DateMatch =
  (
    SELECT MAX(DateMatch)
    FROM matches
  )
");
$domicile = General::domicile($ficheMatch) || General::neutre($ficheMatch);
$clubGauche = ($domicile ? "OM" : $ficheMatch["NomAdversaire"]);
$clubDroite = ($domicile ? $ficheMatch["NomAdversaire"] : "OM");
$butsGauche = ($domicile ? $ficheMatch["ButsOM"] : $ficheMatch["ButsAdv"]);
$butsDroite = ($domicile ? $ficheMatch["ButsAdv"] : $ficheMatch["ButsOM"]);

$dernierMatch = array(
  "id" => $ficheMatch["IdMatch"],
  "clubGauche" => $clubGauche,
  "clubDroite" => $clubDroite,
  "butsGauche" => $butsGauche,
  "butsDroite" => $butsDroite
);
    

// ********************************************************
// ******* JSON *******************************************
// ********************************************************  

$json = array(
  "prochainsMatches" => $prochainsMatches,
  "dernierMatch" => $dernierMatch
);
print json_encode($json, JSON_PRETTY_PRINT);

?>