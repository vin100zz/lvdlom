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
  if ($value !== null)
    $array[$key] = General::corrigeDisplayPourSQL($value);
}

function getBoolean($param) {
  $value = getParam($param);
  return ($value == "true") ? "1" : "0";
}

function getDateStr($param) {
  if (!getParam($param)) {
    return "";
  }
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
    "res" => $dbRes ? "ok" : "ko",
    "id" => DBAccess::getLastInsertedLastRow()
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
    "res" => $dbRes ? "ok" : "ko",
    "id" => $id
  );
}


// **********************************************************
// ******* SQL **********************************************
// **********************************************************

$payload = General::payload();
$id = getParam("id");
$type = getParam("type");

/*
 * Joueur
 */
if ($type == "joueur") {
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

/*
 * Dirigeant
 */
else if ($type == "dirigeant") {
  $terrNaissEtranger = getParam("territoireNaissanceEtranger");
  $terrNaissFrancais = getParam("territoireNaissanceFrancais");
  $terrNaiss = ($terrNaissEtranger != null && preg_match("/\w{3}/", $terrNaissEtranger)) ? $terrNaissEtranger : $terrNaissFrancais;

  $query = array();
  insertForSql($query, "Nom", getParam("nom"));
  insertForSql($query, "Prenom", getParam("prenom"));
  insertForSql($query, "DateNaissance", getDateStr("dateNaissance"));
  insertForSql($query, "VilleNaissance", getParam("villeNaissance"));
  insertForSql($query, "TerritoireNaissance", $terrNaiss);   
  insertForSql($query, "DateDeces", getDateStr("dateDeces"));
  insertForSql($query, "Nationalite", getParam("nationalite"));
  insertForSql($query, "IdJoueur", getParam("idJoueur"));

  if ($id) {  
    $out = sqlUpdate($query, "dirigeants", $id, "IdDirigeant");
  } else {
    $out = sqlInsert($query, "dirigeants");
  }
}


/*
 * Dirige
 */
else if ($type == "dirige") {
  $query = array();
  insertForSql($query, "IdDirigeant", getParam("idDirigeant"));
  insertForSql($query, "IdFonction", getParam("idFonction"));
  insertForSql($query, "Debut", getDateStr("debut"));
  insertForSql($query, "Fin", getParam("fin"));

  if ($id) {  
    $out = sqlUpdate($query, "dirige", $id, "IdDirige");
  } else {
    $out = sqlInsert($query, "dirige");
  }
}


/*
 * Adversaire
 */
else if ($type == "adversaire") {
  $query = array();
  insertForSql($query, "NomAdversaire", getParam("nom"));
  insertForSql($query, "Pays", getParam("pays"));

  if ($id) {  
    $out = sqlUpdate($query, "adversaires", $id, "IdAdversaire");
  } else {
    $out = sqlInsert($query, "adversaires");
  }
}


/*
 * Document
 */
else if ($type == "document") {
  $out = array();

  // documents
  $query = array();
  insertForSql($query, "Fichier", getParam("file"));
  insertForSql($query, "DateDoc", getParam("date"));
  insertForSql($query, "Source", getParam("source"));
  insertForSql($query, "Legende", getParam("legende"));

  if ($id) {  
    $dbRes = sqlUpdate($query, "documents", $id, "IdDoc");
  } else {
    $dbRes = sqlInsert($query, "documents");
    $id = $dbRes['id'];
  }
  $out[] = $dbRes;


  // documentsAssoc
  $associations = getParam("associations");
  foreach ($associations as $association) {
    $query = array();
    insertForSql($query, "IdDoc", $id);
    insertForSql($query, "AssocType", $association["type"]);
    insertForSql($query, "IdObjet", $association["id"]);

    // TODO: handle UPDATE
    $out[] = sqlInsert($query, "documentsAssoc");
  }
}

else {
  $out = "Type not supported: $type";
}


function is_associative_array (array $array) {
  return (bool)count(array_filter(array_keys($array), 'is_string'));
}

// convert to sequential array
$out = is_associative_array($out) ? array($out) : $out;


print json_encode($out, JSON_PRETTY_PRINT);

?>
