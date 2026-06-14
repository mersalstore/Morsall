import shutil
import os

src_a6 = "D:/New-folder/matger2/olivery_waybill_a6.html" # It's actually a PDF
src_75 = "D:/New-folder/matger2/olivery_waybill_75x100.html" # It's actually a PDF

dest_dir = "C:/Users/hazem/.gemini/antigravity/brain/bc573419-c267-49c2-bcd4-c72cafca7aa7"
dest_a6 = os.path.join(dest_dir, "olivery_waybill_a6.pdf")
dest_75 = os.path.join(dest_dir, "olivery_waybill_75x100.pdf")

print("Copying files...")
shutil.copyfile(src_a6, dest_a6)
shutil.copyfile(src_75, dest_75)
print("Files copied successfully to:")
print(dest_a6)
print(dest_75)
