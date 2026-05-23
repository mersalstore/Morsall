import requests

with open("test_image.png", "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\x0d\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

files = {'file': open('test_image.png', 'rb')}
# Using our internal proxy secret to bypass auth
headers = {'X-Proxy-Secret': 'Mersal_Internal_Proxy_2026'}
r = requests.post("https://morsall.com/api/upload", files=files, headers=headers)

print("Status:", r.status_code)
print("Response:", r.text)
