import { createClient } from '@supabase/supabase-js';
import { Product, SerialUnit, UnitStatus, Transaction, Warehouse, Customer, ProductionPlan, SalesOrder } from './types';

// 1. Kết nối với Cloud (Vercel sẽ đọc từ Environment Variables)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

class InventoryService {
  // 2. Lấy toàn bộ dữ liệu từ Cloud
  async getAllDataFromCloud() {
    try {
      const [p, u, t, w, c, pp, so] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('units').select('*'),
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('warehouses').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('production_plans').select('*'),
        supabase.from('sales_orders').select('*')
      ]);

      return {
        products: p.data || [],
        units: u.data || [],
        transactions: t.data || [],
        // Đảm bảo luôn có ít nhất 1 kho mặc định nếu cloud trống
        warehouses: (w.data && w.data.length > 0) ? w.data : [{ id: 'wh-default', name: 'Kho Tổng', maxCapacity: 1000 }],
        customers: c.data || [],
        productionPlans: pp.data || [],
        salesOrders: so.data || []
      };
    } catch (error) {
      console.error("Lỗi lấy dữ liệu Cloud:", error);
      throw error;
    }
  }

  // 3. HÀM NHẬP KHO (Xử lý thông minh cho nhiều máy)
  async importUnits(productId: string, serials: string[], initialLocation: string, planName?: string) {
    // Lấy trạng thái kho mới nhất trước khi nhập
    const { data: allUnits } = await supabase.from('units').select('*');
    const { data: allWhs } = await supabase.from('warehouses').select('*');
    
    let remainingSerials = [...serials];
    let whIdx = allWhs?.findIndex(w => w.name === initialLocation) ?? 0;
    if (whIdx === -1) whIdx = 0;

    const finalUnits: any[] = [];
    const finalTransactions: any[] = [];

    while (remainingSerials.length > 0 && whIdx < (allWhs?.length ?? 0)) {
      const currentWh = allWhs![whIdx];
      const currentStock = allUnits?.filter(u => u.warehouseLocation === currentWh.name && u.status === 'NEW').length ?? 0;
      const spaceLeft = Math.max(0, (currentWh.maxCapacity || 999999) - currentStock);

      if (spaceLeft > 0) {
        const canTake = remainingSerials.slice(0, spaceLeft);
        
        canTake.forEach(s => {
          const existing = allUnits?.find(u => u.serialNumber === s);
          // Kiểm tra trùng mã IMEI
          if (existing && existing.status === 'NEW') {
             console.warn(`Mã ${s} đã tồn tại trong kho, bỏ qua.`);
             return;
          }
          
          finalUnits.push({
            serialNumber: s,
            productId,
            status: 'NEW',
            warehouseLocation: currentWh.name,
            importDate: new Date().toISOString(),
            isReimported: existing?.status === 'SOLD'
          });
        });

        if (canTake.length > 0) {
            finalTransactions.push({
              id: `tx-in-${Date.now()}-${currentWh.name}-${Math.random().toString(36).substr(2, 5)}`,
              type: 'INBOUND',
              date: new Date().toISOString(),
              productId,
              quantity: canTake.length,
              serialNumbers: canTake,
              toLocation: currentWh.name,
              planName
            });
        }

        remainingSerials = remainingSerials.slice(spaceLeft);
      }
      whIdx++;
    }

    // Đẩy dữ liệu lên Cloud (sử dụng upsert để cập nhật nếu đã tồn tại)
    if (finalUnits.length > 0) {
        const { error: unitError } = await supabase.from('units').upsert(finalUnits);
        if (unitError) throw unitError;
    }
    
    if (finalTransactions.length > 0) {
        const { error: txError } = await supabase.from('transactions').insert(finalTransactions);
        if (txError) throw txError;
    }
  }

  // 4. QUẢN LÝ DANH MỤC
  async addProduct(p: Product) { return await supabase.from('products').insert([p]); }
  async deleteProduct(id: string) { return await supabase.from('products').delete().eq('id', id); }
  async addWarehouse(wh: Warehouse) { return await supabase.from('warehouses').insert([wh]); }
  async deleteWarehouse(id: string) { return await supabase.from('warehouses').delete().eq('id', id); }

  // 5. QUẢN LÝ NHÁP (LocalStorage dành riêng cho từng máy tính)
  getDrafts() {
    const saved = localStorage.getItem('RO_MASTER_DRAFTS_V3