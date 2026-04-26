import { env } from "@/config/env";

export async function apiRequest<T>(
  endPoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${env.API_URL}${endPoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const fieldMessage = Array.isArray(data.details)
      ? data.details[0]?.message
      : undefined;

    throw new Error(fieldMessage || data.message || "Something went wrong");
  }

  return data;
}
