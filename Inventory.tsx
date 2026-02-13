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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryService.getAllDataFromCloud();
      setProducts(data.products);
      setAllUnits(data.units);
      setWarehouses(data.warehouses);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <RefreshCcw size={40} className="animate-spin text-blue-600 mb-4" />
      <p className="font-bold text-slate-500 italic">Đang đồng bộ dữ liệu Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Tồn kho Hệ thống</h2>
        <div className="flex gap-2">
          <button onClick={loadData} className="bg-slate-100 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <RefreshCcw size={16} /> Làm mới
          </button>
          <button onClick={exportExcelReport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <FileSpreadsheet size={16} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <select 
          className="w-full p-2 border rounded-lg font-bold text-slate-700"
          value={selectedWhName}
          onChange={(e) => setSelectedWhName(e.target.value)}
        >
          <option value="">-- Chọn Kho hàng --</option>
          {warehouses.map(wh => (
            <option key={wh.id} value={wh.name}>{wh.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {inventoryData.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-slate-800 text-lg">{item.model}</h4>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">{item.new} máy</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-40 overflow-y-auto">
              {item.imeis.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {item.imeis.map(u => (
                    <div key={u.serial} className="bg-white border p-2 rounded text-center font-mono text-[10px] font-bold shadow-sm">
                      {u.serial}
                    </div>
                  ))}
                </div>
              ) : <p className="text-center text-slate-400 italic text-xs">Không có IMEI</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};