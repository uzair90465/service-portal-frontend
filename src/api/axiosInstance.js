import axios from 'axios'

const axiosInstance = axios.create({
  // Change this from localhost to your Render URL
  baseURL: 'https://service-portal-backend-u0qf.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default axiosInstance