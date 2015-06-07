<?php

require_once 'utils/service.php';


// params
$idAdversaire = intval(General::request("id"));


// ********************************************************
// ******* SQL ********************************************
// ********************************************************

$adversaire = DBAccess::singleRow
("
	SELECT
    IdAdversaire AS id,
    NomAdversaire AS nom,
    Pays AS pays
	FROM adversaires
  WHERE adversaires.IdAdversaire = " . $idAdversaire
);


// ********************************************************
// ******* JSON *******************************************
// ******************************************************** 

print json_encode($adversaire, JSON_PRETTY_PRINT);

?>
