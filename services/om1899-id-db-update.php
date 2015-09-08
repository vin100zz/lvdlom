<?php

require_once 'utils/service.php';

$idJoueur = General::request("idJoueur");
$idOm1899 = General::request("idOm1899");

$dbId = DBAccess::singleValue("SELECT IdOm1899 FROM joueurs WHERE IdJoueur=$idJoueur");

if (!$dbId) {
  $dbRes = DBAccess::exec("UPDATE joueurs SET IdOm1899=$idOm1899 WHERE IdJoueur=$idJoueur");
  $res = $dbRes ? 'ok' : 'ko';
} else {
  $res = 'skipped';
}

print $res;


?>