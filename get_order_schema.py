with open(r"D:\New-folder\matger2\prisma\schema.prisma", "r", encoding="utf-8") as f:
    content = f.read()

# Let's find "model Order" and print the whole block
idx = content.find("model Order {")
if idx != -1:
    end = content.find("}", idx)
    print(content[idx:end+1])
else:
    print("model Order not found")
