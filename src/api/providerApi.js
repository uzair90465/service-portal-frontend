import axiosInstance from './axiosInstance'

export const createProfile = async (data) => {
  const res = await axiosInstance.post('/Provider/create-profile', data)
  return res.data
}

export const assignService = async (data) => {
  const res = await axiosInstance.post('/Provider/assign-services', data)
  return res.data
}

export const assignLocation = async (data) => {
  const res = await axiosInstance.post('/Provider/assign-locations', data)
  return res.data
}

export const getProvider = async (userId) => {
  const res = await axiosInstance.get(`/Provider/${userId}`)
  return res.data
}

export const getAllProviders = async () => {
  const res = await axiosInstance.get('/Provider')
  return res.data
}

export const updateProfile = async (userId, data) => {
  const res = await axiosInstance.put(`/Provider/${userId}`, data)
  return res.data
}

export const deleteProfile = async (userId) => {
  const res = await axiosInstance.delete(`/Provider/${userId}`)
  return res.data
}

export const removeService = async (providerId, serviceId) => {
  const res = await axiosInstance.delete(`/Provider/remove-service/${providerId}/${serviceId}`)
  return res.data
}

export const removeLocation = async (providerId, locationId) => {
  const res = await axiosInstance.delete(`/Provider/remove-location/${providerId}/${locationId}`)
  return res.data
}