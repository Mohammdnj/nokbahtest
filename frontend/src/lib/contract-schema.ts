import { z } from "zod";

const nationalId = z.string().regex(/^[12]\d{9}$/, "رقم الهوية يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام");
const saudiPhone = z.string().regex(/^05\d{8}$/, "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
const postalCode = z.string().regex(/^\d{5}$/, "الرمز البريدي يجب أن يكون 5 أرقام");
const fourDigits = z.string().regex(/^\d{4}$/, "يجب أن يتكون من 4 أرقام");
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صالح");

export const step1Schema = z.object({
  owner_or_tenant: z.enum(["owner", "tenant"], { message: "مطلوب" }),
  owner_alive: z.enum(["alive", "deceased"], { message: "مطلوب" }),
  deed_type: z.enum(["electronic", "real_estate_registry", "paper"], { message: "مطلوب" }),
  property_type: z.string().min(1, "مطلوب"),
  property_usage: z.enum(["commercial", "residential_commercial"], { message: "مطلوب" }),
  deed_number: z.string().min(1, "مطلوب"),
  deed_date: ymd,
});

export const step2Schema = z.object({
  region: z.string().min(1, "مطلوب"),
  city: z.string().min(1, "مطلوب"),
  district: z.string().min(1, "مطلوب"),
  street_name: z.string().min(1, "مطلوب"),
  building_number: fourDigits,
  postal_code: postalCode,
  additional_number: fourDigits,
});

export const step3Schema = z
  .object({
    owner_name: z.string().min(2, "مطلوب"),
    owner_id_number: nationalId,
    owner_dob: ymd,
    owner_phone: saudiPhone,
    has_agent: z.boolean(),
    agent_name: z.string().optional(),
    agent_id_number: z.string().optional(),
    agent_dob: z.string().optional(),
    agent_phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.has_agent) {
      if (!data.agent_name) ctx.addIssue({ code: "custom", message: "مطلوب", path: ["agent_name"] });
      if (!data.agent_id_number || !/^[12]\d{9}$/.test(data.agent_id_number))
        ctx.addIssue({ code: "custom", message: "رقم الهوية غير صالح", path: ["agent_id_number"] });
      if (!data.agent_dob || !/^\d{4}-\d{2}-\d{2}$/.test(data.agent_dob))
        ctx.addIssue({ code: "custom", message: "التاريخ غير صالح", path: ["agent_dob"] });
      if (!data.agent_phone || !/^05\d{8}$/.test(data.agent_phone))
        ctx.addIssue({ code: "custom", message: "رقم الجوال غير صالح", path: ["agent_phone"] });
    }
  });

export const step4Schema = z
  .object({
    tenant_type: z.enum(["individual", "establishment", "company"]),
    tenant_phone: saudiPhone,
    tenant_id_number: z.string().optional(),
    tenant_dob: z.string().optional(),
    commercial_register: z.string().optional(),
    vat_number: z.string().optional(),
    company_name: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tenant_type === "individual") {
      if (!data.tenant_id_number || !/^[12]\d{9}$/.test(data.tenant_id_number))
        ctx.addIssue({ code: "custom", message: "رقم الهوية غير صالح", path: ["tenant_id_number"] });
      if (!data.tenant_dob || !/^\d{4}-\d{2}-\d{2}$/.test(data.tenant_dob))
        ctx.addIssue({ code: "custom", message: "التاريخ غير صالح", path: ["tenant_dob"] });
    } else {
      if (!data.commercial_register)
        ctx.addIssue({ code: "custom", message: "مطلوب", path: ["commercial_register"] });
      if (!data.company_name)
        ctx.addIssue({ code: "custom", message: "مطلوب", path: ["company_name"] });
    }
  });

export const step5Schema = z.object({
  unit_type: z.string().min(1, "مطلوب"),
  unit_usage: z.enum(["family", "individual", "collective"]),
  unit_number: z.string().min(1, "مطلوب"),
  floor_number: z.string().min(1, "مطلوب"),
  unit_area: z.coerce.number().gt(0, "المساحة يجب أن تكون أكبر من صفر").lte(100000, "المساحة كبيرة جداً"),
  window_ac_count: z.coerce.number().int().min(0).max(20),
  split_ac_count: z.coerce.number().int().min(0).max(20),
  electricity_meter: z.string().optional(),
  water_meter: z.string().optional(),
});

export const step6Schema = z.object({
  contract_start_date: ymd.refine(
    (v) => new Date(v).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0),
    "التاريخ يجب أن يكون اليوم أو بعده"
  ),
  contract_duration_years: z.coerce.number().int().min(1).max(10),
  annual_rent_amount: z.coerce.number().gt(0, "قيمة الإيجار مطلوبة").lte(10000000, "القيمة كبيرة جداً"),
  payment_method: z.enum(["monthly", "quarterly", "semi_annual", "annual"]),
  additional_conditions: z.string().optional().default(""),
  agreed_terms: z.boolean().refine((v) => v === true, "يجب الموافقة على الشروط والأحكام"),
});

export type Step1 = z.infer<typeof step1Schema>;
export type Step2 = z.infer<typeof step2Schema>;
export type Step3 = z.infer<typeof step3Schema>;
export type Step4 = z.infer<typeof step4Schema>;
export type Step5 = z.infer<typeof step5Schema>;
export type Step6 = z.infer<typeof step6Schema>;

export type ContractFormData = Partial<Step1 & Step2 & Step3 & Step4 & Step5 & Step6>;
