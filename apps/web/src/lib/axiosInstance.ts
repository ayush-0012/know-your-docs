import axios from "axios";

// Dynamically choose base URL depending on runtime environment
const baseURL =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_SERVER_URL_DEV || "http://localhost:3000"
    : process.env.NEXT_PUBLIC_SERVER_URL_PROD;

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
