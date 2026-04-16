import axiosInstance from './axiosInstance'

export const sendMessage = async (data) => {
  const res = await axiosInstance.post('/Messages', data)
  return res.data
}

export const getChatByRequest = async (requestId) => {
  const res = await axiosInstance.get(`/Messages/request/${requestId}`)
  return res.data
}

export const getUserMessages = async (userId) => {
  const res = await axiosInstance.get(`/Messages/user/${userId}`)
  return res.data
}

export const getAllMessages = async () => {
  const res = await axiosInstance.get('/Messages')
  return res.data
}

export const updateMessage = async (id, data) => {
  const res = await axiosInstance.put(`/Messages/${id}`, data)
  return res.data
}

export const deleteMessage = async (id) => {
  const res = await axiosInstance.delete(`/Messages/${id}`)
  return res.data
}