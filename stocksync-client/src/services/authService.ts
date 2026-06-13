import { api } from "./api";

interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

/**
 * Sends user credentials to the backend authentication endpoint.
 */
export const login = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(
    "/Auth/login",
    credentials
  );

  return response.data;
};