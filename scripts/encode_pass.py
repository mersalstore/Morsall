import urllib.parse
password = r"l$9Qs3i]g0y]/V~k"
encoded = urllib.parse.quote_plus(password)
print(f"Original: {password}")
print(f"Encoded: {encoded}")
