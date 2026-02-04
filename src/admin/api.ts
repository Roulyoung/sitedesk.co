const API_BASE = (import.meta.env.VITE_ADMIN_API_BASE || "").replace(/\/$/, "");
const ADMIN_PREFIX = `${API_BASE}/admin`;
export const SESSION_KEY = "session_token";

const authHeaders = (token?: string) => {
  const value = token || (typeof localStorage !== "undefined" ? localStorage.getItem(SESSION_KEY) : "");
  return value ? { Authorization: `Bearer ${value}` } : {};
};

const handleResponse = async (res: Response) => {
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // ignore
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || text || "Request failed";
    throw new Error(msg);
  }
  return data;
};

export async function login(password: string) {
  const res = await fetch(`${ADMIN_PREFIX}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await handleResponse(res);
  const token = data?.token;
  if (token && typeof localStorage !== "undefined") {
    localStorage.setItem(SESSION_KEY, token);
  }
  return token as string;
}

export async function fetchProducts(token?: string) {
  const res = await fetch(`${ADMIN_PREFIX}/products`, {
    headers: { ...authHeaders(token) },
  });
  return handleResponse(res);
}

export async function createProduct(values: Record<string, string>, token?: string) {
  const res = await fetch(`${ADMIN_PREFIX}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ values }),
  });
  return handleResponse(res);
}

export async function updateProduct(rowNumber: number, values: Record<string, string>, token?: string) {
  const res = await fetch(`${ADMIN_PREFIX}/products/${rowNumber}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(values),
  });
  return handleResponse(res);
}

export async function archiveProduct(rowNumber: number, token?: string) {
  const res = await fetch(`${ADMIN_PREFIX}/products/${rowNumber}/archive`, {
    method: "POST",
    headers: { ...authHeaders(token) },
  });
  return handleResponse(res);
}

export async function uploadImage({
  file,
  rowNumber,
  column,
  token,
}: {
  file: File;
  rowNumber?: number;
  column?: string;
  token?: string;
}) {
  const form = new FormData();
  form.append("file", file);
  if (rowNumber) form.append("rowNumber", String(rowNumber));
  if (column) form.append("column", column);

  const res = await fetch(`${ADMIN_PREFIX}/images/upload`, {
    method: "POST",
    headers: { ...authHeaders(token) },
    body: form,
  });
  return handleResponse(res);
}

export function clearSession() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}
