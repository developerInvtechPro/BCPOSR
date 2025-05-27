import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_BC_API_URL;
const COMPANY_ID = process.env.NEXT_PUBLIC_BC_COMPANY_ID;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v2.0/companies(${COMPANY_ID})`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  number: string;
  displayName: string;
  unitPrice: number;
  inventory: number;
}

export interface Customer {
  number: string;
  displayName: string;
  email: string;
  phoneNumber: string;
}

export interface SalesOrder {
  customerNumber: string;
  orderDate: string;
  items: {
    itemNumber: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export const businessCentralService = {
  // Productos
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get('/items');
    return response.data.value;
  },

  // Clientes
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data.value;
  },

  // Crear orden de venta
  createSalesOrder: async (order: SalesOrder) => {
    const response = await api.post('/salesOrders', order);
    return response.data;
  },

  // Obtener orden de venta
  getSalesOrder: async (orderId: string) => {
    const response = await api.get(`/salesOrders(${orderId})`);
    return response.data;
  },
}; 