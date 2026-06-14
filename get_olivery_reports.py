import requests
import json

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

# Query ir.actions.report for rb_delivery.order model
report_query = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "model": "ir.actions.report",
        "domain": [["model", "=", "rb_delivery.order"]],
        "fields": ["name", "report_name", "report_type", "xml_id"],
        "limit": 50
    },
    "id": 2
}

print("Fetching reports list...")
res_rep = session.post(f"{url}/web/dataset/search_read", json=report_query)
reports = res_rep.json().get("result", {}).get("records", [])

print(f"\nFound {len(reports)} reports for rb_delivery.order:")
for r in reports:
    print(json.dumps(r, indent=2, ensure_ascii=False))

# Let's get the last few orders so we can query a report for one of them
order_query = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "model": "rb_delivery.order",
        "domain": [],
        "fields": ["id", "sequence", "name"],
        "limit": 5,
        "sort": "id desc"
    },
    "id": 3
}
res_order = session.post(f"{url}/web/dataset/search_read", json=order_query)
orders = res_order.json().get("result", {}).get("records", [])
print("\nRecent orders:")
for o in orders:
    print(f"ID: {o['id']}, Sequence: {o.get('sequence')}, Name: {o.get('name')}")

session.close()
