import requests
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

# Let's try downloading A6 Waybill HTML for order ID 113
# We can download from /report/html/<report_name>/<ids>
report_name = "olivery_templates.order_detail_a6"
order_id = 113
report_url = f"{url}/report/html/{report_name}/{order_id}"
print(f"Fetching report HTML from {report_url} ...")
res_report = session.get(report_url)

print(f"Response status code: {res_report.status_code}")
print(f"Response length: {len(res_report.text)}")

# Save to a file in the workspace so we can inspect it!
output_path = "D:/New-folder/matger2/olivery_waybill_a6.html"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(res_report.text)
print(f"Saved waybill HTML to {output_path}")

# Let's try downloading 7.5x10 Waybill HTML for order ID 113
report_name_75 = "olivery_templates.75x100_waybill"
report_url_75 = f"{url}/report/html/{report_name_75}/{order_id}"
print(f"Fetching report HTML from {report_url_75} ...")
res_report_75 = session.get(report_url_75)
output_path_75 = "D:/New-folder/matger2/olivery_waybill_75x100.html"
with open(output_path_75, "w", encoding="utf-8") as f:
    f.write(res_report_75.text)
print(f"Saved waybill HTML to {output_path_75}")

session.close()
