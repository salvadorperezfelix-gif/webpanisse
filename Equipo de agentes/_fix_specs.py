import json, sys

path = sys.argv[1]
with open(path, encoding="utf-8") as f:
    data = json.load(f)

fixes = {
    "mr-boho-kerns":          (47, 24, "Unisex"),
    "mr-boho-parikia-ambar":  (58, 19, "Mujer"),
    "mr-boho-parikia":        (58, 19, "Mujer"),
    "mr-boho-barrosa-crema":  (49, 22, "Mujer"),
    "mr-boho-savina-naranja": (52, 21, "Mujer"),
    "mr-boho-savina":         (52, 21, "Mujer"),
    "mr-boho-solarte-rojo":   (51, 22, "Mujer"),
    "mr-boho-ons":            (47, 23, "Unisex"),
    "mr-boho-colombier":      (52, 24, "Unisex"),
    "mr-boho-solarte-naranja":(51, 22, "Mujer"),
    "mr-boho-solarte":        (51, 22, "Mujer"),
    "mr-boho-coron":          (53, 23, "Mujer"),
}

for p in data:
    if p["id"] in fixes:
        cal, pue, gen = fixes[p["id"]]
        p["specs"] = {
            "material": "Acetato",
            "calibre": f"{cal} mm",
            "puente": f"{pue} mm",
            "varilla": "145 mm",
            "genero": gen
        }
        p.pop("genero", None)
        print(f"Fixed {p['id']}")

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print("Done")
