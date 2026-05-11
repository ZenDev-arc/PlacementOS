const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // In a real app, you'd get the Clerk token here
  // const { getToken } = useAuth();
  // const token = await getToken();
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}

export const onboardingApi = {
  submit: (data: any, options: RequestInit = {}) => fetchWithAuth("/onboarding/", {
    ...options,
    method: "POST",
    body: JSON.stringify(data),
  }),
  getStatus: (options: RequestInit = {}) => fetchWithAuth("/onboarding/status", options),
};
