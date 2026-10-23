<?php

require_once 'utils/db.php';

$lastUpdate = filemtime(DBAccess::getDbFile()) * 1000;

// le cache est partagé par les requêtes simultanées : on le lit et on le réécrit sous verrou,
// sinon une requête lit un fichier à moitié écrit, ou un avertissement PHP casse le JSON
function readCache() {
  $cache = null;
  $handle = @fopen("_cache.json", "r");
  if ($handle) {
    if (flock($handle, LOCK_SH)) {
      $cache = json_decode(stream_get_contents($handle), true);
      flock($handle, LOCK_UN);
    }
    fclose($handle);
  }
  return is_array($cache) ? $cache : array();
}

$cache = readCache();

// cache invalidation : on repart d'un cache vide, respond() réécrit le fichier
if (!isset($cache["lastUpdate"]) || $cache["lastUpdate"] != $lastUpdate) {
  $cache = array();
}

// check cache
$url = $_SERVER['REQUEST_URI'];

if (isset($cache[$url])) {
  print json_encode($cache[$url], JSON_PRETTY_PRINT);
  exit;
}

// dependencies
require_once 'utils/headers.php';
require_once 'utils/general.php';
require_once 'utils/document.php';
require_once 'filtres/main.php';


// respond
function respond($out) {
  global $url;
  global $lastUpdate;
  
  // relu sous verrou exclusif, pour ne pas écraser ce qu'une autre requête vient d'ajouter
  $handle = @fopen("_cache.json", "c+");
  if ($handle) {
    if (flock($handle, LOCK_EX)) {
      $cache = json_decode(stream_get_contents($handle), true);
      if (!is_array($cache) || !isset($cache["lastUpdate"]) || $cache["lastUpdate"] != $lastUpdate) {
        $cache = array();
      }
      $cache["lastUpdate"] = $lastUpdate;
      $cache[$url] = $out;

      ftruncate($handle, 0);
      rewind($handle);
      fwrite($handle, json_encode($cache));
      fflush($handle);
      flock($handle, LOCK_UN);
    }
    fclose($handle);
  }

  print json_encode($out, JSON_PRETTY_PRINT);
}

?>