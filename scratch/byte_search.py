import os

search_bytes = [
    ("الأسطول".encode("utf-8"), "الأسطول"),
    ("التسويات".encode("utf-8"), "التسويات"),
    ("850,000".encode("utf-8"), "850,000"),
    ("بدء تسوية".encode("utf-8"), "بدء تسوية"),
    ("جماعية".encode("utf-8"), "جماعية"),
]

for root, dirs, files in os.walk("."):
    if any(x in root for x in ["node_modules", ".next", ".git"]):
        continue
    for file in files:
        if file.endswith((".tsx", ".ts", ".js", ".jsx", ".json", ".html", ".php", ".txt", ".md")):
            fpath = os.path.join(root, file)
            try:
                with open(fpath, "rb") as f:
                    content = f.read()
                    for b_val, label in search_bytes:
                        if b_val in content:
                            print(f"Found '{label}' in {fpath}")
            except:
                pass
print("Done byte search.")
