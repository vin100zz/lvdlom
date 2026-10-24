import contextlib
import io
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

import sync


class SyncTest(unittest.TestCase):
    def test_mixed_encoding(self):
        self.assertEqual(sync.decode(b'Pr\xeat Marseille / Br\xc3\xb8ndby'), 'Prêt Marseille / Brøndby')
        self.assertEqual(sync.normalized('Pierre-Émile HØJBJERG'), 'pierre emile hojbjerg')

    def test_parse_current_html_without_tbody(self):
        with tempfile.TemporaryDirectory(dir=sync.ROOT / 'tmp') as directory:
            cache = Path(directory)
            (cache / 'player-12.html').write_text('''<html><div class="infos">
                <h1>Bilal NADIR</h1>Né le 28/11/2003</div>
                <table class="carriere"><thead><th>Clubs</th></thead>
                <tr><td></td><td>2023/2024</td><td>prêt Marseille</td></tr></table></html>''', encoding='utf-8')
            player = sync.Source(cache).player(12)
            self.assertEqual(player['dateNaissance'], '2003-11-28')
            self.assertEqual(player['carriere'], [{'saison': '2023/2024', 'club': 'prêt Marseille'}])

    def test_apply_only_verified_missing_ids_and_preserve_biography(self):
        with tempfile.TemporaryDirectory(dir=sync.ROOT / 'tmp') as directory:
            root = Path(directory)
            here = root / 'tools' / 'om1899'
            here.mkdir(parents=True)
            with contextlib.closing(sqlite3.connect(root / 'om.db3')) as db, db:
                db.execute('CREATE TABLE joueurs (IdJoueur INTEGER PRIMARY KEY, Nom TEXT, Prenom TEXT, DateNaissance TEXT, IdOm1899 INTEGER)')
                db.executemany('INSERT INTO joueurs VALUES (?,?,?,?,?)', [
                    (1, 'TEST', 'Paul', '2000-01-01', None),
                    (2, 'TEST', 'Jean', '1999-01-01', 22),
                    (3, 'TEST', 'Paul', '2002-01-01', None),
                    (4, 'X', '', None, 0),
                ])
            old = {'id': 22, 'nom': 'Jean TEST', 'carriere': [{'saison': '2020/2021', 'club': 'Marseille'}]}
            sync.write_json(here / 'output.json', [old])
            sync.write_json(here / 'mapping.json', {'2': old})
            index = {11: {'id': 11, 'nom': 'TEST Paul', 'surname': 'TEST'},
                     22: {'id': 22, 'nom': 'TEST Jean', 'surname': 'TEST'}}
            profiles = {11: {'id': 11, 'nom': 'Paul TEST', 'dateNaissance': '2000-01-01', 'carriere': old['carriere']},
                        22: {**old, 'dateNaissance': '1999-01-01'}}
            argv = ['sync.py', '--cache-dir', str(root / 'tmp' / 'cache')]
            with patch.object(sync, 'ROOT', root), patch.object(sync, 'HERE', here), \
                 patch.object(sync.Source, 'index', return_value=index), \
                 patch.object(sync.Source, 'player', side_effect=lambda identifier: profiles[identifier]), \
                 contextlib.redirect_stdout(io.StringIO()):
                with patch('sys.argv', argv):
                    sync.main()
                with contextlib.closing(sqlite3.connect(root / 'om.db3')) as db:
                    self.assertIsNone(db.execute('SELECT IdOm1899 FROM joueurs WHERE IdJoueur=1').fetchone()[0])
                self.assertEqual(json.loads((here / 'mapping.json').read_text()), {'2': old})
                with patch('sys.argv', argv + ['--apply']):
                    sync.main()
            with contextlib.closing(sqlite3.connect(root / 'om.db3')) as db:
                self.assertEqual(db.execute('SELECT IdOm1899 FROM joueurs ORDER BY IdJoueur').fetchall(), [(11,), (22,), (None,), (0,)])
                self.assertEqual(db.execute('SELECT Prenom,DateNaissance FROM joueurs WHERE IdJoueur=1').fetchone(), ('Paul', '2000-01-01'))
            self.assertEqual(set(json.loads((here / 'mapping.json').read_text())), {'1', '2'})
            self.assertEqual(len(list((root / 'tmp').glob('om1899-backup-*/om.db3'))), 1)


if __name__ == '__main__':
    unittest.main()
