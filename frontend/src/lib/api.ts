const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function createRejectedPromise(message: string) {
  const rejectedPromise = Promise.reject(new Error(message));
  rejectedPromise.catch(() => undefined);
  return rejectedPromise;
}

async function request<T>(path: string, options: RequestInit = {}, method: string = "GET") {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method,
    headers,
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Not authenticated"
        : typeof payload === "object" && payload && "message" in payload
          ? String((payload as { message?: string }).message)
          : "Request failed";

    if (response.status === 401 && typeof window !== "undefined") {
      window.location.replace("/login");
    }

    return createRejectedPromise(message) as Promise<T>;
  }

  return payload as T;
}

export async function apiGet<T>(path: string) {
  return request<T>(path, {}, "GET");
}

export async function apiPost<T>(path: string, body: unknown) {
  return request<T>(path, { body: JSON.stringify(body) }, "POST");
}

export async function apiPut<T>(path: string, body: unknown) {
  return request<T>(path, { body: JSON.stringify(body) }, "PUT");
}

export async function apiDelete<T>(path: string) {
  return request<T>(path, {}, "DELETE");
}
