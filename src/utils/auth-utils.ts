import API_ENDPOINTS from "@/config/endpoint-config";

// I have completely re-used something i wrote in spring boot..

interface CallbackResponse {
  token: string;
  email: string;
  id: string;
  avatar: string
}


export async function handleLoginCallback(code: string): Promise<CallbackResponse> {
  try {
    const res = await fetch(`${API_ENDPOINTS.CALLBACK}?code=${encodeURIComponent(code)}`, {
      method: 'GET',
      headers: {
      'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch callback data' }));
      throw new Error(err.message);
    }

    const data: CallbackResponse = await res.json();
    return data;
  } catch (error) {
    console.error("Login callback failed:", error);
    alert("Could not complete the login process. Please try again.");
    throw error;
  }
}

interface LoginUrlResponse {
  url: string;
}

export async function initiateLogin(): Promise<void> {
  try {
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to fetch login URL' }));
      throw new Error(err.message);
    }
    const data: LoginUrlResponse = await res.json();
    window.location.href = data.url;

  } catch (error) {
    console.error("Login initiation failed:", error);
    alert("Could not start the login process. Please try again.");
  }
}