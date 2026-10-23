<?php

/**
 * Pré-remplissage de la saisie d'un match à partir d'une page web (L'Équipe, Google…).
 *
 * Entrée (JSON en POST), une des trois sources :
 *   url   : adresse de la page du match, récupérée ici
 *   texte : texte de la page, copié-collé
 *   html  : page envoyée par le favori « Envoyer à LVDLOM » (avec url et titre)
 *
 * L'IA extrait les informations du match, puis elles sont converties au format du formulaire
 * de saisie : ids des joueurs et de l'adversaire, saison, lieu, niveau, minutes, cartons,
 * remplacements et classement. Rien n'est enregistré : l'utilisateur relit puis valide.
 */

set_time_limit(0); // l'analyse par l'IA dépasse souvent max_execution_time

require_once 'utils/db.php';
require_once 'utils/headers.php';
require_once 'utils/general.php';
require_once 'utils/ai.php';

$configFile = __DIR__ . '/config.php';
if (file_exists($configFile)) {
  require_once $configFile;
}


// **************************************************************
// ******* Helpers **********************************************
// **************************************************************

function repondre($out, $code = 200) {
  http_response_code($code);
  print json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
  exit;
}

function valeur($tableau, $cle, $defaut = null) {
  return (is_array($tableau) && isset($tableau[$cle])) ? $tableau[$cle] : $defaut;
}

function entierOuNull($valeur) {
  return is_numeric($valeur) ? intval($valeur) : null;
}

// minuscules sans accents ni ponctuation, pour comparer des noms : « Höjbjerg » = « HOJBJERG »
function normaliser($s) {
  $s = mb_strtolower(trim($s), 'UTF-8');
  $s = strtr($s, array(
    'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a', 'æ' => 'ae',
    'ç' => 'c', 'ć' => 'c', 'č' => 'c', 'đ' => 'd',
    'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e', 'ě' => 'e', 'ę' => 'e', 'ğ' => 'g',
    'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i', 'ı' => 'i', 'ł' => 'l',
    'ñ' => 'n', 'ń' => 'n', 'ň' => 'n',
    'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o', 'ø' => 'o', 'ő' => 'o', 'œ' => 'oe',
    'ř' => 'r', 'ß' => 'ss', 'š' => 's', 'ś' => 's', 'ş' => 's', 'ș' => 's', 'ț' => 't', 'ţ' => 't',
    'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u', 'ű' => 'u', 'ů' => 'u',
    'ý' => 'y', 'ÿ' => 'y', 'ž' => 'z', 'ź' => 'z', 'ż' => 'z'
  ));
  return trim(preg_replace('/[^a-z0-9]+/', ' ', $s));
}

// valeur de la base qui correspond au texte (même orthographe une fois normalisée), sinon null
function valeurConnue($texte, $valeurs) {
  $cherche = normaliser($texte);
  foreach ($valeurs as $valeur) {
    if ($cherche !== '' && normaliser($valeur) === $cherche) {
      return $valeur;
    }
  }
  return null;
}


// **************************************************************
// ******* Récupération de la page ******************************
// **************************************************************

