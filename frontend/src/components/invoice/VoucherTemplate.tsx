"use client";
import React from "react";

export interface LineItem {
  description: string;
  qty: number;
  price: number;
}

export interface VoucherData {
  docType: "receipt_voucher" | "disbursement_voucher" | "tax_invoice" | "simple_receipt";
  invoiceNumber: string;
  issuedAt: string; // YYYY-MM-DD
  recipientName: string;
  recipientIdNumber?: string;
  recipientPhone?: string;
  paymentMethod: string;
  paymentReference?: string;
  lineItems: LineItem[];
  vatRate: number;
  discountAmount: number;
  description?: string;
  notes?: string;
  issuedByName?: string;
}

const docTypeLabels: Record<VoucherData["docType"], string> = {
  receipt_voucher: "سند قبض",
  disbursement_voucher: "سند صرف",
  tax_invoice: "فاتورة ضريبية",
  simple_receipt: "إيصال استلام",
};

const paymentLabels: Record<string, string> = {
  cash: "نقداً",
  bank_transfer: "تحويل بنكي",
  mada: "مدى",
  credit_card: "بطاقة ائتمان",
  stc_pay: "STC Pay",
  other: "أخرى",
};

export function computeTotals(items: LineItem[], vatRate: number, discount: number) {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const vatAmount = afterDiscount * (vatRate / 100);
  const total = afterDiscount + vatAmount;
  return { subtotal, vatAmount, total };
}

function amountInWords(amount: number): string {
  // Simple fallback — shows the numeric with ر.س, real word conversion is a much larger dependency
  return `${amount.toFixed(2)} ريال سعودي فقط لا غير`;
}

