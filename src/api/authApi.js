import axiosInstance from './axiosInstance'

export const becomeProvider = async (data) => {
  const res = await axiosInstance.post('/Auth/become-provider', data)
  return res.data
}