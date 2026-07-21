import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API, timeout: 60000 });

export const api = {
  stats: () => client.get("/dashboard/stats").then(r => r.data),
  suggestions: () => client.get("/suggestions").then(r => r.data),
  activities: (limit = 20) => client.get(`/activities?limit=${limit}`).then(r => r.data),
  products: () => client.get("/products").then(r => r.data),
  product: (id) => client.get(`/products/${id}`).then(r => r.data),
  createProduct: (body) => client.post("/products", body).then(r => r.data),
  updateProduct: (id, body) => client.put(`/products/${id}`, body).then(r => r.data),
  deleteProduct: (id) => client.delete(`/products/${id}`).then(r => r.data),
  orders: () => client.get("/orders").then(r => r.data),
  updateOrderStatus: (id, status) => client.put(`/orders/${id}/status?status=${status}`).then(r => r.data),
  createInvoice: (body) => client.post("/billing/invoice", body).then(r => r.data),
  customers: () => client.get("/customers").then(r => r.data),
  analytics: () => client.get("/analytics").then(r => r.data),
  command: (text) => client.post("/ai/command", { text }).then(r => r.data),
  analyzeProduct: (image_base64, remove_bg = true, voice_context = "", language = "en-IN") =>
    client.post("/ai/analyze-product", { image_base64, remove_bg, voice_context, language }).then(r => r.data),
  generateContent: (product_id, kind) =>
    client.post("/ai/generate-content", { product_id, kind }).then(r => r.data),
  seed: () => client.post("/seed").then(r => r.data),
};
