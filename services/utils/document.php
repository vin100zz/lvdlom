<?php 

class Document
{
	  
  public static function findPath($fichier) {
    $prefix = '../';
    for ($i=1; $i<10; ++$i) {
      $filePath = "documents/docs/" . $i . "/" . $fichier;   
      if (file_exists($prefix . $filePath)) {
        return $filePath;
      }
    }
    return "NOT_FOUND";
  }

}

?>