import re

filepath = r"C:\Users\hazem\.gemini\antigravity\brain\bc573419-c267-49c2-bcd4-c72cafca7aa7\olivery_waybill_a6.pdf"

with open(filepath, 'rb') as f:
    content = f.read()

# Let's find all text segments inside parentheses ( ... )
# Note: PDF strings can contain escaped parentheses like \( or \)
# But we can find strings that start with \376\377
matches = []

# Regex to find parenthesized strings containing \376\377 or similar octal codes
# e.g., \376\377...
pattern = re.compile(br'\((.*?)\)')
for m in pattern.finditer(content):
    data = m.group(1)
    if b'\\376\\377' in data or data.startswith(b'\\376\\377'):
        # Decode octal escapes
        # A sequence like b'\\376\\377\\000\\103' means:
        # \\376 is character octal 376
        # Let's write a parser to convert octal sequences to bytes
        i = 0
        decoded_bytes = bytearray()
        while i < len(data):
            if data[i:i+1] == b'\\' and i + 1 < len(data):
                # check if followed by 3 octal digits
                octal_match = re.match(br'^([0-7]{3})', data[i+1:i+4])
                if octal_match:
                    octal_val = int(octal_match.group(1), 8)
                    decoded_bytes.append(octal_val)
                    i += 4
                else:
                    # just an escaped character like \( or \)
                    # in this case, append the character after backslash
                    decoded_bytes.append(data[i+1])
                    i += 2
            else:
                decoded_bytes.append(data[i])
                i += 1
        
        try:
            # The decoded bytes should start with \xfe\xff (UTF-16BE)
            if decoded_bytes.startswith(b'\xfe\xff'):
                text = decoded_bytes[2:].decode('utf-16-be')
                matches.append(text)
            else:
                text = decoded_bytes.decode('utf-8', errors='ignore')
                matches.append(text)
        except Exception as e:
            pass

print(f"Extracted {len(matches)} decoded text fields:")
for i, m in enumerate(matches, 1):
    print(f"{i}: {m}")
