<?php

set_time_limit(0); // pas de limite d'exécution PHP

require_once 'utils/db.php';
require_once 'utils/headers.php';
require_once 'utils/general.php';

// Clé API Anthropic
$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
  require_once $configFile;
}

$provider = defined('AI_PROVIDER') ? AI_PROVIDER : 'anthropic';

if ($provider === 'openai') {
  if (!defined('OPENAI_API_KEY') || OPENAI_API_KEY === 'YOUR_OPENAI_KEY_HERE') {
    http_response_code(500);
    print json_encode(['error' => 'Clé API OpenAI non configurée. Modifiez services/config.php.'], JSON_UNESCAPED_UNICODE);
    exit;
  }
} else {
  if (!defined('ANTHROPIC_API_KEY') || ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
    http_response_code(500);
    print json_encode(['error' => 'Clé API Anthropic non configurée. Modifiez services/config.php.'], JSON_UNESCAPED_UNICODE);
    exit;
  }
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

// Appel API selon le fournisseur configuré
if ($provider === 'openai') {
  $model   = defined('OPENAI_MODEL') ? OPENAI_MODEL : 'gpt-4o';
  $payload = json_encode([
    'model'       => $model,
    'max_completion_tokens'  => AI_MAX_TOKENS,
    'messages'    => [
      ['role' => 'user', 'content' => $prompt]
    ],
    'response_format' => ['type' => 'json_object']
  ], JSON_UNESCAPED_UNICODE);

  $headers = [
    'Content-Type: application/json',
    'Authorization: Bearer ' . OPENAI_API_KEY,
    'Content-Length: ' . strlen($payload)
  ];
  $apiUrl  = 'https://api.openai.com/v1/chat/completions';
  $apiName = 'OpenAI';
} else {
  $model   = defined('ANTHROPIC_MODEL') ? ANTHROPIC_MODEL : 'claude-opus-4-5';
  $payload = json_encode([
    'model'      => $model,
    'max_tokens' => AI_MAX_TOKENS,
    'messages'   => [
      ['role' => 'user', 'content' => $prompt]
    ]
  ], JSON_UNESCAPED_UNICODE);

  $headers = [
    'Content-Type: application/json',
    'x-api-key: ' . ANTHROPIC_API_KEY,
    'anthropic-version: 2023-06-01',
    'Content-Length: ' . strlen($payload)
  ];
  $apiUrl  = 'https://api.anthropic.com/v1/messages';
  $apiName = 'Anthropic';
}

$timeout = defined('AI_TIMEOUT') ? AI_TIMEOUT : 180;

if (function_exists('curl_init')) {
  // Utilisation de cURL (ne dépend pas de allow_url_fopen)
  $ch = curl_init($apiUrl);
  curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => $headers,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => $timeout,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
  ]);
  $response = curl_exec($ch);
  $httpCode = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
  $curlError = curl_error($ch);
  curl_close($ch);

  if ($response === false || $curlError) {
    http_response_code(500);
    print json_encode(['error' => "Impossible de contacter l'API $apiName via cURL : $curlError"], JSON_UNESCAPED_UNICODE);
    exit;
  }
} else {
  // Fallback : file_get_contents (nécessite allow_url_fopen)
  $context = stream_context_create([
    'http' => [
      'method'        => 'POST',
      'header'        => implode("\r\n", $headers),
      'content'       => $payload,
      'timeout'       => $timeout,
      'ignore_errors' => true
    ],
    'ssl' => [
      'verify_peer'      => true,
      'verify_peer_name' => true
    ]
  ]);
  $response = @file_get_contents($apiUrl, false, $context);

  if ($response === false) {
    http_response_code(500);
    print json_encode(['error' => "Impossible de contacter l'API $apiName. cURL est désactivé et allow_url_fopen est désactivé dans php.ini."], JSON_UNESCAPED_UNICODE);
    exit;
  }

  $httpCode = 0;
  if (isset($http_response_header)) {
    foreach ($http_response_header as $h) {
      if (preg_match('#HTTP/\d+\.\d+\s+(\d+)#', $h, $m)) {
        $httpCode = intval($m[1]);
      }
    }
  }
}

if ($httpCode !== 200) {
  http_response_code(500);
  print json_encode(['error' => "Erreur API $apiName (HTTP $httpCode) : $response"], JSON_UNESCAPED_UNICODE);
  exit;
}

$apiData = json_decode($response, true);

// Détecter une troncature
$truncated = false;
if ($provider === 'openai') {
  $finishReason = isset($apiData['choices'][0]['finish_reason']) ? $apiData['choices'][0]['finish_reason'] : '';
  $truncated = ($finishReason === 'length');
  $content = (isset($apiData['choices'][0]['message']['content'])) ? $apiData['choices'][0]['message']['content'] : '';
} else {
  $stopReason = isset($apiData['stop_reason']) ? $apiData['stop_reason'] : '';
  $truncated = ($stopReason === 'max_tokens');
  $content = (isset($apiData['content'][0]['text'])) ? $apiData['content'][0]['text'] : '';
}

// Si la réponse est tronquée, tenter de réparer le JSON en fermant la chaîne et l'objet
if ($truncated) {
  // Fermer la valeur de chaîne JSON ouverte et l'objet
  $content = rtrim($content);
  // Si la chaîne se termine sans guillemet fermant, ajouter "…" et fermer
  if (substr($content, -1) !== '"' && substr($content, -1) !== '}') {
    // Échapper les éventuels guillemets non échappés en fin de chaîne tronquée
    // On termine proprement avec une ellipse
    $content .= '…"}';;
  } elseif (substr($content, -1) === '"') {
    $content .= '}';
  }
}

// Extraire le JSON de la réponse (au cas où Claude ajoute des backticks)
if (preg_match('/```(?:json)?\s*(\{[\s\S]*\})\s*```/s', $content, $matches)) {
  $content = $matches[1];
} else {
  // Chercher le premier { jusqu'au dernier }
  $start = strpos($content, '{');
  $end   = strrpos($content, '}');
  if ($start !== false && $end !== false) {
    $content = substr($content, $start, $end - $start + 1);
  }
}

$biographyData = json_decode($content, true);

// Si le JSON reste invalide après réparation, retourner le texte brut tronqué
if (!is_array($biographyData) || !isset($biographyData['biographie'])) {
  $biographyData = ['biographie' => strip_tags($content)];
}

$result = [];
$result['biographie'] = $biographyData['biographie'];
if ($truncated) {
  $result['warning'] = 'La réponse a été tronquée (limite de tokens atteinte). Augmentez AI_MAX_TOKENS dans config.php.';
}
$result['prompt'] = $prompt; // pour debug

print json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

?>
