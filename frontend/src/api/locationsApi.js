import axiosInstance from './axiosInstance'

export const getAllLocations = async () => {
  const res = await axiosInstance.get('/Locations')
  return res.data
}

export const createLocation = async (data) => {
  const res = await axiosInstance.post('/Locations', data)
  return res.data
}

export const updateLocation = async (id, data) => {
  const res = await axiosInstance.put(`/Locations/${id}`, data)
  return res.data
}

export const deleteLocation = async (id) => {
  const res = await axiosInstance.delete(`/Locations/${id}`)
  return res.data
}