import axiosInstance from './axiosInstance'

export const createReview = async (data) => {
  const res = await axiosInstance.post('/Reviews', data)
  return res.data
}

export const getReviewByOrder = async (orderId) => {
  const res = await axiosInstance.get(`/Reviews/order/${orderId}`)
  return res.data
}

export const getAllReviews = async () => {
  const res = await axiosInstance.get('/Reviews')
  return res.data
}

export const updateReview = async (orderId, data) => {
  const res = await axiosInstance.put(`/Reviews/${orderId}`, data)
  return res.data
}

export const deleteReview = async (orderId) => {
  const res = await axiosInstance.delete(`/Reviews/${orderId}`)
  return res.data
}