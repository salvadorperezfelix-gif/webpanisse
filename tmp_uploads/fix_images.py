from PIL import Image
import numpy as np
import os

SRC_DIR = r"C:\Users\Panisse Óptica Lugo\Desktop\rayban"
DST_DIR = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\ray-ban"
TARGET_SIZE = (600, 480)
PADDING = 40
BG = (255, 255, 255)

def find_file(directory, length, substring):
    for f in os.listdir(directory):
        if len(f) == length and substring in f:
            return os.path.join(directory, f)
    return None

def remove_bg_floodfill(img, tolerance=30):
    """
    Elimina el fondo usando flood fill desde las 4 esquinas.
    Más preciso que un umbral global.
    """
    img = img.convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    h, w = arr.shape[:2]
    
    # Obtener el color del fondo (esquina TL)
    bg_color = arr[0, 0, :3]
    
    # Máscara de fondo: píxeles similares al color de fondo
    diff = np.sqrt(np.sum((arr[:,:,:3] - bg_color)**2, axis=2))
    bg_mask = diff < tolerance
    
    # Hacer transparente el fondo
    arr[:,:,3] = np.where(bg_mask, 0, 255)
    
    return Image.fromarray(arr.astype(np.uint8))

def crop_to_content(img):
    bbox = img.getbbox()
    if bbox:
        return img.crop(bbox)
    return img

def place_on_white(img, target_size, padding):
    img_copy = img.copy()
    img_copy.thumbnail(
        (target_size[0] - padding*2, target_size[1] - padding*2),
        Image.LANCZOS
    )
    canvas = Image.new("RGB", target_size, BG)
    x = (target_size[0] - img_copy.width) // 2
    y = (target_size[1] - img_copy.height) // 2
    if img_copy.mode == "RGBA":
        canvas.paste(img_copy, (x, y), img_copy)
    else:
        canvas.paste(img_copy, (x, y))
    return canvas

# ── Imagen 1: angular fondo blanco (solo encuadrar) ──
f1 = find_file(SRC_DIR, 16, "(1)")
img1 = Image.open(f1).convert("RGBA")
img1 = remove_bg_floodfill(img1, tolerance=15)  # fondo blanco, tolerancia baja
img1 = crop_to_content(img1)
result1 = place_on_white(img1, TARGET_SIZE, PADDING)
out1 = os.path.join(DST_DIR, "ray-ban-wayfarer-rb5121-1.jpg")
result1.save(out1, "JPEG", quality=92)
print(f"OK: {out1}")

# ── Imagen 2: frontal fondo negro (eliminar fondo oscuro) ──
f5 = find_file(SRC_DIR, 16, "(5)")
img2 = Image.open(f5).convert("RGBA")
img2 = remove_bg_floodfill(img2, tolerance=25)  # fondo negro
img2 = crop_to_content(img2)
result2 = place_on_white(img2, TARGET_SIZE, PADDING)
out2 = os.path.join(DST_DIR, "ray-ban-wayfarer-rb5121-2.jpg")
result2.save(out2, "JPEG", quality=92)
print(f"OK: {out2}")

print("Listo.")
