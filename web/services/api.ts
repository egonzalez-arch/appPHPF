import axios from "../lib/axios"; 

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Para enviar cookies
})

// Interceptores globales
api.interceptors.response.use(
  resp => resp,
  err => {
    if (err.response?.status === 401) {
      window.location.href = '/login'
    }
    if (err.response?.status === 403) {
      window.location.href = '/forbidden'
    }
    return Promise.reject(err)
  }
)

export async function fetchPatients() {
  const res = await axios.get("/patients"); // URL relativa, baseURL ya definida
  return res.data; // Ajusta según el shape de tu API
}