import axios, { AxiosResponse } from 'axios';
import {
  ChemicalProduct,
  InventoryItem,
  StockMovement,
  StockUpdateRequest,
  StockUpdateResponse,
} from '../types';

// Base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Products API - Handle all product-related API calls
 */
export const productsAPI = {
  // Get all products
  getAll: (): Promise<AxiosResponse<ChemicalProduct[]>> => 
    api.get('/products'),
  
  // Get a single product by ID
  getById: (id: number): Promise<AxiosResponse<ChemicalProduct>> => 
    api.get(`/products/${id}`),
  
  // Create a new product
  create: (data: Omit<ChemicalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<AxiosResponse<ChemicalProduct>> =>
    api.post('/products', data),
  
  // Update an existing product
  update: (id: number, data: Omit<ChemicalProduct, 'id' | 'created_at' | 'updated_at'>): Promise<AxiosResponse<ChemicalProduct>> =>
    api.put(`/products/${id}`, data),
  
  // Delete a product
  delete: (id: number): Promise<AxiosResponse<{ message: string }>> => 
    api.delete(`/products/${id}`),
  
  // Search products by name or CAS number
  search: (query: string): Promise<AxiosResponse<ChemicalProduct[]>> => 
    api.get(`/products/search/${query}`),
};

/**
 * Inventory API - Handle all inventory-related API calls
 */
export const inventoryAPI = {
  // Get all inventory items
  getAll: (): Promise<AxiosResponse<InventoryItem[]>> => 
    api.get('/inventory'),
  
  // Get inventory for a specific product
  getByProductId: (productId: number): Promise<AxiosResponse<InventoryItem>> =>
    api.get(`/inventory/product/${productId}`),
  
  // Update stock (IN or OUT)
  updateStock: (data: StockUpdateRequest): Promise<AxiosResponse<StockUpdateResponse>> =>
    api.post('/inventory/update-stock', data),
  
  // Get stock movement history for a specific product
  getHistory: (productId: number): Promise<AxiosResponse<StockMovement[]>> =>
    api.get(`/inventory/history/${productId}`),
  
  // Get all stock movements (recent)
  getAllHistory: (): Promise<AxiosResponse<StockMovement[]>> => 
    api.get('/inventory/history'),
};

export default api;
