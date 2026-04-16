import axiosInstance from './axiosInstance'

// GET all users
export const getAllUsers = async () => {
  const res = await axiosInstance.get('/Users')
  // Handle wrapped responses
  if (Array.isArray(res.data)) return res.data
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data
  if (res.data?.value && Array.isArray(res.data.value)) return res.data.value
  return []
}

// GET single user by id
export const getUserById = async (id) => {
  const res = await axiosInstance.get(`/Users/${id}`)
  if (res.data?.data) return res.data.data
  if (res.data?.value) return res.data.value
  return res.data
}

// POST create new user
// export const createUser = async (userData) => {
//   const res = await axiosInstance.post('/Users', userData)
//   return res.data
// }

export const createUser = async (userData) => {
  const res = await axiosInstance.post('/Users/register', userData)  // ← /register add karo
  if (res.data?.data) return res.data.data
  if (res.data?.value) return res.data.value
  return res.data
}

// PUT update existing user
export const updateUser = async (id, userData) => {
  const res = await axiosInstance.put(`/Users/${id}`, userData)
  if (res.data?.data) return res.data.data
  if (res.data?.value) return res.data.value
  return res.data
}

// DELETE remove user
export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/Users/${id}`)
  if (res.data?.data) return res.data.data
  if (res.data?.value) return res.data.value
  return res.data
}

