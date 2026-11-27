"""
Procesado correcto para fotos de la carpeta panis.
Todos los productos buenos son 600x480.
Pasos:
  1. Detectar bbox de las gafas (filas con densidad >= 3% de oscuros)
  2. Añadir ~35% de espacio blanco alrededor (gafas llenan ~60-65% del crop)
  3. Ajustar a ratio 5:4
  4. Resize final a 600x480
  5. Guardar JPEG 93
"""
import os
import numpy as np
from PIL import Image

SRC = r"C:\Users\Panisse Óptica Lugo\Desktop\panis"
TARGET = (600, 480)
BG = (255, 255, 255)

def whiten_bg(img, threshold=225):
    """Reemplaza por blanco puro cualquier píxel donde todos los canales > threshold.
    Maneja gradientes de fondo sin BFS."""
    arr = np.array(img.convert("RGB"), dtype=np.uint8)
    near_white = arr.min(axis=2) > threshold
    arr[near_white] = [255, 255, 255]
    return Image.fromarray(arr)

def process(fname, dst_path, w_trim=0.85, fill=0.62):
    """
    w_trim: fracción del bbox ancho a conservar (reduce puntas de varilla)
    fill: fracción del crop que ocupan las gafas en la dimensión limitante
    """
    img = Image.open(os.path.join(SRC, fname)).convert("RGB")
    img = whiten_bg(img)   # fondo blanco puro
    arr = np.array(img)
    W_img, H_img = img.width, img.height

    # Detectar bbox con filtro de densidad (excluye sombras dispersas)
    mask = arr.min(axis=2) < 180
    row_den = mask.sum(axis=1) / W_img
    col_den = mask.sum(axis=0) / H_img
    dense_rows = np.where(row_den >= 0.03)[0]
    dense_cols = np.where(col_den >= 0.03)[0]
    if dense_rows.size == 0:
        print(f"  ERROR sin contenido: {fname}"); return

    r0, r1 = int(dense_rows[0]), int(dense_rows[-1])
    c0, c1 = int(dense_cols[0]), int(dense_cols[-1])
    bw, bh = c1 - c0, r1 - r0
    cx, cy = (c0 + c1) / 2, (r0 + r1) / 2
    print(f"  bbox {bw}x{bh}  center ({int(cx)},{int(cy)})  img {W_img}x{H_img}")

    # Ancho de gafas a mostrar (recorta puntas de varilla)
    gw = bw * w_trim
    gh = bh

    # Dimensiones del crop para que las gafas llenen 'fill' de la dim limitante
    if gw / gh >= 1.25:          # limitado por ancho
        cw = gw / fill
        ch = cw / 1.25
    else:                        # limitado por alto
        ch = gh / fill
        cw = ch * 1.25

    # Clamp a bounds de la imagen
    cw = min(cw, W_img)
    ch = min(ch, H_img)
    # Re-ajustar ratio si se clampó
    if cw / ch > 1.25:
        cw = ch * 1.25
    elif cw / ch < 1.25:
        ch = cw / 1.25

    # Crop centrado en gafas
    x0 = max(0, int(cx - cw/2))
    y0 = max(0, int(cy - ch/2))
    x1 = min(W_img, x0 + int(cw))
    y1 = min(H_img, y0 + int(ch))
    # Si el crop se fue al borde, recentrar
    if x1 == W_img: x0 = max(0, W_img - int(cw))
    if y1 == H_img: y0 = max(0, H_img - int(ch))

    crop = img.crop((x0, y0, x1, y1))
    print(f"  crop {crop.width}x{crop.height}  ratio {crop.width/crop.height:.3f}")

    # Resize a 600x480
    final = crop.resize(TARGET, Image.LANCZOS)
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    final.save(dst_path, "JPEG", quality=93)
    print(f"  saved: {dst_path}\n")


BASE = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products"

print("=== Capri (yesilleo) ===")
process("yesilleo (1).png", f"{BASE}/panisse/panisse-capri-1.jpg",    w_trim=0.85, fill=0.62)
process("yesilleo (2).png", f"{BASE}/panisse/panisse-capri-2.jpg",    w_trim=0.85, fill=0.62)

print("=== Mavisli Leo ===")
process("mavisli leo (1).png", f"{BASE}/panisse-boutique/panisse-boutique-mavisli-leo-1.jpg", w_trim=0.70, fill=0.62)
process("mavisli leo (2).png", f"{BASE}/panisse-boutique/panisse-boutique-mavisli-leo-2.jpg", w_trim=0.75, fill=0.62)
