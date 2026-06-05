from PIL import Image, ImageChops
from collections import deque
import numpy as np

def flood_fill_white(arr, brightness_thresh=158, sat_thresh=38):
    h, w = arr.shape[:2]
    R = arr[:,:,0].astype(float)
    G = arr[:,:,1].astype(float)
    B = arr[:,:,2].astype(float)
    brightness = (R + G + B) / 3
    saturation = arr.max(axis=2).astype(float) - arr.min(axis=2).astype(float)
    is_bg = (brightness > brightness_thresh) & (saturation < sat_thresh)
    visited = np.zeros((h, w), dtype=bool)
    mask = np.zeros((h, w), dtype=bool)
    queue = deque()
    for x in range(w):
        for y in [0, h-1]:
            if is_bg[y, x] and not visited[y, x]:
                visited[y, x] = True; mask[y, x] = True; queue.append((y, x))
    for y in range(h):
        for x in [0, w-1]:
            if is_bg[y, x] and not visited[y, x]:
                visited[y, x] = True; mask[y, x] = True; queue.append((y, x))
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny, nx = cy+dy, cx+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg[ny, nx]:
                visited[ny, nx] = True; mask[ny, nx] = True; queue.append((ny, nx))
    arr[mask] = [255, 255, 255]
    return arr

def trim_and_pad(img, pad_pct=0.20):
    # Auto-trim white border
    bg = Image.new("RGB", img.size, (255, 255, 255))
    diff = ImageChops.difference(img, bg)
    bbox = diff.getbbox()
    if bbox:
        img = img.crop(bbox)
    # Add padding
    w, h = img.size
    pad = int(max(w, h) * pad_pct)
    canvas = Image.new("RGB", (w + pad*2, h + pad*2), (255, 255, 255))
    canvas.paste(img, (pad, pad))
    return canvas

# --- Frontal: desde archivo actual del producto (ya procesado), trim + repad ---
img1 = Image.open(r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique\panisse-boutique-azur-1.jpg").convert("RGB")
result1 = trim_and_pad(img1, pad_pct=0.20)
result1.save(r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique\panisse-boutique-azur-1.jpg", "JPEG", quality=93)
print(f"Frontal OK: {result1.size}")

# --- Lateral: desde original, flood fill + trim + repad ---
img2 = Image.open(r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique\panisse-boutique-azur-2.jpg").convert("RGB")
arr2 = np.array(img2)
arr2 = flood_fill_white(arr2, brightness_thresh=155, sat_thresh=40)
img2_clean = Image.fromarray(arr2)
result2 = trim_and_pad(img2_clean, pad_pct=0.20)
result2.save(r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique\panisse-boutique-azur-2.jpg", "JPEG", quality=93)
print(f"Lateral OK: {result2.size}")
