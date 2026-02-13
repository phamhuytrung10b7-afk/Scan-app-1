import { createClient } from '@supabase/supabase-js';
import { Product, SerialUnit, UnitStatus, Transaction, Warehouse, Customer, ProductionPlan, SalesOrder, SalesOrderItem } from './types';

// Kết nối Supabase theo thông tin từ ảnh bạn gửi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

class InventoryService {
  // --- LẤY DỮ LIỆU TỪ CLOUD ---
  async getAllDataFromCloud() {
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
      products: (p.data || []) as Product[],
      units: (u.data || []) as SerialUnit[],
      transactions: (t.data || []) as Transaction[],
      warehouses: (w.data || []) as Warehouse[],
      customers: (c.data || []) as Customer[],
      productionPlans: (pp.data || []) as ProductionPlan[],
      salesOrders: (so.data || []) as SalesOrder[]
    };
  }

  // --- HÀM NHẬP KHO (Xử lý 17 máy lên mây) ---
  async importUnits(productId: string, serials: string[], initialLocation: string, planName?: string) {
    // 1. Lấy thông tin kho hiện tại từ Cloud để tính sức chứa
    const { data: allWhs } = await supabase.from('warehouses').select('*');
    const { data: allUnits } = await supabase.from('units').select('*');

    let remainingSerials = [...serials];
    let whIdx = allWhs?.findIndex(w => w.name === initialLocation) ?? 0;
    if (whIdx === -1) whIdx = 0;

    const finalUnits: any[] = [];
    const finalTransactions: any[] = [];

    // Logic tự động nhảy kho khi đầy (giữ nguyên từ bản cũ của bạn)
    while (remainingSerials.length > 0 && whIdx < (allWhs?.length ?? 0)) {
      const currentWh = allWhs![whIdx];
      const currentStock = allUnits?.filter(u => u.warehouseLocation === currentWh.name && u.status === 'NEW').length ?? 0;
      const spaceLeft = Math.max(0, (currentWh.maxCapacity || 999999) - currentStock);

      if (spaceLeft > 0) {
        const canTake = remainingSerials.slice(0, spaceLeft);
        
        canTake.forEach(s => {
          const existing = allUnits?.find(u => u.serialNumber === s);
          finalUnits.push({
            serialNumber: s,
            productId,
            status: 'NEW',
            warehouseLocation: currentWh.name,
            importDate: new Date().toISOString(),
            isReimported: existing?.status === 'SOLD'
          });
        });

        finalTransactions.push({
          type:
import React, { useState, useMemo, useEffect } from 'react';
import { inventoryService } from './inventoryService';
import { exportExcelReport } from './reportService';
import { UnitStatus, Product, SerialUnit, Warehouse } from './types';
import { FileSpreadsheet, Warehouse as WarehouseIcon, BarChart3, Hash, RefreshCcw } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allUnits, setAllUnits] = useState<SerialUnit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWhName, setSelectedWhName] = useState<string>('');

  // Tải dữ liệu từ Supabase Cloud
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getAllDataFromCloud();
      setProducts(data.products);
      setAllUnits(data.units);
      setWarehouses(data.warehouses);
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const inventoryData = useMemo(() => {
    if (!selectedWhName) return [];
    return products.map(p => {
      const productUnitsInWh = allUnits.filter(u => 
        u.productId === p.id && u.warehouseLocation === selectedWhName
      );
      const inStockUnits = productUnitsInWh.filter(u => u.status === UnitStatus.NEW);
      return {
        ...p,
        total: productUnitsInWh.length,
        new: inStockUnits.length,
        sold: productUnitsInWh.filter(u => u.status === UnitStatus.SOLD).length,
        imeis: inStockUnits.map(u => ({ serial: u.serialNumber, isReimported: u.isReimported }))
      };
    }).filter(item => item.total > 0);
  }, [selectedWhName, products, allUnits]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCcw size={40} className="animate-spin text-blue-600 mb-4" />
        <p className="font-bold text-slate-500 italic text-sm">Đang kết nối kho dữ liệu dùng chung...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tồn kho Hệ thống (Cloud)</h2>
          <p className="text-xs text-blue-500 font-bold">Dữ liệu đang được đồng bộ trực tuyến</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <RefreshCcw size={16} /> Làm mới
          </button>
          <button onClick={exportExcelReport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <select 
          className="w-full p-2 border rounded-lg font-bold text-slate-700"
          value={selectedWhName}
          onChange={(e) => setSelectedWhName(e.target.value)}
        >
          <option value="">-- Chọn Kho để xem hàng --</option>
          {warehouses.map(wh => (
            <option key={wh.id} value={wh.name}>{wh.name}</option>
          ))}
        </select>
      </div>

      {/* Hiển thị danh sách 17 máy của bạn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {inventoryData.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between mb-4">
               <h4 className="font-bold text-slate-800">{item.model}</h4>
               <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold">{item.new} máy</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border">
              {item.imeis.map(u => (
                <div key={u.serial} className="bg-white border text-[10px] p-2 rounded text-center font-mono font-bold">
                  {u.serial}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};