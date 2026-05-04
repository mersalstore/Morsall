export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export function validateProductRow(row: any, index: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!row.title || row.title.length < 3) {
    errors.push({ row: index + 1, field: "اسم المنتج", message: "الاسم قصير جداً أو مفقود" });
  }

  if (isNaN(Number(row.price)) || Number(row.price) <= 0) {
    errors.push({ row: index + 1, field: "السعر", message: "السعر يجب أن يكون رقماً موجباً" });
  }

  if (isNaN(Number(row.stock)) || Number(row.stock) < 0) {
    errors.push({ row: index + 1, field: "الكمية", message: "الكمية غير صالحة" });
  }

  if (!row.images || !row.images.startsWith("http")) {
    errors.push({ row: index + 1, field: "الصور", message: "رابط الصورة غير صالح" });
  }

  return errors;
}
