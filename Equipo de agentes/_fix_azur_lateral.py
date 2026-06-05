from PIL import Image, ImageChops

img = Image.open(r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique\panisse-boutique-azur-2.jpg").convert("RGB")

# Trim white
bg = Image.new("RGB", img.size, (255, 255, 255))
diff = ImageChops.difference(img, bg)
bbox = diff.getbbox()
if bbox:
    img = img.crop(bbox)

# Pad 40%
w, h = img.size
pad = int(max(w, h) * 0.40)
canvas = Image.new("RGB", (w + pad*2, h + pad*2), (255, 255, 255))
canvas.paste(img, (pad, pad))
canvas.save(r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique\panisse-boutique-azur-2.jpg", "JPEG", quality=93)
print(f"Lateral OK: {canvas.size}")
