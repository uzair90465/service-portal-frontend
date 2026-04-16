import axiosInstance from './axiosInstance'

export const createOffer = async (data) => {
  const res = await axiosInstance.post('/RequestOffer', data)
  return res.data
}

export const getOffersByRequest = async (requestId) => {
  const res = await axiosInstance.get(`/RequestOffer/request/${requestId}`)
  return res.data
}

export const acceptOffer = async (offerId) => {
  const res = await axiosInstance.post(`/RequestOffer/accept/${offerId}`)
  return res.data
}

export const rejectOffer = async (offerId) => {
  const res = await axiosInstance.post(`/RequestOffer/reject/${offerId}`)
  return res.data
}

export const getAllOffers = async () => {
  const res = await axiosInstance.get('/RequestOffer')
  return res.data
}

export const updateOffer = async (id, data) => {
  const res = await axiosInstance.put(`/RequestOffer/${id}`, data)
  return res.data
}

export const deleteOffer = async (id) => {
  const res = await axiosInstance.delete(`/RequestOffer/${id}`)
  return res.data
}