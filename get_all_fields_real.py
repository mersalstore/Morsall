import requests
import json
import sys

# Configure stdout encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

url = "https://far-mile.olivery.io"
session = requests.Session()

# Log in
print("Logging in...")
auth_data = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "db": "far-mile",
        "login": "0509838009",
        "password": "pfqugDfL"
    },
    "id": 1
}
res = session.post(f"{url}/web/session/authenticate", json=auth_data)
auth_resp = res.json()
if "error" in auth_resp:
    print("Auth failed:", auth_resp["error"])
    sys.exit(1)
print("Logged in successfully!")

# Load fields list from fields metadata file
fields_path = "C:/Users/hazem/.gemini/antigravity/brain/bc573419-c267-49c2-bcd4-c72cafca7aa7/scratch/olivery_fields.json"
with open(fields_path, "r", encoding="utf-8") as f:
    fields_meta = json.load(f)

fields_list = list(fields_meta.keys())
print(f"Loaded {len(fields_list)} fields from metadata.")

# Query all fields of order 99
query = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "model": "rb_delivery.order",
        "domain": [["id", "=", 99]],
        "fields": fields_list,
        "limit": 1
    },
    "id": 2
}

print("Fetching order 113 details...")
res_order = session.post(f"{url}/web/dataset/search_read", json=query)
records = res_order.json().get("result", {}).get("records", [])

if records:
    order = records[0]
    print("\nOrder 99 details (non-empty fields):")
    for k, v in sorted(order.items()):
        # Skip base64 images to keep output clean
        if isinstance(v, str) and len(v) > 200:
            continue
        if v is not False and v is not None and v != 0 and v != 0.0 and v != "":
            print(f"  {k}: {v}")
    
    # Save the whole order json to a file in scratch
    out_path = "C:/Users/hazem/.gemini/antigravity/brain/bc573419-c267-49c2-bcd4-c72cafca7aa7/scratch/order_99_details.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(order, f, indent=2, ensure_ascii=False)
    print(f"\nSaved full order details to {out_path}")
else:
    print("Order 113 not found!")

session.close()
