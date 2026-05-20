import os
from PIL import Image
import numpy as np

DOWNLOADS = r"C:\Users\Panisse Óptica Lugo\Downloads"
DST = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\ray-ban"
TARGET = (600, 480)
PAD = 48
BG = (255, 255, 255)

# Encontrar el archivo más reciente que contenga "RB4340V"
files = sorted(os.listdir(DOWNLOADS), key=lambda f: os.path.getmtime(os.path.join(DOWNLOADS, f)), reverse=True)
src = None
for f in files:
    if "Wayfarer" in f or "RB4340V" in f or "wayfarer" in f.lower():
        src = os.path.join(DOWNLOADS, f)
        print("Encontrado:", f)
        break

if not src:
    # Coger el más reciente simplemente
    src = os.path.join(DOWNLOADS, files[0])
    print("Usando el más reciente:", files[0])

img = Image.open(src).convert("RGBA")
print("Tamaño original:", img.size)

# El fondo es gris claro (#e8e8e8 aprox) — quitar con tolerancia
arr = np.array(img, dtype=float)
bg = arr[0, 0, :3]
print("Color fondo (esquina TL):", bg)
diff = ((arr[:,:,:3] - bg)**2).sum(axis=2)**0.5
arr[:,:,3] = np.where(diff < 18, 0, 255)
img = Image.fromarray(arr.astype("uint8"))

# Recortar al contenido
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
print("Tamaño recortado:", img.size)

# Colocar sobre blanco con padding
img.thumbnail((TARGET[0]-PAD*2, TARGET[1]-PAD*2), Image.LANCZOS)
canvas = Image.new("RGB", TARGET, BG)
x = (TARGET[0] - img.width) // 2
y = (TARGET[1] - img.height) // 2
canvas.paste(img, (x, y), img)

out = os.path.join(DST, "ray-ban-wayfarer-rb4340v-2.jpg")
canvas.save(out, "JPEG", quality=93)
print("Guardada:", out)
