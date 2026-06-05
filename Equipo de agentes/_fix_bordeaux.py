from PIL import Image, ImageChops

def trim_and_pad(path, pad_pct):
    img = Image.open(path).convert("RGB")
    bg = Image.new("RGB", img.size, (255, 255, 255))
    bbox = ImageChops.difference(img, bg).getbbox()
    if bbox:
        img = img.crop(bbox)
    w, h = img.size
    pad = int(max(w, h) * pad_pct)
    canvas = Image.new("RGB", (w + pad*2, h + pad*2), (255, 255, 255))
    canvas.paste(img, (pad, pad))
    canvas.save(path, "JPEG", quality=93)
    print(f"{canvas.size}")

base = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique"
trim_and_pad(f"{base}/panisse-boutique-bordeaux-1.jpg", pad_pct=0.12)
trim_and_pad(f"{base}/panisse-boutique-bordeaux-2.jpg", pad_pct=0.14)
