from PIL import Image, ImageChops

def trim_and_pad(path_in, path_out, pad_pct):
    img = Image.open(path_in).convert("RGB")
    bg = Image.new("RGB", img.size, (255, 255, 255))
    bbox = ImageChops.difference(img, bg).getbbox()
    if bbox:
        img = img.crop(bbox)
    w, h = img.size
    pad = int(max(w, h) * pad_pct)
    canvas = Image.new("RGB", (w + pad*2, h + pad*2), (255, 255, 255))
    canvas.paste(img, (pad, pad))
    canvas.save(path_out, "JPEG", quality=93)
    print(f"{path_out.split('/')[-1].split(chr(92))[-1]}: {canvas.size}")

base_src = r"C:\Users\Panisse Óptica Lugo\Desktop\PANISSE SOL"
base_out = r"C:\Users\Panisse Óptica Lugo\Desktop\Web Panisse\assets\img\products\panisse-boutique"

# Frontal = BEŞ (2).png
trim_and_pad(f"{base_src}/BEŞ (2).png", f"{base_out}/panisse-boutique-mistral-1.jpg", pad_pct=0.25)
# Lateral = BEŞ (1).png
trim_and_pad(f"{base_src}/BEŞ (1).png", f"{base_out}/panisse-boutique-mistral-2.jpg", pad_pct=0.28)
