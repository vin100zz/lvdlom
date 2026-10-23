"""Génère les gabarits de maillots de style/maillots à partir des gabarits RGB de fmastra.

    python tools/maillots.py C:/V/fmastra/web/kits/templates

Chaque gabarit fmastra (1 254 px) est nettoyé des poussières détachées autour du maillot,
recadré sur le maillot, centré avec une marge fixe pour que l'écusson tombe toujours au même
endroit, puis réduit en 420 px (le hero l'affiche en 170 px, net jusqu'en 2x).
Rouge, vert et bleu restent les trois zones de couleur ; leur intensité porte l'ombre du tissu.
"""

import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

SIZE = 420
MARGIN = 6 / 210  # marge des anciens gabarits
COUNT = 57  # même numérotation que fmastra, reprise dans app/utils/maillots.js


def isolate(image):
    """Garde la seule pièce reliée au centre, avec son bord adouci (comme kit_images.py)."""
    alpha = image.getchannel('A')
    core = alpha.point(lambda value: 255 if value >= 160 else 0)
    ImageDraw.floodfill(core, (image.width // 2, image.height // 2), 128)
    core = core.point(lambda value: 255 if value == 128 else 0)
    image.putalpha(ImageChops.multiply(alpha, core.filter(ImageFilter.MaxFilter(3))))
    return image.crop(image.getchannel('A').getbbox())


def frame(shirt):
    side = round(max(shirt.size) / (1 - 2 * MARGIN))
    canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    canvas.alpha_composite(shirt, ((side - shirt.width) // 2, (side - shirt.height) // 2))
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def main(source):
    out = Path(__file__).resolve().parents[1] / 'style' / 'maillots'
    for n in range(1, COUNT + 1):
        with Image.open(source / ('KIT_%d.png' % n)) as image:
            frame(isolate(image.convert('RGBA'))).save(out / ('%d.png' % n), optimize=True)
    print('%d gabarits écrits dans %s' % (COUNT, out))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(Path(sys.argv[1]))
