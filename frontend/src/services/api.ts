import axios from "axios";

const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Task {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  project?: string;
  context?: string;
  user: string;
  status: "inbox" | "next" | "waiting" | "scheduled" | "someday" | "done";
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  },

  async register(name: string, email: string, password: string) {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export const taskService = {
  async getTasks(status?: string) {
    const params = status ? { status } : undefined;
    const response = await api.get<Task[]>("/tasks", { params });
    return response.data;
  },

  async createTask(task: Partial<Task>) {
    const response = await api.post<Task>("/tasks", task);
    return response.data;
  },

  async updateTask(id: string, task: Partial<Task>) {
    const response = await api.patch<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  async deleteTask(id: string) {
    await api.delete(`/tasks/${id}`);
  },
};

export default api;
