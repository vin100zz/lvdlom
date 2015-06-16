<?php

$lastUpdate = filemtime("om.db3") * 1000;
$contents = file_get_contents("_cache.json");
$cache = json_decode($contents, true);

// cache invalidation
if (!isset($cache["lastUpdate"]) || $cache["lastUpdate"] != $lastUpdate) {
  unlink("_cache.json");
  $cache = array();
}

// check cache
$url = $_SERVER['REQUEST_URI'];

if (isset($cache[$url]) && isset($cache["lastUpdate"]) && $cache["lastUpdate"] == $lastUpdate) {
  print json_encode($cache[$url], JSON_PRETTY_PRINT);
  exit;
}

// dependencies
require_once 'utils/headers.php';
require_once 'utils/general.php';
require_once 'utils/db.php';
require_once 'utils/document.php';
require_once 'filtres/main.php';


// respond
function respond($out) {
  global $url;
  global $lastUpdate;
  
  $contents = @file_get_contents("_cache.json");
  if ($contents) {
    $cache = json_decode($contents, true);
  } else {
    $cache = array("lastUpdate" => $lastUpdate);
  }
  $cache[$url] = $out;
  
  file_put_contents("_cache.json", json_encode($cache));
  
  print json_encode($out, JSON_PRETTY_PRINT);
}

?>