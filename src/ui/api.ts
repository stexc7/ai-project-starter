/** Cliente HTTP mínimo. Propaga el mensaje del servidor tal cual: ya viene en español. */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : 'No se ha podido conectar. Revisa la conexión.';
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function post<T>(url: string, body: unknown, init: RequestInit = {}): Promise<T> {
  return request<T>(url, { ...init, method: 'POST', body: JSON.stringify(body) });
}
