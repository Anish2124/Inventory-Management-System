// Product types
export interface ChemicalProduct {
  id: number;
  product_name: string;
  cas_number: string;
  unit_of_measurement: 'KG' | 'MT' | 'Litre';
  current_stock_quantity?: number;
  created_at?: string;
  updated_at?: string;
}

// Inventory types
export interface InventoryItem {
  id: number;
  product_name: string;
  cas_number: string;
  unit_of_measurement: 'KG' | 'MT' | 'Litre';
  current_stock_quantity: number;
  last_updated?: string;
}

// Stock movement types
export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  cas_number?: string;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  created_at: string;
}

// Stock update request
export interface StockUpdateRequest {
  product_id: number;
  movement_type: 'IN' | 'OUT';
  quantity: number;
}

// Stock update response
export interface StockUpdateResponse {
  message: string;
  product_id: number;
  movement_type: 'IN' | 'OUT';
  quantity: number;
  previous_stock: number;
  new_stock: number;
}

// Form data types
export interface ProductFormData {
  product_name: string;
  cas_number: string;
  unit_of_measurement: 'KG' | 'MT' | 'Litre';
}

