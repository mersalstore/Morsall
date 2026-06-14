# -*- coding: utf-8 -*-
# Fixes QRCodePlaceholder to use external QR API image

path = r'd:\New-folder\matger2\src\components\admin\ShippingLabel.tsx'

with open(path, encoding='utf-8') as f:
    content = f.read()

# Remove broken qrcode imports
content = content.replace('\nimport { QRCodeSVG } from "qrcode.react";', '')
content = content.replace('\nimport QRCode from "react-qr-code";', '')

# Find QRCodePlaceholder function - find its start and end differently
fn_start = content.find('function QRCodePlaceholder(')
if fn_start == -1:
    print("ERROR: function not found")
    exit(1)

# Find the closing brace of the function by counting braces
depth = 0
i = fn_start
fn_end = -1
in_fn = False
while i < len(content):
    c = content[i]
    if c == '{':
        depth += 1
        in_fn = True
    elif c == '}':
        depth -= 1
        if in_fn and depth == 0:
            fn_end = i + 1
            break
    i += 1

if fn_end == -1:
    print("ERROR: could not find end of function")
    exit(1)

print(f"Function found: [{fn_start}:{fn_end}]")
print("Old function:", repr(content[fn_start:fn_start+80]))

new_fn = '''function QRCodePlaceholder({ value, size = 60 }: { value?: string; size?: number }) {
  const encoded = encodeURIComponent(value || "MORSALL");
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=svg&bgcolor=ffffff&color=000000`;
  return (
    <div style={{ flexShrink: 0, width: size, height: size, background: "#fff" }}>
      <img src={qrUrl} width={size} height={size} alt="QR" style={{ display: "block" }} />
    </div>
  );
}'''

content = content[:fn_start] + new_fn + content[fn_end:]
print("Replaced OK")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Written OK, size:", len(content))
