import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

class InventoryService {
  // Hàm lấy mọi thứ cho Inventory.tsx
  async getAllDataFromCloud() {
    const { data: p } = await supabase.from('products').select('*');
    const { data: u } = await supabase.from('units').select('*');
    const { data: w } = await supabase.from('warehouses').select('*');
    const { data: t } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    return { 
      products: p || [], units: u || [], transactions: t || [],
      warehouses: w && w.length > 0 ? w : [{ id: 'wh-default', name: 'Kho Tổng', maxCapacity: 1000 }] 
    };
  }

  // --- CÁC HÀM PHỤ TRỢ ĐỂ FIX LỖI "is not a function" ---
  async getProducts() {
    const { data } = await supabase.from('products').select('*');
    return data || [];
  }

  async getUnits() {
    const { data } = await supabase.from('units').select('*');
    return data || [];
  }

  async getWarehouses() {
    const { data } = await supabase.from('warehouses').select('*');
    return data || [];
  }

  async getTransactions() {
    const { data } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    return data || [];
  }

  // Hàm nhập kho (Import)
  async importUnits(productId: string, serials: string[], initialLocation: string) {
    const finalUnits = serials.map(s => ({
      serialNumber: s, productId, status: 'NEW',
      warehouseLocation: initialLocation,
      importDate: new Date().toISOString()
    }));
    await supabase.from('units').upsert(finalUnits);
  }

  getDrafts() {
    const saved = localStorage.getItem('RO_MASTER_DRAFTS_V3');
    return saved ? JSON.parse(saved) : { inbound: [], outbound: [], productionCheck: [] };
  }

  saveDraft(key: string, list: string[]) {
    const drafts = this.getDrafts();
    drafts[key] = list;
    localStorage.setItem('RO_MASTER_DRAFTS_V3', JSON.stringify(drafts));
  }
}

export const inventoryService = new InventoryService();