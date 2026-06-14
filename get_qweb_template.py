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

# Query ir.ui.view for the report template 'order_detail_a6'
# In Odoo, report views can be found by name or by searching for key 'order_detail_a6'
query_view = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "model": "ir.ui.view",
        "domain": [["name", "like", "order_detail_a6"]],
        "fields": ["name", "type", "arch_db", "arch"],
        "limit": 10
    },
    "id": 2
}

print("Fetching QWeb view template...")
res_view = session.post(f"{url}/web/dataset/search_read", json=query_view)
views = res_view.json().get("result", {}).get("records", [])

print(f"\nFound {len(views)} views:")
for v in views:
    print(f"ID: {v['id']}, Name: {v['name']}, Type: {v.get('type')}")
    arch = v.get('arch') or v.get('arch_db')
    if arch:
        print("\n--- ARCHITECTURE ---")
        print(arch[:2000]) # Print first 2000 chars of QWeb XML
        
        # Save to a file in scratch
        out_path = f"C:/Users/hazem/.gemini/antigravity/brain/bc573419-c267-49c2-bcd4-c72cafca7aa7/scratch/view_{v['id']}_arch.xml"
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(arch)
        print(f"\nSaved view arch to {out_path}")

session.close()
