import axiosInstance from './axiosInstance';

// GET all categories
export const getAllCategories = async () => {
  const res = await axiosInstance.get('/Categories');
  // Handle wrapped responses
  if (Array.isArray(res.data)) return res.data;
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data?.value && Array.isArray(res.data.value)) return res.data.value;
  return [];
};

// GET single category by id
export const getCategoryById = async (id) => {
  const res = await axiosInstance.get(`/Categories/${id}`);
  if (res.data?.data) return res.data.data;
  if (res.data?.value) return res.data.value;
  return res.data;
};

// POST create new category
export const createCategory = async (data) => {
  const res = await axiosInstance.post('/Categories', data);
  if (res.data?.data) return res.data.data;
  if (res.data?.value) return res.data.value;
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await axiosInstance.put(`/Categories/${id}`, data)
  return res.data
}

export const deleteCategory = async (id) => {
  const res = await axiosInstance.delete(`/Categories/${id}`)
  return res.data
}
