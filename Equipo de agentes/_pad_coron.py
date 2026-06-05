from PIL import Image
import os, sys

img_path = sys.argv[1]
img = Image.open(img_path).convert("RGBA")
w, h = img.size
pad = int(max(w, h) * 0.20)
new_w = w + pad * 2
new_h = h + pad * 2
canvas = Image.new("RGBA", (new_w, new_h), (255, 255, 255, 255))
canvas.paste(img, (pad, pad), img)
canvas = canvas.convert("RGB")
canvas.save(img_path, "JPEG", quality=92)
print(f"Done: {new_w}x{new_h}")
