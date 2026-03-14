const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

/** Map status codes to user-friendly fallback messages. */
const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Session expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "The requested resource was not found.",
  409: "This conflicts with an existing resource.",
  422: "Please check your input and try again.",
  429: "Too many requests. Please wait a moment.",
  500: "Something went wrong on our end. Please try again.",
  502: "Service temporarily unavailable. Please try again.",
  503: "Service temporarily unavailable. Please try again.",
};

function friendlyMessage(status: number, body: Record<string, unknown>): string {
  if (typeof body.detail === "string" && body.detail.length > 0) {
    return body.detail;
  }
  // FastAPI validation errors come as an array
  if (Array.isArray(body.detail) && body.detail.length > 0) {
    const first = body.detail[0];
    if (typeof first?.msg === "string") return first.msg;
  }
  return STATUS_MESSAGES[status] || "Request failed. Please try again.";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Token refresh on 401
  if (res.status === 401 && token) {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refresh_token")
        : null;
    if (refreshToken) {
      const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        headers["Authorization"] = `Bearer ${data.access_token}`;
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        throw new ApiError(401, "Session expired", "SESSION_EXPIRED");
      }
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      friendlyMessage(res.status, body),
      typeof body.code === "string" ? body.code : undefined,
    );
  }

  return res.json();
}

export const api = {
  get<T>(path: string): Promise<T> {
    return request<T>(path, { method: "GET" });
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(path: string): Promise<{ message: string }> {
    return request(path, { method: "DELETE" });
  },
};

export { ApiError };
