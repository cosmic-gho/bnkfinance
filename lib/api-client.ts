import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://www.greenroot.live/"

console.log("API URL:", API_URL)

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request logging
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data)
    return config
  },
  (error) => {
    console.error("API Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data)
    return response
  },
  (error) => {
    console.log("API Response Error:", error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export default apiClient
