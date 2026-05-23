import os

search_terms = ["SDG", "45,200", "1.2M", "850,000", "850000"]
for root, dirs, files in os.walk("."):
    if any(x in root for x in ["node_modules", ".next", ".git"]):
        continue
    for file in files:
        if file.endswith((".tsx", ".ts", ".js", ".jsx", ".json", ".html", ".php", ".txt", ".md")):
            fpath = os.path.join(root, file)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = f.read()
                    for term in search_terms:
                        if term in content:
                            print(f"Found '{term}' in {fpath}")
            except Exception as e:
                pass
print("Done search.")
