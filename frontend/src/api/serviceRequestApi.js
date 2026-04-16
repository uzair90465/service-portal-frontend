// import axiosInstance from './axiosInstance'

// export const createRequest = async (data) => {
//   const res = await axiosInstance.post('/ServiceRequest', data)
//   return res.data
// }

// export const getRequestsByUser = async (userId) => {
//   const res = await axiosInstance.get(`/ServiceRequest/user/${userId}`)
//   return res.data
// }

// export const getRequestsForProvider = async (providerId) => {
//   const res = await axiosInstance.get(`/ServiceRequest/provider/${providerId}`)
//   return res.data
// }

// export const updateRequestStatus = async (id, status) => {
//   const res = await axiosInstance.put(`/ServiceRequest/${id}/status?status=${status}`)
//   return res.data
// }

import axiosInstance from './axiosInstance'

export const getAllRequests = async () => {
  const res = await axiosInstance.get('/ServiceRequest')
  return res.data
}

export const createRequest = async (data) => {
  const res = await axiosInstance.post('/ServiceRequest', data)
  return res.data
}

export const getRequestsByUser = async (userId) => {
  const res = await axiosInstance.get(`/ServiceRequest/user/${userId}`)
  return res.data
}

export const getRequestsForProvider = async (providerId) => {
  const res = await axiosInstance.get(`/ServiceRequest/provider/${providerId}`)
  return res.data
}

export const updateRequestStatus = async (id, status) => {
  const res = await axiosInstance.put(`/ServiceRequest/${id}/status?status=${status}`)
  return res.data
}

export const updateServiceRequest = async (id, data) => {
  const res = await axiosInstance.put(`/ServiceRequest/${id}`, data)
  return res.data
}

export const deleteServiceRequest = async (id) => {
  const res = await axiosInstance.delete(`/ServiceRequest/${id}`)
  return res.data
}