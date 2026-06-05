from PIL import Image, ImageChops
from collections import deque
import numpy as np

def flood_fill_white(arr, brightness_thresh=180, sat_thresh=30):
    h, w = arr.shape[:2]
    brightness = arr.astype(float).mean(axis=2)
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

path = r"C:\Users\Panisse Óptica Lugo\Desktop\PANISSE SOL\BİRİNCİ (1).png"
out  = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse\panisse-calanque-2.jpg"

img = Image.open(path).convert("RGB")
arr = np.array(img)
arr = flood_fill_white(arr)
img2 = Image.fromarray(arr)
bg = Image.new("RGB", img2.size, (255, 255, 255))
bbox = ImageChops.difference(img2, bg).getbbox()
if bbox:
    img2 = img2.crop(bbox)
w, h = img2.size
pad = int(max(w, h) * 0.25)
canvas = Image.new("RGB", (w + pad*2, h + pad*2), (255, 255, 255))
canvas.paste(img2, (pad, pad))
canvas.save(out, "JPEG", quality=93)
print(f"OK: {canvas.size}")
