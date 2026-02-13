import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Khởi tạo client với giá trị mặc định nếu thiếu biến môi trường
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

class InventoryService {
  // Hàm lấy dữ liệu tổng hợp
  async getAllDataFromCloud() {
    try {
      const [p, u, w] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('units').select('*'),
        supabase.from('warehouses').select('*')
      ]);
      
      return {
        products: Array.isArray(p.data) ? p.data : [],
        units: Array.isArray(u.data) ? u.data : [],
        warehouses: Array.isArray(w.data) && w.data.length > 0 ? w.data : [{ id: 'wh-default', name: 'Kho Tổng', maxCapacity: 1000 }]
      };
    } catch (e) {
      console.error("Supabase Error:", e);
      return { products: [], units: [], warehouses: [] };
    }
  }

  // Cực kỳ quan trọng: Hàm này đang làm sập trang web của bạn
  async getUnits() {
    try {
      const { data } = await supabase.from('units').select('*');
      return Array.isArray(data) ? data : []; // Luôn trả về mảng
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

  getDrafts() {
    const saved = localStorage.getItem('RO_MASTER_DRAFTS_V3');
    return saved ? JSON.parse(saved) : { inbound: [], outbound: [], productionCheck: [] };
  }
}

export const inventoryService = new InventoryService();