<?php

require_once 'utils/headers.php';
require_once 'utils/db.php';
require_once 'config.php';
require_once 'utils/ai.php';

// -------------------------------------------------------
// Entrée
// -------------------------------------------------------
$input     = json_decode(file_get_contents('php://input'), true);
$question  = isset($input['question'])   ? trim($input['question'])  : '';
$historique = isset($input['historique']) ? $input['historique']      : [];

if (!$question) {
    http_response_code(400);
    echo json_encode(['error' => 'Question manquante']);
    exit;
}

// -------------------------------------------------------
// Schéma de la base (contexte pour le LLM)
// -------------------------------------------------------
$schema = <<<SCHEMA
Base de données SQLite sur l'historique de l'Olympique de Marseille (OM).

TABLE matches
  IdMatch       INTEGER  (clé primaire)
  Saison        TEXT     (ex: "1999-00", "2005-06")
  Lieu          TEXT     (ville ou stade où se joue le match ; ex: "Orange Vélodrome", "Stade de France", "Paris", "Lyon"…
                          Un match est à domicile si Lieu est 'Huveaune', 'Stade Vél'' ou 'Orange Vélodrome'
  DateMatch     DATE     (format YYYY-MM-DD)
  Competition   TEXT     (FK → competitions.NomCompetition)
  Niveau        TEXT     (tour ou journée du match ; ex: "1re journée", "Phase de groupes, 3e journée",
                          "16e de finale", "8e de finale Aller", "Quart de finale Retour",
                          "Demi-finale", "FINALE", "Barrages aller"…)
  Adversaire    INTEGER  (FK → adversaires.IdAdversaire)
  ButsOM        INTEGER  (buts marqués par l'OM)
  ButsAdv       INTEGER  (buts marqués par l'adversaire)
  RqScore       TEXT     (remarque sur le score: "a.p." pour prolongations ou "tab" pour tirs au but)
  TABOM         INTEGER  (buts aux tirs au but OM ; NULL si pas de TAB)
  TABAdv        INTEGER  (buts aux tirs au but adversaire)
  Spectateurs   INTEGER  (nombre de spectateurs)
  Commentaire   TEXT     (commentaire libre sur le match)
  Titre         TEXT     (titre / accroche du match)

TABLE adversaires
  IdAdversaire  INTEGER  (clé primaire)
  NomAdversaire TEXT

TABLE competitions
  IdCompetition       INTEGER  (clé primaire)
  NomCompetition      TEXT     (nom complet ; ex: "Ligue 1", "Coupe de France", "Ligue des Champions")
  TypeCompetition     TEXT     ('Championnat', 'Coupe Nationale', "Coupe d'Europe")
  SousTypeCompetition TEXT     (code court de la compétition) :
    -- Championnat : 'CH' (vieux championnats / groupes régionaux), 'D1' (1re Division), 'D2' (2e Division), 'L1' (Ligue 1)
    -- Coupe Nationale : 'CF' (Coupe de France / Charles-Simon), 'CL' (Coupe de la Ligue / Drago / Libération), 'TC' (Trophée des Champions)
    -- Coupe d'Europe : 'C1' (C1/Ligue des Champions), 'C2' (Coupe des Vainqueurs de Coupe),
                        'C3' (Coupe UEFA / Ligue Europa), 'C4' (Ligue Europa Conférence),
                        'FO' (Coupe des Villes de Foire), 'IN' (Coupe Intertoto)

TABLE joueurs
  IdJoueur            INTEGER  (clé primaire)
  Nom                 TEXT
  Prenom              TEXT
  Poste               TEXT     ('GA'=gardien, 'DE'=défenseur, 'MI'=milieu, 'AV'=attaquant)
  DateNaissance       DATE
  VilleNaissance      TEXT
  TerritoireNaissance TEXT     (pays/région de naissance)
  Nationalite         TEXT
  Selections          INTEGER  (sélections en équipe nationale)
  ClubPrecedent       TEXT     (club quitté pour rejoindre l'OM)
  ClubSuivant         TEXT     (club rejoint après l'OM)
  AuClub              BOOLEAN  (1 = toujours à l'OM)
  DateDeces           DATE     (NULL si vivant)

TABLE joue  (participation d'un joueur à un match)
  Id          INTEGER  (clé primaire)
  IdMatch     INTEGER  (FK → matches.IdMatch)
  IdJoueur    INTEGER  (FK → joueurs.IdJoueur)
  Ordre       INTEGER  (position dans la liste : 1-11 = titulaire, NULL = entré en jeu en cours de match)
  MinuteRmp   INTEGER  (minute de remplacement, si remplaçant)
  NumRmp      INTEGER  (numéro du remplacement : 1, 2 ou 3)
  Carton      TEXT     ('A'=carton jaune, 'E'=carton rouge, 'AE'=2 jaunes → rouge)

TABLE buteursom  (buts marqués par les joueurs de l'OM)
  IdBut           INTEGER  (clé primaire)
  IdMatch         INTEGER  (FK → matches.IdMatch)
  IdJoueur        INTEGER  (FK → joueurs.IdJoueur)
  MinuteBut       INTEGER  (minute du but)
  MinuteButExtra  INTEGER  (minute dans les arrêts de jeu)
  NoteBut         TEXT     (type de but : ex "c.s.c.", "pen.", "sur penalty"…)

TABLE dirigeants
  IdDirigeant         INTEGER  (clé primaire)
  Nom                 TEXT
  Prenom              TEXT
  DateNaissance       DATE
  VilleNaissance      TEXT
  TerritoireNaissance TEXT
  Nationalite         TEXT
  DateDeces           DATE
  IdJoueur            INTEGER  (FK → joueurs.IdJoueur, si ce dirigeant fut aussi joueur à l'OM)

TABLE fonctions  (fonctions occupées par les dirigeants)
  IdFonction  INTEGER  (clé primaire)
  NomFonction TEXT     (1='Entraîneur', 2='Président', 3='Directeur sportif',
                         4='Actionnaire majoritaire', 7='Président de la section pro',
                         9='Manager général'…)

TABLE dirige  (mandat d'un dirigeant sur une période)
  IdPeriode   INTEGER  (clé primaire)
  IdDirigeant INTEGER  (FK → dirigeants.IdDirigeant)
  IdFonction  INTEGER  (FK → fonctions.IdFonction ; 1 = entraîneur principal)
  Debut       DATE     (date de début de mandat)
  Fin         DATE     (date de fin, NULL si en poste)
  ClubPrecedent TEXT
  ClubSuivant   TEXT

TABLE palmares  (participations aux phases finales / palmarès)
  IdPalmares    INTEGER  (clé primaire)
  Saison        TEXT
  IdCompetition INTEGER  (FK → competitions.IdCompetition)
  Bilan         TEXT     (ex: "V 3-0", "D 0-1")
  Titre         INTEGER  (1 = titre/victoire finale, 2 = finaliste, NULL = autre)
  Match1        INTEGER  (FK → matches.IdMatch, 1er match décisif/final)
  Match2        INTEGER  (FK → matches.IdMatch, 2e match si double confrontation)

TABLE saisons  (liste de toutes les saisons)
  Saison  TEXT  (clé primaire ; format "1999-00", "2005-06"…)

TABLE staff  (membres du staff technique par saison, hors entraîneur principal)
  IdStaff  INTEGER  (clé primaire)
  Saison   TEXT     (FK → saisons.Saison)
  Nom      TEXT
  Prenom   TEXT
  Poste    TEXT     (ex: "Entraîneur adjoint", "Préparateur physique"…)
SCHEMA;

// -------------------------------------------------------
// Étape 0 : Résolution du contexte (si historique non vide)
// -------------------------------------------------------
// Si la question fait référence implicite à un échange précédent,
// on demande au LLM de la reformuler en une question autonome.
$questionAutonome = $question;
if (!empty($historique)) {
    $histoTexte = '';
    foreach ($historique as $msg) {
        $role = ($msg['role'] === 'user') ? 'Utilisateur' : 'Assistant';
        $histoTexte .= $role . ' : ' . $msg['text'] . "\n";
    }

    $reformulPrompt = <<<REFORMUL
Voici une conversation sur l'histoire de l'Olympique de Marseille :

$histoTexte
Nouvelle question : "$question"

Si la nouvelle question fait référence implicite à des entités, joueurs, critères ou résultats mentionnés dans la conversation (pronoms, ellipses, "et en …", "le même joueur", etc.), réécris-la en une question complète et autonome, sans ambiguïté.
Si la question est déjà autonome, retourne-la telle quelle.
Réponds UNIQUEMENT en JSON : { "question": "..." }
REFORMUL;

    try {
        $r = AI::call($reformulPrompt, ['question']);
        if (!empty($r['data']['question'])) {
            $questionAutonome = trim($r['data']['question']);
        }
    } catch (RuntimeException $e) {
        // En cas d'échec, on garde la question originale
    }
}

// -------------------------------------------------------
// Étape 1 : NL → SQL
// -------------------------------------------------------
$sqlPrompt = <<<PROMPT
Tu es un expert SQL sur une base SQLite contenant l'historique des matches, joueurs et entraîneurs de l'Olympique de Marseille.

$schema

À partir de la question posée en français ci-dessous, génère une requête SQL SELECT valide pour y répondre.

Règles strictes :
- Uniquement des requêtes SELECT (jamais UPDATE, INSERT, DELETE, DROP, etc.)
- Ajoute LIMIT 100 sauf si la question demande un total/compte unique
- Utilise des JOIN explicites (pas de virgules dans FROM)
- Pour les noms de joueurs ou d'adversaires, utilise LIKE '%...%' pour être tolérant aux accents/majuscules
- Pour les buts marqués PAR l'OM, utilise la table `buteursom` (jointure sur IdMatch + IdJoueur)
- La Coupe d'Europe correspond à TypeCompetition = "Coupe d'Europe" dans la table competitions
- Pour filtrer par type de compétition, jointure matches → competitions via matches.Competition = competitions.NomCompetition
- Pour déterminer si un match est À DOMICILE : Lieu IN ('Orange Vélodrome','Stade Vél','Stade Vél''','Pont-de-Vivaux','Huveaune','Stade Jean-Bouin (Marseille)') — il n'existe PAS de colonne 'D'/'E' dans matches
- Pour les entraîneurs, utilise dirige JOIN fonctions ON dirige.IdFonction = fonctions.IdFonction WHERE fonctions.NomFonction LIKE '%Entra%' (ou IdFonction = 1)
- TOUJOURS inclure dans le SELECT les colonnes d'ID des entités concernées :
    * joueurs.IdJoueur  si la réponse porte sur des joueurs
    * matches.IdMatch   si la réponse porte sur des matches
    * dirigeants.IdDirigeant  si la réponse porte sur des entraîneurs/dirigeants
  (même si la question ne les demande pas explicitement — ils servent à générer des liens)
- Réponds UNIQUEMENT en JSON valide avec exactement ces deux clés : { "sql": "...", "explication": "..." }

Question : "$questionAutonome"
PROMPT;

try {
    $step1 = AI::call($sqlPrompt, ['sql', 'explication']);
    $sql        = isset($step1['data']['sql'])        ? trim($step1['data']['sql'])        : null;
    $explication = isset($step1['data']['explication']) ? $step1['data']['explication']     : '';

    if (!$sql) {
        echo json_encode(['error' => "L'IA n'a pas pu générer de requête SQL.", 'detail' => $step1]);
        exit;
    }

    // -------------------------------------------------------
    // Garde-fou sécurité : uniquement SELECT
    // -------------------------------------------------------
    if (!preg_match('/^\s*SELECT\b/i', $sql) ||
        preg_match('/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|ATTACH|DETACH|PRAGMA)\b/i', $sql)) {
        echo json_encode(['error' => 'Requête non autorisée générée par le LLM.', 'sql' => $sql]);
        exit;
    }

    // -------------------------------------------------------
    // Étape 2 : Exécution SQL
    // -------------------------------------------------------
    $rows = DBAccess::query($sql);

    if ($rows === null) {
        echo json_encode([
            'error'       => "Erreur lors de l'exécution SQL.",
            'sql'         => $sql,
            'explication' => $explication
        ]);
        exit;
    }

    // -------------------------------------------------------
    // Étape 3 : Reformulation en langage naturel avec liens
    // -------------------------------------------------------
    $nbResultats = count($rows);
    $dataJson    = json_encode(array_slice($rows, 0, 20), JSON_UNESCAPED_UNICODE); // max 20 lignes dans le prompt

    $answerPrompt = <<<PROMPT2
Tu es un assistant passionné de football et expert de l'Olympique de Marseille.
On a posé cette question : "$question"
La requête SQL exécutée était : $sql
Nombre de résultats : $nbResultats
Données (extrait JSON) : $dataJson

Formule une réponse claire, directe et naturelle en français (3 lignes maximum).
Si les données sont vides, dis-le simplement.

RÈGLE OBLIGATOIRE — liens cliquables :
Chaque entité nommée dans ta réponse DOIT être un lien HTML si son ID est présent dans les données JSON.
Exemples de format attendu :
  • joueur  → <a href="#/joueur/4650">Steve Mandanda</a>
  • match   → <a href="#/match/8721">OM - Real Madrid (3-0, 1993-05-26)</a>
  • entraîneur/dirigeant → <a href="#/dirigeant/12">Marcelo Bielsa</a>
  • saison  → <a href="#/saison/1992-93">saison 1992-93</a>
N'invente jamais un ID : copie-le exactement depuis les données JSON ci-dessus.
Balises autorisées : <a> et <strong> uniquement.

Réponds UNIQUEMENT en JSON : { "reponse": "..." }
PROMPT2;

    $step3  = AI::call($answerPrompt, ['reponse']);
    $reponse = isset($step3['data']['reponse']) ? $step3['data']['reponse'] : null;

    // -------------------------------------------------------
    // Réponse finale
    // -------------------------------------------------------
    echo json_encode([
        'question'         => $question,
        'questionAutonome' => ($questionAutonome !== $question) ? $questionAutonome : null,
        'sql'              => $sql,
        'explication'      => $explication,
        'resultats'        => $rows,
        'reponse'          => $reponse
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (RuntimeException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}

?>

