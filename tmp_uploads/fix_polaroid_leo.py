import os
from PIL import Image
import numpy as np
from collections import deque

SRC_DIR = r"C:\Users\Panisse Óptica Lugo\Desktop\Polaroid"
DST_DIR = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\polaroid"

TARGET = (600, 480)
BG = (255, 255, 255)
THRESHOLD = 215

def remove_bg_bfs(img, threshold):
    img = img.convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    visited = np.zeros((h, w), dtype=bool)
    queue = deque()
    for x in range(w):
        queue.append((0, x)); queue.append((h-1, x))
        visited[0, x] = True; visited[h-1, x] = True
    for y in range(h):
        queue.append((y, 0)); queue.append((y, w-1))
        visited[y, 0] = True; visited[y, w-1] = True
    while queue:
        y, x = queue.popleft()
        r, g, b = arr[y, x, :3]
        if r >= threshold and g >= threshold and b >= threshold:
            arr[y, x, 3] = 0
            for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                ny, nx = y+dy, x+dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))
    return Image.fromarray(arr)

def process(src_path, dst_path):
    img = Image.open(src_path)
    img = remove_bg_bfs(img, THRESHOLD)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    max_w = int(TARGET[0] * 0.88)
    max_h = int(TARGET[1] * 0.82)
    img.thumbnail((max_w, max_h), Image.LANCZOS)
    canvas = Image.new("RGB", TARGET, BG)
    x = (TARGET[0] - img.width) // 2
    y = (TARGET[1] - img.height) // 2 - 8
    canvas.paste(img, (x, y), img)
    canvas.save(dst_path, "JPEG", quality=93)
    print(f"OK: {dst_path} ({img.size})")

# LEOPPP (2) = frontal → 1.jpg (principal)
process(os.path.join(SRC_DIR, "LEOPPP (2).jpg"), os.path.join(DST_DIR, "polaroid-leo-1.jpg"))
# LEOPPP (1) = ángulo → 2.jpg
process(os.path.join(SRC_DIR, "LEOPPP (1).jpg"), os.path.join(DST_DIR, "polaroid-leo-2.jpg"))
