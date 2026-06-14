import json

fields_path = "C:/Users/hazem/.gemini/antigravity/brain/bc573419-c267-49c2-bcd4-c72cafca7aa7/scratch/olivery_fields.json"
with open(fields_path, "r", encoding="utf-8") as f:
    fields = json.load(f)

print("=== Fields matching key terms ===")
search_terms = ["amount", "price", "fee", "total", "cost", "cod", "collect", "value"]
matched = {}
for k, v in fields.items():
    if any(term in k.lower() for term in search_terms):
        matched[k] = v.get("string", "")

for k, val in sorted(matched.items()):
    print(f"  {k}: {val}")
