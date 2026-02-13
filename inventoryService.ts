import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kiểm tra nếu thiếu mã kết nối
if (!supabaseUrl || !supabaseKey) {
  console.error("THIẾU MÃ KẾT NỐI SUPABASE! Hãy kiểm tra Environment Variables trên Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

class InventoryService {
  async getAllDataFromCloud() {
    try {
      const [p, u, t, w] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('units').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('warehouses').select('*')
      ]);

      return {
        products: p.data || [],
        units: u.data || [],
        transactions: t.data || [],
        warehouses: w.data && w.data.length > 0 ? w.data : [{ id: 'wh-default', name: 'Kho Tổng', maxCapacity: 1000 }]
      };
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      return { products: [], units: [], transactions: [], warehouses: [] };
    }
  }

  // Các hàm bổ trợ bắt buộc phải trả về mảng [] nếu lỗi
  async getProducts() {
    const { data } = await supabase.from('products').select('*');
    return Array.isArray(data) ? data : [];
  }

  async getUnits() {
    const { data } = await supabase.from('units').select('*');
    return Array.isArray(data) ? data : [];
  }

  async getWarehouses() {
    const { data } = await supabase.from('warehouses').select('*');
    return Array.isArray(data) ? data : [];
  }
}

export const inventoryService = new InventoryService();