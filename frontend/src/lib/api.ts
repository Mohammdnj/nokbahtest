// Defaults to relative "/api" so frontend + backend can live on the same domain.
// Override via NEXT_PUBLIC_API_URL at build time for split deployments.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

async function parseResponse(res: Response) {
  const text = await res.text();
  const ctype = res.headers.get("content-type") ?? "";

  // If the server handed us JSON, parse it. Otherwise surface a clear error.
  if (ctype.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("تعذّر قراءة استجابة الخادم (JSON غير صالح)");
    }
  }

  // We got HTML (404 page, 503, PHP error page, etc.).
  // Give a readable Arabic error instead of "Unexpected token '<'".
  if (res.status === 404) {
    throw new Error("الخدمة غير متوفرة حالياً (404). تحقّق من رفع الخادم.");
  }
  if (res.status === 503) {
    throw new Error("الخادم مشغول حالياً. حاول مرة ثانية بعد دقيقة.");
  }
  if (res.status >= 500) {
    throw new Error("حدث خطأ في الخادم. نعتذر، جاري العمل على إصلاحه.");
  }
  throw new Error(`استجابة غير متوقعة من الخادم (${res.status})`);
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new Error("تعذّر الاتصال بالخادم. تحقّق من اتصال الإنترنت.");
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(data.error || data.message || "حدث خطأ غير متوقع");
  }

  return data;
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: unknown) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: unknown) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),

  upload: async (file: File) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await parseResponse(res);
    if (!res.ok) throw new Error(data.error || "فشل رفع الملف");
    return data;
  },
};
