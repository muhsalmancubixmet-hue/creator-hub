import { apiClient } from "./api-client";



export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user?: {
    id: string;
    email: string;
    role: string;
    profile_id: string | null;
  };
}

export const authService = {
  async login(credentials: LoginPayload): Promise<AuthTokens> {
    const response = await apiClient.post<AuthTokens>("/auth/token/", {
      ...credentials,
      portal: "creator",
    });
    const { access, refresh } = response.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    return response.data;
  },

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("influencers.creator-session");
    window.location.href = "/login";
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem("access_token"));
  },
};