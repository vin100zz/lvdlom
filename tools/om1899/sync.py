"""Synchronise les identifiants SQLite et les carrieres publiees par OM1899.

Sans --apply, produit uniquement un rapport. Les pages sont mises en cache pour
permettre une reprise sans solliciter a nouveau le site.
"""
import argparse
from contextlib import closing
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
import json
from pathlib import Path
import re
import shutil
import sqlite3
import time
import unicodedata
from urllib.request import Request, urlopen

from bs4 import BeautifulSoup

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
BASE = 'https://www.om1899.com/'


class MissingPlayer(ValueError):
    pass


def decode(raw):
    # Le site et la DB historique melangent parfois UTF-8 et Latin-1.
    text = raw.decode('utf-8', errors='surrogateescape')
    return ''.join(chr(ord(c) - 0xdc00) if 0xdc80 <= ord(c) <= 0xdcff else c for c in text)


def normalized(text):
    text = unicodedata.normalize('NFKD', (text or '').casefold()).replace('ø', 'o')
    return ' '.join(re.findall(r'[a-z0-9]+', ''.join(c for c in text if not unicodedata.combining(c))))


def has_id(value):
    return value is not None and str(value).strip() not in ('', '0')


def write_json(path, data):
    temporary = path.with_suffix(path.suffix + '.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    temporary.replace(path)


class Source:
    def __init__(self, cache):
        self.cache = cache
        cache.mkdir(parents=True, exist_ok=True)

    def page(self, url, key):
        path = self.cache / (key + '.html')
        if not path.exists():
            for attempt in range(3):
                try:
                    request = Request(BASE + url, headers={'User-Agent': 'LVDLOM-career-sync/1.0'})
                    with urlopen(request, timeout=30) as response:
                        raw = response.read()
                    if b'<html' not in raw.lower():
                        raise ValueError('Reponse HTML absente: ' + url)
                    path.write_bytes(raw)
                    time.sleep(0.15)
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    time.sleep(attempt + 1)
        return BeautifulSoup(decode(path.read_bytes()), 'html.parser')

    def index(self):
        result = {}
        for letter in 'abcdefghijklmnopqrstuvwxyz':
            soup = self.page('liste-joueurs.php?lettre=' + letter, 'index-' + letter)
            for link in soup.select('a[href*="joueurs.php?id="]'):
                name = link.select_one('.liste-joueurs-nom')
                if not name:
                    continue
                surname = name.select_one('b')
                identifier = int(re.search(r'id=(\d+)', link['href'])[1])
                result[identifier] = {
                    'id': identifier, 'nom': name.get_text(' ', strip=True),
                    'surname': surname.get_text(' ', strip=True) if surname else '',
                }
        if len(result) < 1000:
            raise ValueError('Index OM1899 incomplet; import interrompu')
        return result

    def player(self, identifier):
        soup = self.page('joueurs.php?id=' + str(identifier), 'player-' + str(identifier))
        heading = soup.select_one('.infos h1')
        if not heading or not heading.get_text(strip=True):
            raise MissingPlayer('Fiche joueur absente: ' + str(identifier))
        info = soup.select_one('.infos').get_text(' ', strip=True)
        birth = re.search(r'N[ée]+\s+le\s+(\d{2})/(\d{2})/(\d{4})', info, re.I)
        career = []
        for row in soup.select('.carriere tr'):
            cells = row.find_all('td', recursive=False)
            if len(cells) >= 3:
                season, club = [cell.get_text(' ', strip=True) for cell in cells[1:3]]
                if season and club:
                    career.append({'saison': season, 'club': club})
        return {
            'id': identifier, 'nom': heading.get_text(' ', strip=True), 'carriere': career,
            'dateNaissance': '-'.join(reversed(birth.groups())) if birth else None,
        }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Ecrire en DB et regenerer les JSON')
    parser.add_argument('--refresh-all', action='store_true', help='Actualiser aussi toutes les carrieres deja associees')
    parser.add_argument('--cache-dir', type=Path, default=ROOT / 'tmp' / ('om1899-' + datetime.now().strftime('%Y%m%d')))
    parser.add_argument('--overrides', type=Path, help='Correspondances verifiees manuellement {idJoueur: idOm1899}')
    args = parser.parse_args()
    source = Source(args.cache_dir)
    db = sqlite3.connect('file:' + (ROOT / 'om.db3').as_posix() + '?mode=ro', uri=True)
    db.text_factory = decode
    db.row_factory = sqlite3.Row
    players = [dict(row) for row in db.execute('SELECT IdJoueur, Nom, Prenom, DateNaissance, IdOm1899 FROM joueurs')]
    missing = [p for p in players if not has_id(p['IdOm1899'])]
    index = source.index()
    print('Index:', len(index), '| ID manquants:', len(missing), flush=True)
    overrides = json.loads(args.overrides.read_text(encoding='utf-8')) if args.overrides else {}
    used = {int(p['IdOm1899']) for p in players if p not in missing}
    profiles, updates, unresolved = {}, [], []
    for player in missing:
        name = normalized((player['Prenom'] or '') + ' ' + player['Nom'])
        surname = normalized(player['Nom'])
        override = overrides.get(str(player['IdJoueur']))
        candidates = [entry for entry in index.values() if (
            entry['id'] == override if override else
            (surname == normalized(entry['surname']) or set(name.split()) <= set(normalized(entry['nom']).split()))
        )]
        matches = []
        details = []
        for entry in candidates:
            profile = source.player(entry['id'])
            profiles[entry['id']] = profile
            full_name = set(name.split()) <= set(normalized(profile['nom']).split())
            birth_matches = bool(profile['dateNaissance']) and profile['dateNaissance'] == player['DateNaissance']
            details.append({**entry, 'dateNaissance': profile['dateNaissance']})
            if entry['id'] not in used and (override or (full_name and birth_matches)):
                matches.append(entry)
        record = {'idJoueur': player['IdJoueur'], 'nom': name, 'dateNaissance': player['DateNaissance']}
        if len(matches) == 1:
            used.add(matches[0]['id'])
            updates.append({**record, 'idOm1899': matches[0]['id'], 'sourceNom': profiles[matches[0]['id']]['nom']})
        else:
            unresolved.append({**record, 'candidates': details})
    report = {'updates': updates, 'unresolved': unresolved, 'fetchErrors': [], 'unavailableProfiles': [], 'emptyCareers': []}
    write_json(args.cache_dir / 'report.json', report)
    print('Correspondances:', len(updates), '| A verifier:', len(unresolved), flush=True)
    for row in unresolved:
        print(json.dumps(row, ensure_ascii=True), flush=True)

    output = {int(p['id']): p for p in json.loads((HERE / 'output.json').read_text(encoding='utf-8'))}
    pending = {row['idJoueur']: row['idOm1899'] for row in updates}
    target_ids = {int(pending.get(p['IdJoueur']) or p['IdOm1899']) for p in players if pending.get(p['IdJoueur']) or has_id(p['IdOm1899'])}
    refresh_ids = sorted(target_ids if args.refresh_all else target_ids - output.keys())
    def fetch(identifier):
        try:
            return identifier, source.player(identifier), None
        except MissingPlayer as error:
            return identifier, None, error
        except Exception as error:
            return identifier, None, str(error)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for count, (identifier, profile, error) in enumerate(pool.map(fetch, refresh_ids), 1):
            if error:
                if isinstance(error, MissingPlayer) and identifier in output and identifier not in pending.values():
                    report['unavailableProfiles'].append({'id': identifier, 'error': str(error)})
                else:
                    report['fetchErrors'].append({'id': identifier, 'error': str(error)})
            else:
                profiles[identifier] = profile
            if count % 50 == 0 or count == len(refresh_ids):
                print('Carrieres recuperees:', count, '/', len(refresh_ids), flush=True)
    for identifier, profile in profiles.items():
        if not profile['carriere'] and output.get(identifier, {}).get('carriere'):
            report['emptyCareers'].append(identifier)
            continue  # Ne jamais effacer une carriere existante apres une reponse vide.
        output[identifier] = {key: profile[key] for key in ('id', 'nom', 'carriere')}
    mapping = {}
    for player in players:
        identifier = pending.get(player['IdJoueur']) or player['IdOm1899']
        if has_id(identifier) and int(identifier) in output:
            mapping[str(player['IdJoueur'])] = output[int(identifier)]
    report['mappedPlayers'] = len(mapping)
    report['playersWithCareer'] = sum(bool(p['carriere']) for p in mapping.values())
    write_json(args.cache_dir / 'report.json', report)
    if report['fetchErrors']:
        raise RuntimeError('Echec de recuperation; aucune modification appliquee. Voir report.json et relancer.')
    if args.apply:
        backup = ROOT / 'tmp' / ('om1899-backup-' + datetime.now().strftime('%Y%m%d-%H%M%S'))
        backup.mkdir()
        with closing(sqlite3.connect(backup / 'om.db3')) as destination:
            db.backup(destination)
        for name in ('output.json', 'mapping.json'):
            shutil.copy2(HERE / name, backup / name)
        with closing(sqlite3.connect(ROOT / 'om.db3')) as writer, writer:
            for row in updates:
                changed = writer.execute("UPDATE joueurs SET IdOm1899=? WHERE IdJoueur=? AND (IdOm1899 IS NULL OR trim(IdOm1899) IN ('','0'))", (row['idOm1899'], row['idJoueur'])).rowcount
                if changed != 1:
                    raise RuntimeError('DB modifiee pendant l\'import; transaction annulee')
        write_json(HERE / 'output.json', [output[key] for key in sorted(output)])
        write_json(HERE / 'mapping.json', mapping)
        print('Sauvegarde:', backup, flush=True)
    db.close()
    print('APPLIQUE' if args.apply else 'SIMULATION', '| carrieres:', report['playersWithCareer'], '| rapport:', args.cache_dir / 'report.json', flush=True)


if __name__ == '__main__':
    main()
