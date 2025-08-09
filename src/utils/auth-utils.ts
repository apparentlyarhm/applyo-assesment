import API_ENDPOINTS from "@/config/endpoint-config";
import type { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

// I have completely re-used something i wrote in spring boot..

interface CallbackResponse {
  token: string;
  email: string;
  id: string;
  avatar: string
}

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
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

export function getUserIdFromRequest(req: NextApiRequest): string | null {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)


    // TODO: can be improved.
    const userId = JSON.parse(JSON.stringify(decoded))['sub'].replace('github|', '')
    return userId;

  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}