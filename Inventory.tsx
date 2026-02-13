import React, { useState, useMemo, useEffect } from 'react';
import { inventoryService } from './inventoryService';
import { exportExcelReport } from './reportService';
import { UnitStatus, Product, SerialUnit, Warehouse } from './types';
import { FileSpreadsheet, Warehouse as WarehouseIcon, BarChart3, RefreshCcw } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allUnits, setAllUnits] = useState<SerialUnit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWhName, setSelectedWhName] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getAllDataFromCloud();
      setProducts(data.products);
      setAllUnits(data.units);
      setWarehouses(data.warehouses);
    } catch (error) {
      console.error("Lỗi:", error);
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
        imeis: inStockUnits.map(u => ({ serial: u.serialNumber, isReimported: u.isReimported }))
      };
    }).filter(item => item.total > 0);
  }, [selectedWhName, products, allUnits]);

  if (isLoading) return <div className="p-20 text-center animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tồn kho Hệ thống</h2>
        <button onClick={loadData} className="bg-slate-100 p-2 rounded-lg flex items-center gap-2">
          <RefreshCcw size={16} /> Làm mới
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border">
        <select 
          className="w-full p-2 border rounded-lg font-bold"
          value={selectedWhName}
          onChange={(e) => setSelectedWhName(e.target.value)}
        >
          <option value="">-- Chọn Kho hàng --</option>
          {warehouses.map(wh => <option key={wh.id} value={wh.name}>{wh.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventoryData.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between mb-4">
              <h4 className="font-bold">{item.model}</h4>
              <span className="text-blue-600 font-bold">{item.new} máy</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {item.imeis.map(u => (
                <div key={u.serial} className="text-[10px] font-mono border p-1 rounded bg-slate-50 text-center">
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