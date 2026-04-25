<?php

class Logger {

  private static $logFile = '';
  private static $enabled = true;

  /**
   * Définit le fichier de log (chemin absolu).
   * Par défaut : tmp/debug.log à la racine du projet.
   */
  public static function setFile($path) {
    self::$logFile = $path;
  }

  public static function enable()  { self::$enabled = true; }
  public static function disable() { self::$enabled = false; }

  /**
   * Écrit un message dans le log.
   */
  public static function log($message) {
    if (!self::$enabled) return;
    $file = self::resolveFile();
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $message . "\n";
    file_put_contents($file, $line, FILE_APPEND);
  }

  /**
   * Log une variable quelconque (tableau, objet, scalaire).
   * $label : nom affiché devant la valeur.
   * $truncateArrayValues : si true, les chaînes longues (ex. base64) sont tronquées.
   */
  public static function dump($label, $value, $truncateArrayValues = false) {
    if (!self::$enabled) return;
    if ($truncateArrayValues) {
      $value = self::truncate($value);
    }
    self::log($label . ' : ' . print_r($value, true));
  }

  /**
   * Log une erreur (préfixe [ERROR]).
   */
  public static function error($message) {
    self::log('[ERROR] ' . $message);
  }

  /**
   * Efface le fichier de log.
   */
  public static function clear() {
    file_put_contents(self::resolveFile(), '');
  }

  // -------------------------------------------------------------------------

  private static function resolveFile() {
    if (self::$logFile !== '') $file = self::$logFile;
    else $file = dirname(dirname(__DIR__)) . '/tmp/debug.log';

    // Crée le fichier s'il n'existe pas encore
    if (!file_exists($file)) {
      @touch($file);
    }

    return $file;
  }

  /**
   * Parcourt récursivement un tableau et tronque les chaînes > 100 caractères.
   */
  private static function truncate($value, $maxLen = 100) {
    if (is_array($value)) {
      $result = [];
      foreach ($value as $k => $v) {
        $result[$k] = self::truncate($v, $maxLen);
      }
      return $result;
    }
    if (is_string($value) && strlen($value) > $maxLen) {
      return substr($value, 0, $maxLen) . '… [' . strlen($value) . ' chars]';
    }
    return $value;
  }
}

