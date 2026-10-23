<?php

require_once 'utils/service.php';

// toujours un objet, même sans texte (un tableau vide fait échouer la ressource Angular)
$out = array('commentaires' => null);

$text = "../documents/commentaires/origines/index.html";
if (is_file($text) && $desc = implode(file($text)))
{
	$desc = utf8_encode($desc);
	$desc = str_replace("@PATH@", "documents/commentaires/origines", $desc);
	$out['commentaires'] = $desc;
}

respond($out);

?>
