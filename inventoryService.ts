import { createClient } from '@supabase/supabase-js';
import { Product, SerialUnit, UnitStatus, Transaction, Warehouse, Customer, ProductionPlan, SalesOrder } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

class InventoryService {
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
        warehouses: (w.data && w.data.length > 0) ? w.data : [{ id: 'wh-default', name: 'Kho Tổng', maxCapacity: 1000 }],
        customers: c.data || [],
        productionPlans: pp.data || [],
        salesOrders: so.data || []
      };
    } catch (error) {
      console.error("Lỗi Cloud:", error);
      throw error;
    }
  }

  async importUnits(productId: string, serials: string[], initialLocation: string, planName?: string) {
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
          if (existing && existing.status === 'NEW') return;
          finalUnits.push({
            serialNumber: s, productId, status: 'NEW',
            warehouseLocation: currentWh.name,
            importDate: new Date().toISOString(),
            isReimported: existing?.status === 'SOLD'
          });
        });
        if (canTake.length > 0) {
          finalTransactions.push({
            id: `tx-in-${Date.now()}-${currentWh.name}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'INBOUND', date: new Date().toISOString(),
            productId, quantity: canTake.length, serialNumbers: canTake,
            toLocation: currentWh.name, planName
          });
        }
        remainingSerials = remainingSerials.slice(spaceLeft);
      }
      whIdx++;
    }
    if (finalUnits.length > 0) await supabase.from('units').upsert(finalUnits);
    if (finalTransactions.length > 0) await supabase.from('transactions').insert(finalTransactions);
  }

  // --- PHẦN QUAN TRỌNG: SỬA LỖI UNTERMINATED Ở ĐÂY ---
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