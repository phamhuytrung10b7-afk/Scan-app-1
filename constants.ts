import { FactoryLayout } from './types';

export const INITIAL_LAYOUT: FactoryLayout = {
  id: 'default-layout',
  name: 'Layout mặc định',
  elements: [
    { id: 'a1', type: 'area', x: 300, y: 210, width: 520, height: 70, name: 'Khu vực RMA / Test', status: 'active', color: '#fff' },
    { id: 'e1', type: 'machine', x: 315, y: 230, width: 100, height: 35, name: 'Line RMA', status: 'active', color: '#fff' },
    { id: 'e2', type: 'storage', x: 455, y: 225, width: 20, height: 20, name: 'Xe đẩy', status: 'active', color: '#fff' },
    { id: 'e3', type: 'storage', x: 455, y: 250, width: 20, height: 20, name: 'Xe đẩy', status: 'active', color: '#fff' },
    { id: 'e4', type: 'machine', x: 485, y: 225, width: 50, height: 40, name: 'Khu vực máy test lạnh', status: 'active', color: '#fff' },
    { id: 'c2', type: 'conveyor', x: 620, y: 240, width: 160, height: 20, name: 'Băng tải 1', status: 'active', color: '#2d5a27' },
    { id: 'l2', type: 'label', x: 450, y: 290, width: 200, height: 30, name: 'SHA76222KL', status: 'active', color: '#000', fontSize: 24 },
    { id: 'c1', type: 'conveyor', x: 300, y: 325, width: 510, height: 20, name: 'Line chính nối thêm 2m về phía đóng thùng', status: 'active', color: '#2d5a27' },
    { id: 'e5', type: 'machine', x: 505, y: 470, width: 35, height: 50, name: 'Bàn assembly', status: 'active', color: '#fff' },
    { id: 'e6', type: 'machine', x: 515, y: 580, width: 40, height: 30, name: 'Kệ để thùng carton', status: 'active', color: '#fff' },
    { id: 'e7', type: 'machine', x: 575, y: 540, width: 40, height: 20, name: 'Kệ để hàng hóa', status: 'active', color: '#fff' },
    { id: 'w1', type: 'worker', x: 535, y: 535, width: 40, height: 40, name: 'Nam', status: 'active', color: '#fbbf24', task: 'Gắn vít' },
    { id: 'w2', type: 'worker', x: 590, y: 575, width: 40, height: 40, name: 'Nguyễn Văn A', status: 'active', color: '#fbbf24', task: 'Gắn nút nhấn và bộ gõ' },
    { id: 'w3', type: 'worker', x: 590, y: 495, width: 40, height: 40, name: 'Trần Thị Q', status: 'active', color: '#fbbf24', task: 'Test bộ gõ (L1, Ch)' },
    { id: 'w4', type: 'worker', x: 590, y: 440, width: 40, height: 40, name: 'Mẫn (May)', status: 'active', color: '#fbbf24', task: '' },
    { id: 'w5', type: 'worker', x: 590, y: 385, width: 40, height: 40, name: 'Trần Thị R', status: 'active', color: '#fbbf24', task: 'May bao bì nhựa' },
    { id: 'c3', type: 'conveyor', x: 615, y: 375, width: 15, height: 235, name: 'V1', status: 'active', color: '#2d5a27' },
    { id: 'c4', type: 'conveyor', x: 690, y: 375, width: 30, height: 325, name: 'V2', status: 'active', color: '#2d5a27' },
    { id: 'c5', type: 'conveyor', x: 805, y: 375, width: 15, height: 235, name: 'V3', status: 'active', color: '#2d5a27' },
    { id: 'a2', type: 'area', x: 130, y: 540, width: 130, height: 95, name: 'KHO', status: 'active', color: '#fff' },
    { id: 'p1', type: 'storage', x: 240, y: 240, width: 25, height: 70, name: 'Pallet', status: 'active', color: '#fff', showCross: true },
    { id: 'p2', type: 'storage', x: 115, y: 440, width: 25, height: 70, name: 'Mút xốp', status: 'active', color: '#fff', showCross: true },
    { id: 'p3', type: 'storage', x: 190, y: 440, width: 25, height: 70, name: 'Pallet', status: 'active', color: '#fff', showCross: true },
  ],
  connections: []
};

export const MM_PER_PX = 10;

export const LEVEL_COLORS = [
  '#22c55e', // 0: Green
  '#3b82f6', // 1: Blue
  '#f59e0b', // 2: Amber
  '#8b5cf6', // 3: Violet
  '#ec4899', // 4: Pink
  '#06b6d4', // 5: Cyan
  '#ef4444', // 6: Red
  '#facc15', // 7: Gold
];
