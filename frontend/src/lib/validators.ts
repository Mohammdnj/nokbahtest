export const validators = {
  nationalId: (v: string) => /^[12]\d{9}$/.test(v),
  saudiPhone: (v: string) => /^05\d{8}$/.test(v),
  postalCode: (v: string) => /^\d{5}$/.test(v),
  buildingNumber: (v: string) => /^\d{4}$/.test(v),
  dateYMD: (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v)),
};

export const errorMessages = {
  required: "هذا الحقل مطلوب",
  nationalId: "رقم الهوية يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام",
  saudiPhone: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام",
  postalCode: "الرمز البريدي يجب أن يكون 5 أرقام",
  buildingNumber: "يجب أن يتكون من 4 أرقام",
  invalidDate: "التاريخ غير صالح",
  dateFuture: "التاريخ يجب أن يكون اليوم أو بعده",
  rentAmount: "قيمة الإيجار يجب أن تكون بين 1 و 10,000,000",
  unitArea: "المساحة يجب أن تكون بين 1 و 100,000",
};
