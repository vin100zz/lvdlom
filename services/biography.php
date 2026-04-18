<?php

set_time_limit(0); // pas de limite d'exécution PHP

require_once 'utils/db.php';
require_once 'utils/headers.php';
require_once 'utils/general.php';
require_once 'utils/ai.php';

$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
  require_once $configFile;
}

$idJoueur = intval(General::request('id'));

if (!$idJoueur) {
  http_response_code(400);
  print json_encode(['error' => 'ID joueur manquant'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Infos de base du joueur
$joueur = DBAccess::singleRow(
  "SELECT Nom AS nom, Prenom AS prenom, Poste AS poste,
   DateNaissance AS dateNaissance, VilleNaissance AS villeNaissance,
   TerritoireNaissance AS territoireNaissance, Nationalite AS nationalite,
   Selections AS selections, DateDeces AS dateDeces,
   ClubPrecedent AS clubPrecedent, ClubSuivant AS clubSuivant
   FROM joueurs WHERE IdJoueur = " . $idJoueur
);

if (!$joueur || !$joueur['nom']) {
  http_response_code(404);
  print json_encode(['error' => 'Joueur non trouvé'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Nombre de matchs à l'OM
$nbMatchs = intval(DBAccess::singleValue(
  "SELECT COUNT(*) FROM joue WHERE IdJoueur = $idJoueur"
));

// Nombre de buts à l'OM
$nbButs = intval(DBAccess::singleValue(
  "SELECT COUNT(*) FROM buteursom WHERE IdJoueur = $idJoueur"
));

// Saisons jouées à l'OM
$saisons = DBAccess::singleColumn(
  "SELECT DISTINCT Saison FROM joue
   JOIN matches ON joue.IdMatch = matches.IdMatch
   WHERE joue.IdJoueur = $idJoueur
   ORDER BY Saison"
);

// Palmarès (titres et finales)
$palmares = DBAccess::query(
  "SELECT Saison AS saison, palmares.Titre AS titre, Bilan AS bilan,
   NomCompetition AS competition, TypeCompetition AS typeCompetition
   FROM palmares
   JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
   JOIN joue ON palmares.Match1 = joue.IdMatch
   WHERE joue.IdJoueur = $idJoueur
     AND palmares.Titre NOT NULL

   UNION

   SELECT DISTINCT palmares.Saison AS saison, palmares.Titre AS titre,
   Bilan AS bilan, NomCompetition AS competition, TypeCompetition AS typeCompetition
   FROM palmares
   JOIN competitions ON competitions.IdCompetition = palmares.IdCompetition
   JOIN matches ON matches.Saison = palmares.Saison
   JOIN joue ON matches.IdMatch = joue.IdMatch
   WHERE joue.IdJoueur = $idJoueur
     AND TypeCompetition = 'Championnat'
     AND palmares.Titre NOT NULL
   ORDER BY saison ASC"
);

// Construction du prompt
$posteMap = ['GA' => 'Gardien de but', 'DE' => 'Défenseur', 'MI' => 'Milieu de terrain', 'AV' => 'Attaquant'];
$poste = isset($posteMap[$joueur['poste']]) ? $posteMap[$joueur['poste']] : $joueur['poste'];
$prenom = $joueur['prenom'];
$nom = $joueur['nom'];

$infos  = "Nom complet : $prenom $nom\n";
$infos .= "Poste : $poste\n";
if ($joueur['dateNaissance'])       $infos .= "Date de naissance : {$joueur['dateNaissance']}\n";
if ($joueur['villeNaissance']) {
  $lieu = $joueur['villeNaissance'];
  if ($joueur['territoireNaissance']) $lieu .= ", {$joueur['territoireNaissance']}";
  $infos .= "Lieu de naissance : $lieu\n";
}
if ($joueur['nationalite'])         $infos .= "Nationalité : {$joueur['nationalite']}\n";
if ($joueur['dateDeces'])           $infos .= "Décédé le : {$joueur['dateDeces']}\n";
if ($joueur['selections'])          $infos .= "Sélections internationales : {$joueur['selections']}\n";
if ($joueur['clubPrecedent'])       $infos .= "Club précédent : {$joueur['clubPrecedent']}\n";
if ($joueur['clubSuivant'])         $infos .= "Club suivant : {$joueur['clubSuivant']}\n";
if ($saisons)                       $infos .= "Saisons à l'OM : " . implode(', ', $saisons) . "\n";
$infos .= "Matchs joués à l'OM : $nbMatchs\n";
$infos .= "Buts marqués à l'OM : $nbButs\n";

if ($palmares) {
  $infos .= "Palmarès à l'OM :\n";
  foreach ($palmares as $p) {
    $infos .= "  - {$p['titre']} — {$p['competition']} ({$p['saison']}) [{$p['bilan']}]\n";
  }
}

$prompt = "Tu es un expert en histoire du football et de l'Olympique de Marseille. " .
"Génère une biographie complète en 400 mots en français pour le joueur suivant.\n\n" .
"Données disponibles :\n$infos\n" .
"Rédige une biographie fluide et structurée : présentation générale, parcours avant l'OM (si connu), " .
"carrière à l'OM avec saisons importantes, style de jeu, moments marquants, palmarès, " .
"et parcours après l'OM (si connu). Enrichis avec tes connaissances générales sur ce joueur si tu en as. " .
"Sois précis, factuel, et évite la spéculation excessive.\n\n" .
"Réponds UNIQUEMENT avec du JSON valide, sans texte avant ni après, au format :\n" .
"{\n  \"biographie\": \"texte HTML\"\n}";

// Appel AI générique
try {
  $aiResult = AI::call($prompt, ['biographie']);
} catch (RuntimeException $e) {
  http_response_code(500);
  print json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

$result = [];
$result['biographie'] = $aiResult['data']['biographie'];
if ($aiResult['truncated']) {
  $result['warning'] = 'La réponse a été tronquée (limite de tokens atteinte). Augmentez AI_MAX_TOKENS dans config.php.';
}
$result['prompt'] = $prompt; // pour debug

print json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

?>
