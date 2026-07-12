import { BACKEND_URL } from "@/data/data"

const TOKEN_KEY = "transitops_token"
const ROLE_KEY = "transitops_role"
const EMAIL_KEY = "transitops_email"

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredRole(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ROLE_KEY)
}

export function getStoredEmail(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(EMAIL_KEY)
}

export function setAuthSession(token: string, role: string, email: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ROLE_KEY, role)
  localStorage.setItem(EMAIL_KEY, email)
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export class ApiError extends Error {
  status: number
  detail: string
  constructor(status: number, detail: string) {
    super(detail)
    this.status = status
    this.detail = detail
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  form?: boolean
  auth?: boolean
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, form = false, auth = true } = options
  const headers: Record<string, string> = {}

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body !== undefined) {
    if (form) {
      headers["Content-Type"] = "application/x-www-form-urlencoded"
      payload = body as string
    } else {
      headers["Content-Type"] = "application/json"
      payload = JSON.stringify(body)
    }
  }

  // path should start with /fleet/... etc; BACKEND_URL already ends with /api
  const url = path.startsWith("http") ? path : `${BACKEND_URL}${path.startsWith("/") ? "" : "/"}${path}`

  const response = await fetch(url, { method, headers, body: payload })

  if (response.status === 401 && auth) {
    clearAuthSession()
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login"
    }
    throw new ApiError(401, "Unauthorized — please sign in again")
  }

  if (!response.ok) {
    let detail = `Request failed (${response.status})`
    try {
      const data = await response.json()
      detail =
        typeof data.detail === "string"
          ? data.detail
          : JSON.stringify(data.detail)
    } catch {
      // ignore
    }
    throw new ApiError(response.status, detail)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export async function loginRequest(email: string, password: string) {
  const form = new URLSearchParams()
  form.set("username", email)
  form.set("password", password)
  return apiRequest<{
    access_token: string
    token_type: string
    role: string
  }>("/auth/login", {
    method: "POST",
    body: form.toString(),
    form: true,
    auth: false,
  })
}
