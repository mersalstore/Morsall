import * as XLSX from "xlsx";

/**
 * Exports an array of objects to an Excel file and triggers a download.
 * @param data Array of objects to export
 * @param fileName The base name of the exported file (without .xlsx)
 */
export function exportToExcel(data: any[], fileName: string) {
  if (!data || !data.length) {
     alert("لا توجد بيانات ليتم تصديرها.");
     return;
  }
  
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  // Convert JSON to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Dynamic column widths
  const keys = Object.keys(data[0] || {});
  const colWidths = keys.map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const val = row[key] ? String(row[key]) : "";
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 4, 15), 50) }; // cap between 15 and 50
  });
  ws['!cols'] = colWidths;
  
  // Apply RTL direction to worksheet if supported by viewer
  if(!ws['!views']) ws['!views'] = [];
  ws['!views'].push({ rightToLeft: true });

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  
  // Trigger download
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

/**
 * Parses an Excel file and returns its content as an array of objects.
 * @param file The File object from an input element
 */
export function importFromExcel(
  file: File,
  options?: { raw?: boolean; defval?: any }
): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON. Pass `raw: false` to get formatted text, which
        // preserves leading zeros in phone numbers and similar fields.
        const json = XLSX.utils.sheet_to_json(worksheet, {
          raw: options?.raw ?? true,
          defval: options?.defval,
        });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
