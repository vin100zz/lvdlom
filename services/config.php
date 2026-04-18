<?php

// -------------------------------------------------------
// Fournisseur IA : 'anthropic' ou 'openai'
// -------------------------------------------------------
//define('AI_PROVIDER', 'anthropic');
define('AI_PROVIDER', 'openai');

// Clé API Anthropic — https://console.anthropic.com/
define('ANTHROPIC_API_KEY', 'xxx');
define('ANTHROPIC_MODEL',   'claude-opus-4-5');

// Clé API OpenAI — https://platform.openai.com/api-keys
define('OPENAI_API_KEY', 'xxx');
define('OPENAI_MODEL',   'gpt-5.4');

// Timeout des appels IA (en secondes)
define('AI_TIMEOUT', 180);

// Nombre maximum de tokens générés (moins = plus rapide, plus court)
define('AI_MAX_TOKENS', 1200);

?>