const VoucherTemplate = React.forwardRef<HTMLDivElement, { data: VoucherData }>(
  ({ data }, ref) => {
    const { subtotal, vatAmount, total } = computeTotals(data.lineItems, data.vatRate, data.discountAmount);
    const title = docTypeLabels[data.docType];
    const isReceipt = data.docType === "receipt_voucher" || data.docType === "simple_receipt";

    return (
      <div
        ref={ref}
        dir="rtl"
        lang="ar"
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "48px 56px",
          background: "#ffffff",
          color: "#1f2937",
          fontFamily:
            "'IBM Plex Sans Arabic', 'Noto Naskh Arabic', -apple-system, system-ui, sans-serif",
          fontSize: "14px",
          lineHeight: 1.6,
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        {/* Decorative top stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(to right, #0b7a5a, #10b981, #0b7a5a)",
          }}
        />

        {/* Header: logo + title + invoice number */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
          <div style={{ flex: 1 }}>
            <img src="/logolight.png" alt="النخبة" style={{ height: "80px", marginBottom: "8px" }} />
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
              مؤسسة النخبة الأمثل للعقار
            </p>
            <p style={{ fontSize: "11px", color: "#6b7280", margin: "2px 0 0 0" }}>
              مرخص من شبكة إيجار • س.ت 4650258662
            </p>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                display: "inline-block",
                padding: "8px 20px",
                background: "#0b7a5a",
                color: "#ffffff",
                borderRadius: "12px",
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>رقم المستند</div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", direction: "ltr", textAlign: "left" }}>
              {data.invoiceNumber}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "6px" }}>التاريخ</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{data.issuedAt}</div>
          </div>
        </div>

        {/* Recipient card */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            background: "#f9fafb",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0b7a5a", marginBottom: "10px" }}>
            {isReceipt ? "استُلم من السيد / السيدة" : "صُرف إلى السيد / السيدة"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <Field label="الاسم" value={data.recipientName} />
            {data.recipientIdNumber && <Field label="رقم الهوية" value={data.recipientIdNumber} ltr />}
            {data.recipientPhone && <Field label="الجوال" value={data.recipientPhone} ltr />}
          </div>
        </div>

        {/* Payment method */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 16px" }}>
            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>طريقة الدفع</div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              {paymentLabels[data.paymentMethod] ?? data.paymentMethod}
            </div>
          </div>
          {data.paymentReference && (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px 16px" }}>
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>مرجع العملية</div>
              <div style={{ fontSize: "14px", fontWeight: 600, direction: "ltr", textAlign: "right" }}>
                {data.paymentReference}
              </div>
            </div>
          )}
        </div>

        {/* Line items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr style={{ background: "#0b7a5a", color: "#ffffff" }}>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 700, borderRadius: "12px 0 0 0" }}>#</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 700 }}>البيان</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700 }}>الكمية</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 700 }}>السعر</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 700, borderRadius: "0 12px 0 0" }}>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6b7280" }}>{idx + 1}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 500 }}>{item.description}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", textAlign: "center" }}>{item.qty}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", textAlign: "center" }}>
                  {item.price.toFixed(2)} ر.س
                </td>
                <td style={{ padding: "14px 16px", fontSize: "13px", textAlign: "left", fontWeight: 600 }}>
                  {(item.qty * item.price).toFixed(2)} ر.س
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <div style={{ width: "320px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px 20px" }}>
            <Row label="المجموع الفرعي" value={`${subtotal.toFixed(2)} ر.س`} />
            {data.discountAmount > 0 && (
              <Row label="الخصم" value={`- ${data.discountAmount.toFixed(2)} ر.س`} color="#dc2626" />
            )}
            {data.vatRate > 0 && (
              <Row label={`ضريبة القيمة المضافة (${data.vatRate}%)`} value={`${vatAmount.toFixed(2)} ر.س`} />
            )}
            <div style={{ height: "1px", background: "#e5e7eb", margin: "10px 0" }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "16px",
                fontWeight: 700,
                color: "#0b7a5a",
              }}
            >
              <span>الإجمالي</span>
              <span>{total.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: "12px",
            padding: "10px 16px",
            marginBottom: "20px",
            fontSize: "12px",
            color: "#065f46",
          }}
        >
          <span style={{ fontWeight: 700 }}>المبلغ كتابة: </span>
          {amountInWords(total)}
        </div>

        {/* Description + notes */}
        {(data.description || data.notes) && (
          <div style={{ marginBottom: "20px" }}>
            {data.description && (
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>الوصف</div>
                <div style={{ fontSize: "13px" }}>{data.description}</div>
              </div>
            )}
            {data.notes && (
              <div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>ملاحظات</div>
                <div style={{ fontSize: "13px" }}>{data.notes}</div>
              </div>
            )}
          </div>
        )}

        {/* Signatures + stamp */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
            marginTop: "50px",
            paddingTop: "20px",
            borderTop: "2px dashed #e5e7eb",
          }}
        >
          <SignatureBox label="توقيع المستلم" />
          <div style={{ position: "relative", textAlign: "center" }}>
            <img
              src="/stamp.png"
              alt="ختم"
              style={{ maxWidth: "140px", maxHeight: "140px", opacity: 0.92 }}
            />
          </div>
          <SignatureBox label={data.issuedByName ? `التوقيع: ${data.issuedByName}` : "توقيع المحرر"} />
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "56px",
            right: "56px",
            textAlign: "center",
            fontSize: "10px",
            color: "#9ca3af",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "10px",
          }}
        >
          النخبة • عقود إيجار إلكترونية موثقة • www.alnokbh.sa • 0563214000
        </div>
      </div>
    );
  }
);

VoucherTemplate.displayName = "VoucherTemplate";
export default VoucherTemplate;

function Field({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "2px" }}>{label}</div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#111827",
          direction: ltr ? "ltr" : "rtl",
          textAlign: "right",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", marginBottom: "6px" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600, color: color ?? "#111827" }}>{value}</span>
    </div>
  );
}

function SignatureBox({ label }: { label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ height: "60px", borderBottom: "1px solid #d1d5db", marginBottom: "6px" }} />
      <div style={{ fontSize: "11px", color: "#6b7280" }}>{label}</div>
    </div>
  );
}
