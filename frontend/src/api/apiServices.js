import axiosClient from './axiosClient';

export const authApi = {
  login: (email, password) => axiosClient.post('/auth/login', { email, password }),
  register: (fullName, email, password, phone) => axiosClient.post('/auth/register', { fullName, email, password, phone }),
  getCurrentUser: () => axiosClient.get('/auth/me'),
};

export const catalogApi = {
  getCategories: () => axiosClient.get('/categories'),
  getCategoryBySlug: (slug) => axiosClient.get(`/categories/${slug}`),
  getProducts: (params) => axiosClient.get('/products', { params }),
  getProductById: (id) => axiosClient.get(`/products/${id}`),
  getProductBySlug: (slug) => axiosClient.get(`/products/slug/${slug}`),
  getRelatedProducts: (id, limit = 4) => axiosClient.get(`/products/${id}/related`, { params: { limit } }),
};

export const cartApi = {
  getCart: () => axiosClient.get('/cart'),
  addToCart: (productId, quantity = 1) => axiosClient.post('/cart/items', { productId, quantity }),
  updateQuantity: (itemId, quantity) => axiosClient.put(`/cart/items/${itemId}`, null, { params: { quantity } }),
  removeFromCart: (itemId) => axiosClient.delete(`/cart/items/${itemId}`),
  clearCart: () => axiosClient.delete('/cart/items'),
};

export const wishlistApi = {
  getWishlist: () => axiosClient.get('/wishlist'),
  addToWishlist: (productId) => axiosClient.post(`/wishlist/items/${productId}`),
  removeFromWishlist: (productId) => axiosClient.delete(`/wishlist/items/${productId}`),
  moveToCart: (productId) => axiosClient.post(`/wishlist/items/${productId}/move-to-cart`),
};

export const addressApi = {
  getAddresses: () => axiosClient.get('/addresses'),
  addAddress: (addressData) => axiosClient.post('/addresses', addressData),
  updateAddress: (id, addressData) => axiosClient.put(`/addresses/${id}`, addressData),
  deleteAddress: (id) => axiosClient.delete(`/addresses/${id}`),
  setDefault: (id) => axiosClient.patch(`/addresses/${id}/default`),
};

export const orderApi = {
  createOrder: (orderData) => axiosClient.post('/orders', orderData),
  getMyOrders: (page = 0, size = 10) => axiosClient.get('/orders/my', { params: { page, size } }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  cancelOrder: (id) => axiosClient.post(`/orders/${id}/cancel`),
};

export const reviewApi = {
  getProductReviews: (productId) => axiosClient.get(`/reviews/product/${productId}`),
  submitReview: (reviewData) => axiosClient.post('/reviews', reviewData),
};

export const adminApi = {
  getDashboardStats: () => axiosClient.get('/admin/dashboard'),
  getProducts: (page = 0, size = 15) => axiosClient.get('/admin/products', { params: { page, size } }),
  createProduct: (data) => axiosClient.post('/admin/products', data),
  updateProduct: (id, data) => axiosClient.put(`/admin/products/${id}`, data),
  updateStock: (id, stock) => axiosClient.patch(`/admin/products/${id}/stock`, null, { params: { stock } }),
  deleteProduct: (id) => axiosClient.delete(`/admin/products/${id}`),
  getCategories: () => axiosClient.get('/admin/categories'),
  createCategory: (data) => axiosClient.post('/admin/categories', data),
  updateCategory: (id, data) => axiosClient.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => axiosClient.delete(`/admin/categories/${id}`),
  getOrders: (page = 0, size = 15) => axiosClient.get('/admin/orders', { params: { page, size } }),
  updateOrderStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status`, null, { params: { status } }),
  getCustomers: () => axiosClient.get('/admin/customers'),
};

export const aiApi = {
  chat: (message, sessionId = null) => axiosClient.post('/ai/chat', { message, sessionId }),
  getSessions: () => axiosClient.get('/ai/sessions'),
  getSessionMessages: (sessionId) => axiosClient.get(`/ai/sessions/${sessionId}/messages`),
};
