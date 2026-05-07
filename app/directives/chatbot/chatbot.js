/**
 * Directive chatbot — widget flottant permettant d'interroger la base OM
 * en langage naturel via une API IA (OpenAI / Anthropic).
 *
 * Usage dans le HTML : <lvdlom-chatbot></lvdlom-chatbot>
 */
angular.module('lvdlom').directive('lvdlomChatbot', ['$http', '$timeout', '$sce', function ($http, $timeout, $sce) {

  return {
    restrict:    'E',
    templateUrl: 'app/directives/chatbot/chatbot.html',
    scope:       {},

    link: function ($scope) {

      // ── État ──────────────────────────────────────────────────────────
      $scope.open      = false;   // widget ouvert/fermé
      $scope.question  = '';
      $scope.loading   = false;
      $scope.showSql   = false;   // afficher le SQL généré (mode debug)
      $scope.messages  = [];      // historique { role:'user'|'bot', text, sql, resultats, error }

      var SUGGESTIONS = [
        'Combien de buts a marqué Jean-Pierre Papin ?',
        'Qui a joué le plus de matches en Coupe d\'Europe ?',
        'Quand l\'OM a-t-il marqué 7 buts ou plus pour la dernière fois ?',
        'Quel entraîneur a le meilleur taux de victoires ?',
        'Combien de saisons Didier Deschamps a-t-il joué à l\'OM ?',
        'Quel est le record de buts dans un match ?'
      ];

      $scope.suggestions = SUGGESTIONS.slice(0, 3);

      // ── Ouvrir / Fermer ────────────────────────────────────────────────
      $scope.toggleOpen = function () {
        $scope.open = !$scope.open;
        if ($scope.open) {
          $timeout(function () { focusInput(); }, 50);
        }
      };

      $scope.close = function () {
        $scope.open = false;
      };

      // ── Envoyer une question ───────────────────────────────────────────
      $scope.ask = function (question) {
        var q = (question || $scope.question || '').trim();
        if (!q || $scope.loading) return;

        // Message utilisateur
        $scope.messages.push({ role: 'user', text: q });
        $scope.question  = '';
        $scope.loading   = true;
        $scope.suggestions = [];

        scrollToBottom();

        // Historique des échanges précédents (texte brut, sans HTML)
        var historique = $scope.messages.slice(0, -1).map(function (m) {
          var texte = (typeof m.text === 'string') ? m.text : (m.text && m.text.$$unwrapTrustedValue ? m.text.$$unwrapTrustedValue() : String(m.text));
          // Retirer les balises HTML pour ne garder que le texte
          texte = texte.replace(/<[^>]+>/g, '');
          return { role: m.role, text: texte };
        });

        $http.post('services/chatbot.php', { question: q, historique: historique })
          .then(function (resp) {
            var d = resp.data;
            // $sce.trustAsHtml permet de rendre les liens <a href="#/..."> générés par le LLM
            var reponseHtml = $sce.trustAsHtml(d.reponse || '(pas de réponse)');
            $scope.messages.push({
              role:              'bot',
              text:              reponseHtml,
              sql:               d.sql,
              explication:       d.explication,
              resultats:         d.resultats,
              nbResultats:       d.resultats ? d.resultats.length : 0,
              questionAutonome:  d.questionAutonome || null
            });
          })
          .catch(function (err) {
            var msg = (err.data && err.data.error) ? err.data.error : 'Erreur de communication avec le serveur.';
            $scope.messages.push({ role: 'bot', text: $sce.trustAsHtml(msg), error: true });
          })
          .finally(function () {
            $scope.loading = false;
            $timeout(scrollToBottom, 30);
          });
      };

      // ── Touche Entrée ──────────────────────────────────────────────────
      $scope.onKeyDown = function ($event) {
        if ($event.keyCode === 13 && !$event.shiftKey) {
          $event.preventDefault();
          $scope.ask();
        }
      };

      // ── Vider la conversation ──────────────────────────────────────────
      $scope.clear = function () {
        $scope.messages   = [];
        $scope.suggestions = SUGGESTIONS.slice(0, 3);
      };

      // ── Afficher/Masquer le SQL ────────────────────────────────────────
      $scope.toggleSql = function (msg) {
        msg.sqlOpen = !msg.sqlOpen;
      };

      // ── Utilitaires DOM ───────────────────────────────────────────────
      function scrollToBottom() {
        $timeout(function () {
          var el = document.querySelector('.chatbot-messages');
          if (el) el.scrollTop = el.scrollHeight;
        }, 10);
      }

      function focusInput() {
        var el = document.querySelector('.chatbot-input textarea');
        if (el) el.focus();
      }
    }
  };
}]);

