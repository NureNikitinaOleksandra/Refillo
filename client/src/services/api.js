import axios from "axios";

// Створюємо базовий екземпляр Axios
export const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// Додаємо "перехоплювач" (interceptor)
// Він автоматично додаватиме JWT-токен до кожного запиту, якщо токен є в localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
