import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

class InventoryService {
  async getAllDataFromCloud() {
    try {
      const { data: p } = await supabase.from('products').select('*');
      const { data: u } = await supabase.from('units').select('*');
      const { data: w } = await supabase.from('warehouses').select('*');
      
      return {
        products: Array.isArray(p) ? p : [],
        units: Array.isArray(u) ? u : [],
        warehouses: Array.isArray(w) && w.length > 0 ? w : [{ id: 'wh-default', name: 'Kho Tổng', maxCapacity: 1000 }]
      };
    } catch (e) {
      return { products: [], units: [], warehouses: [] };
    }
  }

  // PHẢI CÓ HÀM NÀY: Nó giúp fix lỗi ".filter is not a function"
  async getUnits() {
    try {
      const { data } = await supabase.from('units').select('*');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  async getProducts() {
    try {
      const { data } = await supabase.from('products').select('*');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }
}

export const inventoryService = new InventoryService();