<?php

// -------------------------------------------------------
// Fournisseur IA : 'anthropic' ou 'openai'
// -------------------------------------------------------
//define('AI_PROVIDER', 'anthropic');
define('AI_PROVIDER', 'openai');

define('ANTHROPIC_MODEL', 'claude-opus-4-5');
define('OPENAI_MODEL',    'gpt-5.4');

// Clés API — stockées dans secrets.php (non committé)
require_once __DIR__ . '/secrets.php';

// Timeout des appels IA (en secondes)
define('AI_TIMEOUT', 180);

// Nombre maximum de tokens générés (moins = plus rapide, plus court)
define('AI_MAX_TOKENS', 1200);

?>
