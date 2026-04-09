const IS_PROD = process.env.NODE_ENV === "production";
const DEV_URL = "http://localhost:5000";
const PROD_URL = "https://menu-os-backend.onrender.com";

export const API_BASE_URL = IS_PROD
  ? (process.env.NEXT_PUBLIC_API_URL?.includes("localhost") ? PROD_URL : process.env.NEXT_PUBLIC_API_URL || PROD_URL)
  : (process.env.NEXT_PUBLIC_API_URL || DEV_URL);

export const API_URL = `${API_BASE_URL}/api`;
export const AUTH_URL = `${API_BASE_URL}/auth`;
