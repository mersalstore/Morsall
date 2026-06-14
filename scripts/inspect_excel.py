import pandas as pd
import sys
import io

# force stdout to utf-8 if needed, but writing to file is safer
file_path = r"F:\Client-MohamedBadawi\matger2\ARTZfarmile238127_packages_1779380442345.xlsx"
out_path = r"d:\New-folder\matger2\scripts\excel_content.txt"

try:
    xl = pd.ExcelFile(file_path)
    with io.open(out_path, "w", encoding="utf-8") as f:
        f.write(f"Sheets in the file: {xl.sheet_names}\n")
        
        for sheet_name in xl.sheet_names:
            df = xl.parse(sheet_name)
            f.write(f"\n--- Sheet: {sheet_name} ---\n")
            f.write("Columns:\n")
            f.write(str(df.columns.tolist()) + "\n")
            f.write("\nFirst 15 rows:\n")
            f.write(df.head(15).to_string() + "\n")
    print("Done writing to excel_content.txt")
except Exception as e:
    print("Error reading Excel:", e)
