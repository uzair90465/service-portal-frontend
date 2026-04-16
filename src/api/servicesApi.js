import axiosInstance from './axiosInstance'

// GET all services
export const getAllServices = async () => {
  const res = await axiosInstance.get('/Service')
  // Handle wrapped responses
  if (Array.isArray(res.data)) return res.data
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data
  if (res.data?.value && Array.isArray(res.data.value)) return res.data.value
  return []
}

// GET service by ID
export const getServiceById = async (id) => {
  const res = await axiosInstance.get(`/Service/${id}`)
  if (res.data?.data) return res.data.data
  if (res.data?.value) return res.data.value
  return res.data
}

// POST create service
export const createService = async (serviceData) => {
  const res = await axiosInstance.post('/Service', serviceData)
  if (res.data?.data) return res.data.data
  if (res.data?.value) return res.data.value
  return res.data
}

export const updateService = async (id, data) => {
  const res = await axiosInstance.put(`/Service/${id}`, data)
  return res.data
}

export const deleteService = async (id) => {
  const res = await axiosInstance.delete(`/Service/${id}`)
  return res.data
}