<?php

require_once 'utils/service.php';

$out = array();

$text = "../documents/commentaires/origines/index.html";
if (is_file($text) && $desc = implode(file($text)))
{
	$desc = utf8_encode($desc);
	$desc = str_replace("@PATH@", "documents/commentaires/origines", $desc);
	$out['commentaires'] = $desc;
}

respond($out);

?>
