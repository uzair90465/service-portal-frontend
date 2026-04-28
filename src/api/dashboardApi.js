import axiosInstance from './axiosInstance'

export const getDashboardStats = async () => {
  try {
    const [users, services, requests, orders, reviews, providers, locations, categories] = 
      await Promise.allSettled([
        axiosInstance.get('/Users'),
        axiosInstance.get('/Service'),
        axiosInstance.get('/ServiceRequest'),
        axiosInstance.get('/Orders'),
        axiosInstance.get('/Reviews'),
        axiosInstance.get('/Provider'),
        axiosInstance.get('/Locations'),
        axiosInstance.get('/Categories'),
      ])

    return {
      users:      users.status === 'fulfilled'      ? users.value.data?.length      : 0,
      services:   services.status === 'fulfilled'   ? services.value.data?.length   : 0,
      requests:   requests.status === 'fulfilled'   ? requests.value.data?.length   : 0,
      orders:     orders.status === 'fulfilled'     ? orders.value.data?.length     : 0,
      reviews:    reviews.status === 'fulfilled'    ? reviews.value.data?.length    : 0,
      providers:  providers.status === 'fulfilled'  ? providers.value.data?.length  : 0,
      locations:  locations.status === 'fulfilled'  ? locations.value.data?.length  : 0,
      categories: categories.status === 'fulfilled' ? categories.value.data?.length : 0,
    }
  } catch (err) {
    console.error('Dashboard error:', err)
    return { users: 0, services: 0, requests: 0, orders: 0, reviews: 0, providers: 0, locations: 0, categories: 0 }
  }
}

export const getProviderDashboardStats = async (providerId) => {
  try {
    const [requests, orders] = await Promise.allSettled([
      axiosInstance.get(`/ServiceRequest/provider/${providerId}`),
      axiosInstance.get(`/Orders/provider/${providerId}`),
    ])

    return {
      requests: requests.status === 'fulfilled' ? requests.value.data?.length : 0,
      orders:   orders.status === 'fulfilled'   ? orders.value.data?.length   : 0,
    }
  } catch (err) {
    console.error('Provider dashboard error:', err)
    return { requests: 0, orders: 0 }
  }
}

export const getUserDashboardStats = async (userId) => {
  try {
    const [requests, orders] = await Promise.allSettled([
      axiosInstance.get(`/ServiceRequest/user/${userId}`),
      axiosInstance.get(`/Orders/user/${userId}`),
    ])

    return {
      requests: requests.status === 'fulfilled' ? requests.value.data?.length : 0,
      orders:   orders.status === 'fulfilled'   ? orders.value.data?.length   : 0,
      reviews:  0,
    }
  } catch (err) {
    console.error('User dashboard error:', err)
    return { requests: 0, orders: 0, reviews: 0 }
  }
}