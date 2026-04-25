<?php

set_time_limit(0); // pas de limite d'exécution PHP

require_once 'utils/db.php';
require_once 'utils/headers.php';
require_once 'utils/general.php';
require_once 'utils/ai.php';
require_once 'utils/logger.php';

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
  "SELECT Nom AS nom, Prenom AS prenom FROM joueurs WHERE IdJoueur = " . $idJoueur
);

if (!$joueur || !$joueur['nom']) {
  http_response_code(404);
  print json_encode(['error' => 'Joueur non trouvé'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Documents associés au joueur
$documents = DBAccess::query(
  "SELECT
    Fichier AS fichier,
    DateDoc AS date,
    Source AS source,
    Legende AS legende
   FROM documents, documentsassoc
   WHERE documents.IdDoc = documentsassoc.IdDoc
     AND AssocType = 'J'
     AND IdObjet = $idJoueur
   ORDER BY OrdreAffichage ASC, DateDoc ASC"
);

if (!$documents || count($documents) === 0) {
  http_response_code(404);
  print json_encode(['error' => 'Aucun document trouvé pour ce joueur'], JSON_UNESCAPED_UNICODE);
  exit;
}

$prenom = $joueur['prenom'];
$nom    = $joueur['nom'];

// Répertoire racine des documents
$docsDir = dirname(__DIR__) . '/documents/docs/';

// Recherche d'un fichier j_{idJoueur}_*.* dans tous les sous-dossiers
function findDocFile($docsDir, $idJoueur, $fichier) {
  // 1. Essai avec le nom exact tel que stocké en base
  if (!empty($fichier)) {
    $direct = $docsDir . $fichier;
    if (file_exists($direct)) return $direct;
  }

  // 2. Recherche par pattern j_{idJoueur}_* dans tous les sous-dossiers
  $pattern = $docsDir . '*/' . 'j_' . $idJoueur . '_*';
  $found   = glob($pattern);
  if (!empty($found)) {
    // Si un nom de fichier précis est donné, on cherche la correspondance
    if (!empty($fichier)) {
      $basename = basename($fichier);
      foreach ($found as $f) {
        if (basename($f) === $basename) return $f;
      }
    }
    // Sinon on retourne le premier trouvé
    return $found[0];
  }

  return null;
}

// Construction de la liste des documents pour le prompt + chargement des images
$docsText = '';
$images   = [];

$mimeMap = [
  'jpg'  => 'image/jpeg',
  'jpeg' => 'image/jpeg',
  'png'  => 'image/png',
  'gif'  => 'image/gif',
  'webp' => 'image/webp',
  'pdf'  => 'application/pdf',
];

foreach ($documents as $i => $doc) {
  $num = $i + 1;
  $docsText .= "Document $num :\n";
  if ($doc['date'])    $docsText .= "  - Date : {$doc['date']}\n";
  if ($doc['source'])  $docsText .= "  - Source : {$doc['source']}\n";
  if ($doc['legende']) $docsText .= "  - Légende : {$doc['legende']}\n";
  if (!$doc['date'] && !$doc['source'] && !$doc['legende']) {
    $docsText .= "  - (aucune métadonnée)\n";
  }

  // Recherche du fichier dans les sous-dossiers
  $filePath = findDocFile($docsDir, $idJoueur, isset($doc['fichier']) ? $doc['fichier'] : '');
  if ($filePath) {
    $ext       = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    $mediaType = isset($mimeMap[$ext]) ? $mimeMap[$ext] : 'image/jpeg';
    $imageData = base64_encode(file_get_contents($filePath));
    $images[]  = ['data' => $imageData, 'media_type' => $mediaType];
    Logger::log("Document $num : fichier trouvé → $filePath");
  } else {
    Logger::log("Document $num : fichier non trouvé (fichier='" . $doc['fichier'] . "', idJoueur=$idJoueur)");
  }
}

$nbDocs = count($documents);

Logger::dump('$documents (' . $nbDocs . ')', $documents);
Logger::dump('$images (' . count($images) . ')', $images, true);

$prompt = "Tu es un expert en histoire du football et de l'Olympique de Marseille. " .
"Voici $nbDocs document(s) liés à la carrière du joueur $prenom $nom à l'OM, avec leurs métadonnées (date, source, légende) :\n\n" .
$docsText .
"\nLis les documents (avec reconnaissance du texte pour les coupures de presse), et rédige un résumé en 250 mots en français de leur contenu (à partir du texte et des photos). " .
"Utilise des balises <strong> pour quelques mots/concepts clés les plus importants.\n" .
"Si tu n'arrives pas à déchiffrer, indique-le honnêtement.\n\n" .
"Réponds UNIQUEMENT avec du JSON valide, sans texte avant ni après, au format :\n" .
"{\n  \"resume\": \"texte en français\"\n}";

// Appel AI
try {
  $aiResult = AI::call($prompt, ['resume'], !empty($images) ? $images : null);
} catch (RuntimeException $e) {
  http_response_code(500);
  print json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
  exit;
}

$result = [];
$result['resume']  = $aiResult['data']['resume'];
$result['nbDocs']  = $nbDocs;
$result['prompt']  = $prompt;
if ($aiResult['truncated']) {
  $result['warning'] = 'La réponse a été tronquée (limite de tokens atteinte). Augmentez AI_MAX_TOKENS dans config.php.';
}

print json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

?>