// Les pages de L'Équipe sont protégées contre les robots (Akamai) : il faut les en-têtes d'un
// navigateur, HTTP/1.1, la compression gzip et, sans cURL, des chiffrements TLS récents
function telechargerPage($url) {
  if (!preg_match('#^https?://#i', $url)) {
    throw new RuntimeException("Adresse invalide : $url");
  }

  $entetes = array(
    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language: fr-FR,fr;q=0.9,en;q=0.8',
    'Accept-Encoding: gzip, deflate',
    'Sec-Fetch-Dest: document',
    'Sec-Fetch-Mode: navigate',
    'Sec-Fetch-Site: none',
    'Upgrade-Insecure-Requests: 1'
  );

  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, array(
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_TIMEOUT        => 20,
      CURLOPT_HTTPHEADER     => $entetes,
      CURLOPT_ENCODING       => ''
    ));
    $corps = curl_exec($ch);
    $code  = intval(curl_getinfo($ch, CURLINFO_HTTP_CODE));
    curl_close($ch);
  }
  else {
    $contexte = stream_context_create(array(
      'http' => array(
        'method'           => 'GET',
        'protocol_version' => 1.1,
        'header'           => implode("\r\n", $entetes),
        'timeout'          => 20,
        'ignore_errors'    => true
      ),
      'ssl' => array(
        'verify_peer'      => true,
        'verify_peer_name' => true,
        'ciphers'          => 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:'
                            . 'ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:'
                            . 'ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA:AES256-SHA'
      )
    ));
    $corps = @file_get_contents($url, false, $contexte);
    $code = 0;
    $compression = null;
    $morceaux = false;
    if (isset($http_response_header)) {
      // une ligne de statut par redirection : on garde les en-têtes de la dernière réponse
      foreach ($http_response_header as $entete) {
        if (preg_match('#^HTTP/\S+\s+(\d+)#', $entete, $m)) {
          $code = intval($m[1]);
          $compression = null;
          $morceaux = false;
        }
        else if (preg_match('#^Content-Encoding:\s*(gzip|deflate)#i', $entete, $m)) {
          $compression = strtolower($m[1]);
        }
        else if (preg_match('#^Transfer-Encoding:\s*chunked#i', $entete)) {
          $morceaux = true;
        }
      }
    }
    // PHP ne recolle pas lui-même les morceaux quand l'en-tête est mal espacé (« Transfer-Encoding:  chunked »)
    if ($corps !== false && $morceaux && preg_match('/^[0-9a-f]+\r\n/i', $corps)) {
      $corps = recollerMorceaux($corps);
    }
    if ($corps !== false && $compression === 'gzip') {
      $corps = gzdecode($corps);
    }
    else if ($corps !== false && $compression === 'deflate') {
      $corps = gzinflate($corps);
    }
  }

  if ($corps === false || $code !== 200) {
    throw new RuntimeException("La page n'a pas pu être récupérée (HTTP $code). Copiez son texte ou utilisez le favori « Envoyer à LVDLOM ».");
  }
  return $corps;
}

// corps d'une réponse HTTP envoyée par morceaux (Transfer-Encoding: chunked) : « taille en hexa\r\n données\r\n »
function recollerMorceaux($corps) {
  $sortie = '';
  $position = 0;
  while (preg_match('/\G([0-9a-f]+)[^\r\n]*\r\n/i', $corps, $m, 0, $position)) {
    $taille = hexdec($m[1]);
    if ($taille === 0) {
      break;
    }
    $sortie .= substr($corps, $position + strlen($m[0]), $taille);
    $position += strlen($m[0]) + $taille + 2;
  }
  return $sortie;
}

