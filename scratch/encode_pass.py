import urllib.parse

password = "4aE1b?DI|"
encoded_password = urllib.parse.quote_plus(password)
print(f"Original: {password}")
print(f"Encoded: {encoded_password}")
