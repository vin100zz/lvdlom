# Import OM1899

Depuis la racine du projet, avec Python 3 :

```powershell
python -m pip install -r tools/om1899/requirements.txt
python tools/om1899/sync.py --refresh-all
python tools/om1899/sync.py --refresh-all --apply
```

La première commande d'import est une simulation. `--apply` complète uniquement
les `IdOm1899` vides dans `om.db3`, puis régénère `output.json` et `mapping.json`.
Le composant carrière lit directement `mapping.json` ; aucune compilation du
site n'est nécessaire.

L'association automatique exige un nom complet compatible et la même date de
naissance, avec un identifiant non attribué à un autre joueur. Les ambiguïtés
restent dans `tmp/om1899-AAAAMMJJ/report.json`. Un fichier JSON de correspondances
vérifiées manuellement peut être fourni avec `--overrides chemin.json`, au format
`{"idJoueur": idOm1899}`. Ces exceptions doivent être contrôlées sur les fiches
OM1899 avant utilisation.

`--refresh-all` actualise toutes les fiches déjà associées. Sans cette option,
l'import réutilise les carrières de `output.json` et récupère les fiches absentes.
Les téléchargements sont limités à quatre requêtes simultanées et conservés dans
un cache quotidien. Pour refaire une collecte le même jour, utiliser un nouveau
répertoire avec `--cache-dir tmp/om1899-nouvelle-collecte`.

Avant écriture, une sauvegarde SQLite et des deux fichiers JSON est créée dans
`tmp/om1899-backup-AAAAMMJJ-HHMMSS/`. Une erreur de téléchargement interrompt
l'import avant toute écriture en base. Une carrière vide n'écrase pas une carrière
déjà connue. Consulter le rapport pour les fiches sans carrière et les ID restant
à renseigner. Si une ancienne fiche a disparu d'OM1899, ses données locales sont
conservées et son ID est signalé dans `unavailableProfiles`.

Le serveur historique `server.js` est conservé comme archive : il utilise une
ancienne URL locale et rapproche les joueurs par distance entre noms sans
vérifier leur identité. Utiliser désormais `sync.py` pour les imports.
