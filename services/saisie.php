<?php

require_once 'utils/service.php';


// **************************************************************
// ******* Helpers **********************************************
// **************************************************************

function getParam($param) {
  global $payload;
  return isset($payload[$param]) ? $payload[$param] : null;
}

function insertForSql(&$array, $key, $value) {
  if ($value != null && $value != "")
    $array[$key] = General::corrigeDisplayPourSQL($value);
}

function getBoolean($param) {
  $value = getParam($param);
  return ($value == "true") ? "1" : "0";
}

function getDateStr($param) {
  return date('Y-m-d', strtotime(getParam($param)));
}

function sqlInsert($array, $table) {
  $fields = "";
  $values = "";
  
  foreach($array as $key => $value) {
    if ($fields != "") {
      $fields .= ", ";
    }
    $fields .= "$key";
    
    if ($values != "") {
      $values .= ", ";
    }
    $values .= "'$value'";
  }
  
  $queryStr = "INSERT INTO $table ($fields) VALUES ($values);";

  $dbRes = DBAccess::exec(utf8_decode($queryStr));

  return array(
    "query" => $queryStr,
    "res" => $dbRes ? "ok" : "ko"
  );
}

function sqlUpdate($array, $table, $id, $idColumnName) {
  $fields = "";

  foreach($array as $key => $value) {
    if ($fields != "") {
      $fields .= ", ";
    }
    $fields .= "$key='$value'";
  }

  $queryStr = "UPDATE $table SET $fields WHERE $idColumnName=$id";

  $dbRes = DBAccess::exec(utf8_decode($queryStr));

  return array(
    "query" => $queryStr,
    "res" => $dbRes ? "ok" : "ko"
  );
}


// **********************************************************
// ******* SQL **********************************************
// **********************************************************

$type = General::request("type");
$payload = General::payload();
$id = getParam("id");


/*
 * Joueur
 */
if ($type == "joueur")
{
  $terrNaissEtranger = getParam("territoireNaissanceEtranger");
  $terrNaissFrancais = getParam("territoireNaissanceFrancais");
  $terrNaiss = ($terrNaissEtranger != null && preg_match("/\w{3}/", $terrNaissEtranger)) ? $terrNaissEtranger : $terrNaissFrancais;

  $query = array();
  insertForSql($query, "Nom", getParam("nom"));
  insertForSql($query, "Prenom", getParam("prenom"));
  insertForSql($query, "Poste", getParam("poste"));
  insertForSql($query, "DateNaissance", getDateStr("dateNaissance"));
  insertForSql($query, "VilleNaissance", getParam("villeNaissance"));
  insertForSql($query, "TerritoireNaissance", $terrNaiss);   
  insertForSql($query, "DateDeces", getDateStr("dateDeces"));
  insertForSql($query, "Nationalite", getParam("nationalite"));
  insertForSql($query, "AuClub", getBoolean("auClub"));

  if ($id) {  
    $out = sqlUpdate($query, "joueurs", $id, "IdJoueur");
  } else {
    $out = sqlInsert($query, "joueurs");
  }
}

print json_encode($out, JSON_PRETTY_PRINT);

?>
