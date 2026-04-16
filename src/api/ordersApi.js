import axiosInstance from './axiosInstance'

export const getAllOrders = async () => {
  const res = await axiosInstance.get('/Orders')
  return res.data
}

export const getOrderById = async (id) => {
  const res = await axiosInstance.get(`/Orders/${id}`)
  return res.data
}

export const getOrdersByUser = async (userId) => {
  const res = await axiosInstance.get(`/Orders/user/${userId}`)
  return res.data
}

export const updateOrderStatus = async (id, status) => {
  const res = await axiosInstance.put(`/Orders/${id}/status?status=${status}`)
  return res.data
}

export const completeOrder = async (id) => {
  const res = await axiosInstance.post(`/Orders/${id}/complete`)
  return res.data
}

export const deleteOrder = async (id) => {
  const res = await axiosInstance.delete(`/Orders/${id}`)
  return res.data
}