function titreDepuisHtml($html) {
  return preg_match('#<title[^>]*>(.*?)</title>#is', $html, $m) ? trim(html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8')) : '';
}

// Texte lisible d'une page : un bloc par ligne, cellules séparées par « | », et les icônes
// remplacées par leur nom de fichier, qui dit souvent ce qu'elles montrent : [ico_but], [ico_carton_jaune]
function texteDepuisHtml($html) {
  $html = preg_replace('#<(head|script|style|svg|noscript|iframe|template)\b[\s\S]*?</\1>#i', ' ', $html);
  $html = preg_replace('#<!--[\s\S]*?-->#', ' ', $html);
  $html = preg_replace_callback('#<img\b[^>]*>#i', function ($m) {
    if (preg_match('#\balt="([^"]+)"#i', $m[0], $alt)) {
      return ' [' . $alt[1] . '] ';
    }
    if (preg_match('#\bsrc="[^"]*?([^"/?]+?)\.\w+(\?[^"]*)?"#i', $m[0], $src)) {
      return ' [' . $src[1] . '] ';
    }
    return ' ';
  }, $html);
  $html = preg_replace('#</t[dh]>#i', ' | ', $html);
  $html = preg_replace('#<(br|/?(p|div|li|tr|h\d|section|article|header|footer|ul|ol|table|main|aside|nav|dl|dt|dd))\b[^>]*>#i', "\n", $html);
  $texte = html_entity_decode(preg_replace('#<[^>]*>#', ' ', $html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

  // lignes nettoyées, sans les lignes vides ni les répétitions immédiates
  $lignes = array();
  foreach (explode("\n", $texte) as $ligne) {
    // les cellules vides de début de ligne restent : elles alignent l'en-tête d'un tableau sur ses colonnes
    $ligne = rtrim(trim(preg_replace('/[\s\x{00A0}]+/u', ' ', $ligne)), ' |');
    if ($ligne !== '' && (!count($lignes) || end($lignes) !== $ligne)) {
      $lignes[] = $ligne;
    }
  }
  return implode("\n", $lignes);
}

// page du classement de la compétition, déduite d'une adresse de match de L'Équipe :
// …/Football/match-direct/ligue-europa/… → …/Football/ligue-europa/page-classement-equipes/general
function urlClassement($url) {
  if (preg_match('#^https?://(www\.)?lequipe\.fr/Football/match-direct/([^/]+)/#i', $url, $m)) {
    return 'https://www.lequipe.fr/Football/' . $m[2] . '/page-classement-equipes/general';
  }
  return null;
}

function texteClassement($url) {
  try {
    $html = telechargerPage($url);
  } catch (RuntimeException $e) {
    return ''; // les coupes n'ont pas de classement : la page n'existe pas
  }
  return preg_match('#<table[\s\S]*?</table>#i', $html, $m) ? texteDepuisHtml($m[0]) : '';
}


// **************************************************************
// ******* Données du site **************************************
// **************************************************************

$saisons = DBAccess::singleColumn("SELECT Saison FROM saisons ORDER BY Saison DESC");
$saisonsRecentes = array_slice($saisons, 0, 3);
$saisonsSql = "'" . implode("','", $saisonsRecentes) . "'";

$tousJoueurs = DBAccess::query("SELECT IdJoueur AS id, Prenom AS prenom, Nom AS nom, Poste AS poste, AuClub AS auClub FROM joueurs");

// joueurs proposés à l'IA : au club, ou ayant joué lors des deux dernières saisons
$idsRecents = array_flip(DBAccess::singleColumn(
  "SELECT DISTINCT joue.IdJoueur FROM joue JOIN matches ON matches.IdMatch = joue.IdMatch
   WHERE matches.Saison IN ('" . implode("','", array_slice($saisons, 0, 2)) . "')"
));
$joueursRecents = array();
$joueursParId = array();
foreach ($tousJoueurs as $joueur) {
  $joueursParId[$joueur['id']] = $joueur;
  if ($joueur['auClub'] == '1' || $joueur['auClub'] == 'Y' || isset($idsRecents[$joueur['id']])) {
    $joueursRecents[] = $joueur;
  }
}

$adversaires = DBAccess::query("SELECT IdAdversaire AS id, NomAdversaire AS nom, Pays AS pays FROM adversaires ORDER BY NomAdversaire");
$adversairesParId = array();
foreach ($adversaires as $adversaire) {
  $adversairesParId[$adversaire['id']] = $adversaire;
}

$competitions = DBAccess::singleColumn("SELECT DISTINCT Competition FROM matches WHERE Competition <> '' ORDER BY Competition");
$niveaux = DBAccess::singleColumn("SELECT DISTINCT Niveau FROM matches WHERE Niveau <> ''");
$lieux = DBAccess::singleColumn("SELECT DISTINCT Lieu FROM matches WHERE Lieu <> ''");

$niveauxRecents = array();
foreach (DBAccess::query(
  "SELECT Competition AS competition, Niveau AS niveau, MIN(DateMatch) AS debut FROM matches
   WHERE Saison IN ($saisonsSql) AND Niveau <> ''
   GROUP BY Competition, Niveau ORDER BY Competition, debut"
) as $row) {
  $niveauxRecents[$row['competition']][] = $row['niveau'];
}


// **************************************************************
// ******* Contenu à analyser ***********************************
// **************************************************************

$payload = General::payload();
$url   = trim(valeur($payload, 'url', ''));
$texte = trim(valeur($payload, 'texte', ''));
$html  = valeur($payload, 'html', '');
$titre = trim(valeur($payload, 'titre', ''));

try {
  if ($html) {
    $mode = 'favori';
    $contenu = texteDepuisHtml($html);
  }
  else if ($texte) {
    $mode = 'texte';
    $contenu = $texte;
  }
  else if ($url) {
    $mode = 'url';
    $page = telechargerPage($url);
    $titre = titreDepuisHtml($page);
    $contenu = texteDepuisHtml($page);
  }
  else {
    repondre(array('error' => 'Indiquez l\'adresse de la page du match ou collez son texte.'), 400);
  }
} catch (RuntimeException $e) {
  repondre(array('error' => $e->getMessage()), 502);
}

$contenu = mb_substr($contenu, 0, 60000, 'UTF-8');
$classement = ($url && urlClassement($url)) ? texteClassement(urlClassement($url)) : '';


// **************************************************************
// ******* Prompt ***********************************************
// **************************************************************

$listeJoueurs = '';
foreach ($joueursRecents as $joueur) {
  $listeJoueurs .= $joueur['id'] . ' | ' . trim($joueur['prenom'] . ' ' . $joueur['nom']) . ' | ' . $joueur['poste'] . "\n";
}
$listeAdversaires = '';
foreach ($adversaires as $adversaire) {
  $listeAdversaires .= $adversaire['id'] . ' | ' . $adversaire['nom'] . ' | ' . $adversaire['pays'] . "\n";
}
$listeNiveaux = '';
foreach ($niveauxRecents as $competition => $liste) {
  $listeNiveaux .= "- $competition : " . implode(' ; ', $liste) . "\n";
}
$listeCompetitions = implode(' ; ', $competitions);

$prompt = <<<PROMPT
Tu es l'assistant de saisie du site « La Vie de l'OM », qui recense tous les matchs de l'Olympique de Marseille (OM).
Le contenu plus bas vient d'une page web (direct, compte rendu ou fiche d'un match). Extrais-en les informations du match de l'OM
et réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, au format décrit à la fin.

Règles générales :
- N'invente rien : n'utilise que le contenu fourni. Une information absente vaut null (ou une liste vide) et se signale dans "remarques".
- Recoupe le tableau de bord, la composition, le banc et le fil du direct pour les buts, cartons et remplacements.
- Les icônes de la page sont notées entre crochets : [ico_but] = but, [ico_carton_jaune] = carton jaune, [ico_carton_rouge] = carton rouge, etc.
- "nom" d'un joueur : son nom tel qu'il est écrit dans la page (ex. « A. Gouiri »).
- "id" : uniquement un identifiant des listes JOUEURS DE L'OM ou ADVERSAIRES ; sinon null. Ne devine jamais un id.

Conventions du site :
- date : AAAA-MM-JJ, date du match (pas celle de l'article).
- ville : ville où se joue le match (ex. « Graz », « Istanbul », « Angers »). omDomicile : true si l'OM reçoit. terrainNeutre : true sur terrain neutre.
- competition : une valeur de la liste COMPÉTITIONS.
- niveau : reprends exactement la forme de la liste NIVEAUX DÉJÀ UTILISÉS : « 7ème journée », « Phase de Ligue, 3ème journée »,
  « Barrages aller », « 8ème de finale Aller », « 32ème de finale », « Quart de finale »… Ex. la « 3e journée » de la phase de ligue
  de la Ligue Europa s'écrit « Phase de Ligue, 3ème journée ».
- Score du point de vue de l'OM : butsOM, butsAdv (score à la fin du match, prolongation comprise, sans les tirs au but).
  prolongation : "ap" si le match s'est terminé après prolongation, "tab" s'il s'est fini aux tirs au but (tabOM, tabAdv = tirs au but réussis), sinon null.
- Minutes des buts : « 90+3 » → minute 90 et minuteExtra 3 ; « 45+1 » → 45 et 1 ; sinon minuteExtra null. Buts dans l'ordre chronologique.
- buteursOM : buts en faveur de l'OM. But contre son camp d'un adversaire : csc true, joueur null, nomCsc = NOM de famille de l'adversaire en majuscules.
- buteursAdv : buts en faveur de l'adversaire ; nom = NOM de famille du buteur en majuscules (ex. « DIAKITE ») ;
  csc true si un joueur de l'OM a marqué contre son camp (nom = son NOM).
- penalty : true pour un but sur penalty (pas pour la séance de tirs au but).
- titulaires : les 11 titulaires de l'OM, gardien en premier puis dans l'ordre de la composition. Les joueurs de l'OM sont dans la liste JOUEURS DE L'OM.
- remplacants : uniquement les joueurs de l'OM entrés en jeu, dans l'ordre de leur entrée. Ceux restés sur le banc n'y figurent pas.
- remplacePar : pour un titulaire remplacé, le "nom" du remplaçant entré à sa place, écrit comme dans "remplacants" ; minuteRemplacement : minute du changement.
- Minutes des remplacements et des cartons : un nombre simple ; un changement à la mi-temps vaut 46 ; le temps additionnel s'ajoute (« 90+3 » → 93).
- carton : "A" pour un carton jaune, "E" pour une expulsion (rouge direct, ou second jaune à la minute de l'expulsion), "" sinon ; minuteCarton : sa minute.
- spectateurs : nombre entier, ou null.
- classement : seulement si un classement de la compétition figure dans le contenu ou dans le bloc CLASSEMENT, sinon null.
  top : les 4 premiers, equipe = nom court usuel en MAJUSCULES (ex. « PSG », « LYON », « PARIS FC », « LEVERKUSEN », « OM ») ;
  om : rang et points de l'OM.
- remarques : seulement ce qui manque ou reste incertain et demande une vérification dans le formulaire, en phrases courtes.
  Pas de commentaire sur les postes, sur les exemples de ces consignes, sur ta méthode ni sur ce qui a été trouvé sans difficulté.
  Ne commente pas non plus l'écriture des noms ni leur rapprochement avec la liste JOUEURS DE L'OM : il est vérifié après toi.
  Liste vide si tout est clair.

Format de réponse :
{
  "date": "AAAA-MM-JJ",
  "omDomicile": true,
  "terrainNeutre": false,
  "ville": "",
  "competition": "",
  "niveau": "",
  "adversaire": {"nom": "", "id": null},
  "butsOM": 0,
  "butsAdv": 0,
  "prolongation": null,
  "tabOM": null,
  "tabAdv": null,
  "spectateurs": null,
  "buteursOM": [{"minute": 0, "minuteExtra": null, "joueur": {"nom": "", "id": null}, "penalty": false, "csc": false, "nomCsc": null}],
  "buteursAdv": [{"minute": 0, "minuteExtra": null, "nom": "", "penalty": false, "csc": false}],
  "titulaires": [{"nom": "", "id": null, "carton": "", "minuteCarton": null, "remplacePar": null, "minuteRemplacement": null}],
  "remplacants": [{"nom": "", "id": null, "minuteEntree": 0, "carton": "", "minuteCarton": null}],
  "classement": {"top": [{"rang": 1, "equipe": "", "pts": 0}], "om": {"rang": 0, "pts": 0}},
  "remarques": [""]
}

JOUEURS DE L'OM (id | prénom nom | poste) :
$listeJoueurs
ADVERSAIRES (id | nom | pays) :
$listeAdversaires
COMPÉTITIONS : $listeCompetitions

NIVEAUX DÉJÀ UTILISÉS (par compétition, saisons récentes) :
$listeNiveaux
PROMPT;

$prompt .= "\nCONTENU DE LA PAGE" . ($url ? " ($url)" : '') . ($titre ? " — $titre" : '') . " :\n<<<\n$contenu\n>>>\n";
if ($classement) {
  $prompt .= "\nCLASSEMENT (page classement de la compétition, lue au moment de l'import) :\n<<<\n$classement\n>>>\n";
}

// aperçu : le prompt seul, sans appeler l'IA (pour mettre au point l'extraction)
if (valeur($payload, 'apercu')) {
  repondre(array('prompt' => $prompt));
}


// **************************************************************
// ******* Appel à l'IA *****************************************
// **************************************************************

try {
  $aiResult = AI::call($prompt, array('date', 'butsOM', 'butsAdv', 'titulaires'), null, 16000);
} catch (RuntimeException $e) {
  repondre(array('error' => $e->getMessage()), 500);
}
if ($aiResult['truncated']) {
  repondre(array('error' => 'La réponse de l\'IA a été tronquée : réessayez.'), 500);
}
$ia = $aiResult['data'];


// **************************************************************
// ******* Conversion au format du formulaire *******************
// **************************************************************

$avertissements = array();

// Retrouve un joueur d'après le nom lu sur la page (« A. Gouiri », « Gouiri », « Amine Gouiri ») ;
// null si aucun joueur ou plusieurs joueurs correspondent
function chercherJoueur($nomLu, $candidats) {
  $lu = normaliser($nomLu);
  if ($lu === '') {
    return null;
  }
  $trouves = array();
  foreach ($candidats as $joueur) {
    $nom = normaliser($joueur['nom']);
    $prenom = normaliser($joueur['prenom']);
    if ($nom === '') {
      continue;
    }
    if ($lu === $nom || $lu === trim("$prenom $nom")) {
      $trouves[$joueur['id']] = 2;
    }
    // initiale ou début du prénom, puis le nom
    else if ($prenom !== '' && substr($lu, -strlen($nom) - 1) === " $nom") {
      $debut = trim(substr($lu, 0, -strlen($nom)));
      if (strpos($prenom, $debut) === 0) {
        $trouves[$joueur['id']] = 1;
      }
    }
  }
  if (count($trouves) === 1) {
    return strval(key($trouves));
  }
  $exacts = array_keys($trouves, 2);
  return count($exacts) === 1 ? strval($exacts[0]) : null;
}

// id du joueur : le nom lu prime (joueurs récents puis tous), puis l'id proposé par l'IA
function idJoueur($nom, $idIA, $contexte) {
  global $joueursRecents, $tousJoueurs, $joueursParId, $avertissements;

  $id = chercherJoueur($nom, $joueursRecents);
  if (!$id && $idIA !== null && isset($joueursParId[strval($idIA)])) {
    $id = strval($idIA);
  }
  if (!$id) {
    $id = chercherJoueur($nom, $tousJoueurs);
  }
  if (!$id && $nom) {
    $avertissements[] = "Joueur non reconnu : $nom ($contexte). À sélectionner, ou à créer s'il n'a pas encore de fiche.";
  }
  return $id;
}

// date et saison (« 2026-27 » pour un match d'août 2026 à juillet 2027)
$date = preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', valeur($ia, 'date', ''), $m) ? $m[0] : null;
$saison = null;
if ($date) {
  $annee = intval($m[1]);
  $debut = intval($m[2]) >= 7 ? $annee : $annee - 1;
  $saison = $debut . '-' . substr(strval($debut + 1), 2);
  if (!in_array($saison, $saisons)) {
    $avertissements[] = "La saison $saison n'existe pas encore : à créer avant d'enregistrer le match.";
  }
}
else {
  $avertissements[] = 'Date du match introuvable.';
}

// lieu : le Vélodrome à domicile, sinon la ville, avec l'orthographe déjà utilisée
if (valeur($ia, 'omDomicile') && !valeur($ia, 'terrainNeutre')) {
  $lieu = 'Orange Vélodrome';
}
else {
  $ville = trim(valeur($ia, 'ville', ''));
  $lieu = valeurConnue($ville, $lieux) ?: $ville;
}

// compétition et niveau
$competition = trim(valeur($ia, 'competition', ''));
if (valeurConnue($competition, $competitions)) {
  $competition = valeurConnue($competition, $competitions);
}
else if ($competition) {
  $avertissements[] = "Compétition absente de la base : $competition.";
}
$niveau = trim(valeur($ia, 'niveau', ''));
$niveau = valeurConnue($niveau, $niveaux) ?: $niveau;

// adversaire : l'id proposé par l'IA, sinon le nom
$adversaireIA = valeur($ia, 'adversaire', array());
$nomAdversaire = trim(valeur($adversaireIA, 'nom', ''));
$idAdversaire = strval(valeur($adversaireIA, 'id', ''));
if (!isset($adversairesParId[$idAdversaire])) {
  $idAdversaire = null;
  $nomsAdversaires = array();
  foreach ($adversaires as $adversaire) {
    $nomsAdversaires[$adversaire['id']] = $adversaire['nom'];
  }
  $connu = valeurConnue($nomAdversaire, $nomsAdversaires);
  if ($connu) {
    $idAdversaire = strval(array_search($connu, $nomsAdversaires));
  }
  else {
    $avertissements[] = "Adversaire non reconnu : $nomAdversaire. À sélectionner, ou à créer s'il n'a pas encore de fiche.";
  }
}

// score
$butsOM = intval(valeur($ia, 'butsOM', 0));
$butsAdv = intval(valeur($ia, 'butsAdv', 0));
$rqScore = in_array(valeur($ia, 'prolongation'), array('ap', 'tab')) ? valeur($ia, 'prolongation') : null;

// buteurs
$buteursOM = array();
foreach ((array) valeur($ia, 'buteursOM', array()) as $but) {
  $csc = !!valeur($but, 'csc');
  $minute = entierOuNull(valeur($but, 'minute'));
  $buteur = valeur($but, 'joueur', array());
  $buteursOM[] = array(
    'minute'      => $minute,
    'minuteExtra' => entierOuNull(valeur($but, 'minuteExtra')),
    'csc'         => $csc,
    'joueur'      => $csc ? null : idJoueur(valeur($buteur, 'nom', ''), valeur($buteur, 'id'), "but à la {$minute}e"),
    'nomCsc'      => $csc ? mb_strtoupper(trim(valeur($but, 'nomCsc', '')), 'UTF-8') : '',
    'penalty'     => !!valeur($but, 'penalty')
  );
}
$buteursAdv = array();
foreach ((array) valeur($ia, 'buteursAdv', array()) as $but) {
  $buteursAdv[] = array(
    'minute'      => entierOuNull(valeur($but, 'minute')),
    'minuteExtra' => entierOuNull(valeur($but, 'minuteExtra')),
    'csc'         => !!valeur($but, 'csc'),
    'nom'         => mb_strtoupper(trim(valeur($but, 'nom', '')), 'UTF-8'),
    'penalty'     => !!valeur($but, 'penalty')
  );
}
if (count($buteursOM) !== $butsOM) {
  $avertissements[] = count($buteursOM) . " buteur(s) de l'OM trouvé(s) pour $butsOM but(s).";
}
if (count($buteursAdv) !== $butsAdv) {
  $avertissements[] = count($buteursAdv) . " buteur(s) adverse(s) trouvé(s) pour $butsAdv but(s).";
}

// remplaçants entrés en jeu, dans l'ordre d'entrée : leur rang est le n° de remplacement des titulaires
$remplacantsIA = array_values((array) valeur($ia, 'remplacants', array()));
usort($remplacantsIA, function ($a, $b) {
  return intval(valeur($a, 'minuteEntree', 0)) - intval(valeur($b, 'minuteEntree', 0));
});
$remplacants = array();
foreach ($remplacantsIA as $remplacant) {
  $carton = in_array(valeur($remplacant, 'carton'), array('A', 'E')) ? valeur($remplacant, 'carton') : '';
  $remplacants[] = array(
    'joueur'             => idJoueur(valeur($remplacant, 'nom', ''), valeur($remplacant, 'id'), 'entré à la ' . valeur($remplacant, 'minuteEntree') . 'e'),
    'carton'             => $carton,
    'minuteCarton'       => $carton ? entierOuNull(valeur($remplacant, 'minuteCarton')) : null,
    'minuteRemplacement' => entierOuNull(valeur($remplacant, 'minuteEntree'))
  );
}
if (count($remplacants) > 5) {
  $avertissements[] = count($remplacants) . ' remplaçants entrés en jeu : le formulaire en prévoit 5.';
}

$titulaires = array();
foreach ((array) valeur($ia, 'titulaires', array()) as $index => $titulaire) {
  $carton = in_array(valeur($titulaire, 'carton'), array('A', 'E')) ? valeur($titulaire, 'carton') : '';
  $numero = null;
  $minuteRemplacement = null;
  $remplacePar = valeur($titulaire, 'remplacePar');
  if ($remplacePar) {
    foreach ($remplacantsIA as $rang => $remplacant) {
      if (normaliser(valeur($remplacant, 'nom', '')) === normaliser($remplacePar)) {
        $numero = $rang + 1;
        $minuteRemplacement = entierOuNull(valeur($titulaire, 'minuteRemplacement'));
        if ($minuteRemplacement === null) {
          $minuteRemplacement = entierOuNull(valeur($remplacant, 'minuteEntree'));
        }
      }
    }
    if (!$numero) {
      $avertissements[] = valeur($titulaire, 'nom') . " est remplacé par $remplacePar, absent des remplaçants entrés en jeu.";
    }
  }
  $titulaires[] = array(
    'joueur'             => idJoueur(valeur($titulaire, 'nom', ''), valeur($titulaire, 'id'), 'titulaire n° ' . ($index + 1)),
    'carton'             => $carton,
    'minuteCarton'       => $carton ? entierOuNull(valeur($titulaire, 'minuteCarton')) : null,
    'remplacement'       => $numero,
    'minuteRemplacement' => $minuteRemplacement
  );
}
if (count($titulaires) !== 11) {
  $avertissements[] = count($titulaires) . ' titulaire(s) trouvé(s) au lieu de 11.';
}

// classement (championnat ou phase de ligue) : les 3 premiers, puis « 9. OM (14/10) » avec les buts
// pour et contre de l'OM dans la compétition, calculés depuis la base ; l'OM prend sa place s'il est dans les 3 premiers
$classementLignes = array();
if (strpos($niveau, 'journée') !== false && $saison && $date) {
  $bp = $butsOM;
  $bc = $butsAdv;
  $pts = $butsOM > $butsAdv ? 3 : ($butsOM == $butsAdv ? 1 : 0);
  foreach (DBAccess::query(utf8_decode(
    "SELECT ButsOM AS butsOM, ButsAdv AS butsAdv FROM matches
     WHERE Saison = '$saison' AND Competition = '" . General::corrigeDisplayPourSQL($competition) . "'
     AND Niveau LIKE '%journ%' AND DateMatch < '$date'"
  )) as $match) {
    $bp += intval($match['butsOM']);
    $bc += intval($match['butsAdv']);
    $pts += $match['butsOM'] > $match['butsAdv'] ? 3 : ($match['butsOM'] == $match['butsAdv'] ? 1 : 0);
  }

  $classementIA = valeur($ia, 'classement');
  $omIA = valeur($classementIA, 'om', array());
  $rangOM = entierOuNull(valeur($omIA, 'rang'));
  $ptsOM = entierOuNull(valeur($omIA, 'pts'));
  $ligneOM = array('equipe' => "OM ($bp/$bc)", 'pts' => $ptsOM !== null ? $ptsOM : $pts);

  $autres = array();
  foreach ((array) valeur($classementIA, 'top', array()) as $equipe) {
    $nom = mb_strtoupper(trim(valeur($equipe, 'equipe', '')), 'UTF-8');
    if ($nom && !preg_match('/^(OM|MARSEILLE|OLYMPIQUE DE MARSEILLE)$/', $nom)) {
      $autres[] = array('equipe' => $nom, 'pts' => entierOuNull(valeur($equipe, 'pts')));
    }
  }

  if ($rangOM && $rangOM <= 3) {
    $classementLignes = array_slice($autres, 0, 3);
    array_splice($classementLignes, $rangOM - 1, 0, array($ligneOM));
  }
  else {
    $classementLignes = array_slice($autres, 0, 3);
    while (count($classementLignes) < 3) {
      $classementLignes[] = array('equipe' => null, 'pts' => null);
    }
    $ligneOM['equipe'] = ($rangOM ? "$rangOM. " : '') . $ligneOM['equipe'];
    $classementLignes[] = $ligneOM;
  }

  if (!$classementIA || !count($autres)) {
    $avertissements[] = 'Classement introuvable : la ligne de l\'OM est calculée depuis la base, son rang et les 3 premiers sont à compléter.';
  }
  else if ($classement) {
    $avertissements[] = 'Classement lu sur la page de la compétition au moment de l\'import : à vérifier s\'il a évolué depuis le match.';
  }
}
while (count($classementLignes) < 4) {
  $classementLignes[] = array('equipe' => null, 'pts' => null);
}

foreach ((array) valeur($ia, 'remarques', array()) as $remarque) {
  if (is_string($remarque) && trim($remarque) !== '') {
    $avertissements[] = trim($remarque);
  }
}


// **************************************************************
// ******* JSON *************************************************
// **************************************************************

repondre(array(
  'data' => array(
    'saison'      => $saison,
    'date'        => $date,
    'lieu'        => $lieu,
    'competition' => $competition,
    'niveau'      => $niveau,
    'adversaire'  => $idAdversaire,
    'butsOM'      => $butsOM,
    'butsAdv'     => $butsAdv,
    'rqScore'     => $rqScore,
    'tabOM'       => $rqScore === 'tab' ? intval(valeur($ia, 'tabOM', 0)) : 0,
    'tabAdv'      => $rqScore === 'tab' ? intval(valeur($ia, 'tabAdv', 0)) : 0,
    'spectateurs' => entierOuNull(valeur($ia, 'spectateurs')),
    'buteursOM'   => $buteursOM,
    'buteursAdv'  => $buteursAdv,
    'titulaires'  => $titulaires,
    'remplacants' => $remplacants,
    'classement'  => array_slice($classementLignes, 0, 4)
  ),
  'avertissements' => $avertissements,
  'source' => array(
    'mode'       => $mode,
    'url'        => $url,
    'titre'      => $titre,
    'classement' => !!$classement
  ),
  'ia' => $ia // réponse brute, pour comprendre une erreur de conversion
));

?>
