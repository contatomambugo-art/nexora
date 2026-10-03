# Gera os ícones da marca (N em gradiente #6C63FF → #FF6B3D sobre #0B0F14). Uso: python3 scripts/gen-icons.py
from PIL import Image, ImageDraw, ImageFont
S = 4
def n_mask(size, scale=1.0):
    W = size * S; m = Image.new('L', (W, W), 0); d = ImageDraw.Draw(m)
    P = lambda x, y: ((.5 + (x - .5) * scale) * W, (.5 + (y - .5) * scale) * W)
    d.polygon([P(.28, .25), P(.40, .25), P(.40, .75), P(.28, .75)], fill=255)
    d.polygon([P(.60, .25), P(.72, .25), P(.72, .75), P(.60, .75)], fill=255)
    d.polygon([P(.28, .25), P(.42, .25), P(.72, .75), P(.58, .75)], fill=255)
    return m.resize((size, size), Image.LANCZOS)
def gradient(size):
    g = Image.new('RGB', (size, size)); px = g.load(); a = (0x6C, 0x63, 0xFF); b = (0xFF, 0x6B, 0x3D)
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size - 2); px[x, y] = tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    return g
def icon(size, scale=1.25, rounded=True):
    bg = Image.new('RGBA', (size, size), (11, 15, 20, 255))
    if rounded:
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0)); mk = Image.new('L', (size, size), 0)
        ImageDraw.Draw(mk).rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * .22), fill=255); img.paste(bg, (0, 0), mk)
    else: img = bg
    img.paste(gradient(size), (0, 0), n_mask(size, scale)); return img
icon(192).save('public/icons/icon-192.png'); icon(512).save('public/icons/icon-512.png')
icon(512, 1.0, False).save('public/icons/maskable-512.png'); icon(180, 1.25, False).save('public/apple-touch-icon.png'); icon(32).save('public/favicon-32.png')
b = Image.new('RGBA', (320, 180), (11, 15, 20, 255)); b.paste(icon(96), (28, 42), icon(96))
try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
except Exception: f = ImageFont.load_default()
ImageDraw.Draw(b).text((136, 74), 'NEXORA', font=f, fill=(229, 231, 235, 255)); b.convert('RGB').save('android-assets/banner.png')
