import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

class InventoryService {
  async getUnits() {
    try {
      const { data } = await supabase.from('units').select('*');
      // Ép dữ liệu về mảng rỗng [] nếu lỗi, giúp web hiện giao diện thay vì trắng xóa
      return Array.isArray(data) ? data : []; 
    } catch (e) { return []; }
  }
  async getProducts() {
    try {
      const { data } = await supabase.from('products').select('*');
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }
}
export const inventoryService = new InventoryService();
