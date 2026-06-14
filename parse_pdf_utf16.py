import re

filepath = r"C:\Users\hazem\.gemini\antigravity\brain\bc573419-c267-49c2-bcd4-c72cafca7aa7\olivery_waybill_a6.pdf"

with open(filepath, 'rb') as f:
    content = f.read()

# UTF-16BE strings in PDF are usually enclosed in parentheses and start with FE FF bytes.
# In python bytes, FE FF is b'\xfe\xff'.
# Let's find all occurrences of b'\xfe\xff' inside parentheses, or search for b'\xfe\xff' sequences.

matches = []
idx = 0
while True:
    idx = content.find(b'\xfe\xff', idx)
    if idx == -1:
        break
    
    # Let's find the enclosing parentheses or just read up to the end of the text segment
    # In PDF, text is often inside ( ... ) or < ... >
    # Let's find the closing b')' or b'>'
    end_idx_paren = content.find(b')', idx)
    end_idx_angle = content.find(b'>', idx)
    
    end_idx = -1
    if end_idx_paren != -1 and end_idx_angle != -1:
        end_idx = min(end_idx_paren, end_idx_angle)
    elif end_idx_paren != -1:
        end_idx = end_idx_paren
    else:
        end_idx = end_idx_angle
        
    if end_idx != -1:
        utf16_bytes = content[idx:end_idx]
        try:
            text = utf16_bytes.decode('utf-16-be')
            matches.append(text)
        except Exception:
            pass
        idx = end_idx + 1
    else:
        idx += 2

print(f"Extracted {len(matches)} UTF-16BE text fields:")
for i, m in enumerate(matches, 1):
    print(f"{i}: {m}")
