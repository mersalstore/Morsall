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

# Query all fields of order 113
query = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "model": "rb_delivery.order",
        "domain": [["id", "=", 113]],
        "fields": [], # Empty list retrieves all fields in search_read
        "limit": 1
    },
    "id": 2
}

print("Fetching order 113 details...")
res_order = session.post(f"{url}/web/dataset/search_read", json=query)
records = res_order.json().get("result", {}).get("records", [])

if records:
    order = records[0]
    print("\nOrder 113 details:")
    # Print key fields that might represent prices or amounts
    for k, v in sorted(order.items()):
        if any(x in k.lower() for x in ["amount", "price", "fee", "total", "cost", "cod", "payment", "sequence", "reference"]):
            print(f"  {k}: {v}")
    
    # Save the whole order json to a file in scratch
    out_path = "C:/Users/hazem/.gemini/antigravity/brain/bc573419-c267-49c2-bcd4-c72cafca7aa7/scratch/order_113_details.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(order, f, indent=2, ensure_ascii=False)
    print(f"\nSaved full order details to {out_path}")
else:
    print("Order 113 not found!")

session.close()
