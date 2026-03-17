/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import { Stage, Layer, Rect, Text, Arrow, Group, Line, Transformer } from 'react-konva';
import { 
  Factory, 
  Cpu, 
  Package, 
  ArrowRightLeft, 
  Plus, 
  Trash2, 
  Save, 
  Download,
  Settings2,
  AlertCircle,
  FolderOpen,
  FilePlus,
  ChevronDown,
  RotateCw,
  Copy,
  Pencil,
  Check,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  FileText,
  Upload,
  ExternalLink,
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenAI } from "@google/genai";
import SafePdfViewer from './SafePdfViewer';
import Markdown from 'react-markdown';
import { FactoryLayout, LayoutElement, Connection, ElementType, ChatMessage } from './types';
import { BOMModal, PdfBomModal, GenericPdfModal, ImageModal } from './Modals';

// --- Constants ---
const INITIAL_LAYOUT: FactoryLayout = {
  id: 'default-layout',
  name: 'Sơ đồ nhà máy mặc định',
  elements: [
    // Top Area: RMA / Test
    { id: 'a1', type: 'area', x: 300, y: 210, width: 520, height: 70, name: 'Khu vực RMA / Test', status: 'active', color: '#fff' },
    { id: 'e1', type: 'machine', x: 315, y: 230, width: 100, height: 35, name: 'Line RMA', status: 'active', color: '#fff' },
    { id: 'e2', type: 'storage', x: 455, y: 225, width: 20, height: 20, name: 'Xe đẩy', status: 'active', color: '#fff' },
    { id: 'e3', type: 'storage', x: 455, y: 250, width: 20, height: 20, name: 'Xe đẩy', status: 'active', color: '#fff' },
    { id: 'e4', type: 'machine', x: 485, y: 225, width: 50, height: 40, name: 'Khu vực máy test lạnh', status: 'active', color: '#fff' },
    { id: 'c2', type: 'conveyor', x: 620, y: 240, width: 160, height: 20, name: 'Băng tải 1', status: 'active', color: '#2d5a27' },
    
    // Main Horizontal Line
    { id: 'l2', type: 'label', x: 450, y: 290, width: 200, height: 30, name: 'SHA76222KL', status: 'active', color: '#000', fontSize: 24 },
    { id: 'c1', type: 'conveyor', x: 300, y: 325, width: 510, height: 20, name: 'Line chính nối thêm 2m về phía đóng thùng', status: 'active', color: '#2d5a27' },
    
    // Middle Section: Assembly & Workers
    { id: 'e5', type: 'machine', x: 505, y: 470, width: 35, height: 50, name: 'Bàn assembly', status: 'active', color: '#fff' },
    { id: 'e6', type: 'machine', x: 515, y: 580, width: 40, height: 30, name: 'Kệ để thùng carton', status: 'active', color: '#fff' },
    { id: 'e7', type: 'machine', x: 575, y: 540, width: 40, height: 20, name: 'Kệ để hàng hóa', status: 'active', color: '#fff' },
    
    // Workers
    { id: 'w1', type: 'worker', x: 535, y: 535, width: 40, height: 40, name: 'Nam', status: 'active', color: '#fbbf24', task: 'Gắn vít' },
    { id: 'w2', type: 'worker', x: 590, y: 575, width: 40, height: 40, name: 'Nguyễn Văn A', status: 'active', color: '#fbbf24', task: 'Gắn nút nhấn và bộ gõ' },
    { id: 'w3', type: 'worker', x: 590, y: 495, width: 40, height: 40, name: 'Trần Thị Q', status: 'active', color: '#fbbf24', task: 'Test bộ gõ (L1, Ch)' },
    { id: 'w4', type: 'worker', x: 590, y: 440, width: 40, height: 40, name: 'Mẫn (May)', status: 'active', color: '#fbbf24', task: '' },
    { id: 'w5', type: 'worker', x: 590, y: 385, width: 40, height: 40, name: 'Trần Thị R', status: 'active', color: '#fbbf24', task: 'May bao bì nhựa' },
    
    // Vertical Conveyors
    { id: 'c3', type: 'conveyor', x: 615, y: 375, width: 15, height: 235, name: 'V1', status: 'active', color: '#2d5a27' },
    { id: 'c4', type: 'conveyor', x: 690, y: 375, width: 30, height: 325, name: 'V2', status: 'active', color: '#2d5a27' },
    { id: 'c5', type: 'conveyor', x: 805, y: 375, width: 15, height: 235, name: 'V3', status: 'active', color: '#2d5a27' },
    
    // Left Section: KHO
    { id: 'a2', type: 'area', x: 130, y: 540, width: 130, height: 95, name: 'KHO', status: 'active', color: '#fff' },
    { id: 'p1', type: 'storage', x: 240, y: 240, width: 25, height: 70, name: 'Pallet', status: 'active', color: '#fff', showCross: true },
    { id: 'p2', type: 'storage', x: 115, y: 440, width: 25, height: 70, name: 'Mút xốp', status: 'active', color: '#fff', showCross: true },
    { id: 'p3', type: 'storage', x: 190, y: 440, width: 25, height: 70, name: 'Pallet', status: 'active', color: '#fff', showCross: true },
  ],
  connections: []
};

const MM_PER_PX = 10;

const LEVEL_COLORS = [
  '#22c55e', // 0: Green (Cơ bản)
  '#3b82f6', // 1: Blue
  '#f59e0b', // 2: Amber (Distinct from Blue)
  '#8b5cf6', // 3: Violet
  '#ec4899', // 4: Pink
  '#06b6d4', // 5: Cyan
  '#ef4444', // 6: Red
  '#facc15', // 7: Gold (Bậc thầy)
];

// --- Components ---

const WorkerProfilePopup = ({ element, onClose, onUpdate }: { element: LayoutElement, onClose: () => void, onUpdate: (id: string, updates: Partial<LayoutElement>) => void }) => {
  if (element.type !== 'worker') return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
      animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
      exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
      className="absolute top-1/2 left-1/2 w-72 bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white p-6 z-50"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div 
            className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transform -rotate-3"
            style={{ 
              backgroundColor: LEVEL_COLORS[element.level || 0],
              boxShadow: `0 8px 16px ${LEVEL_COLORS[element.level || 0]}44`
            }}
          >
            {element.level || 0}
            {element.isCTQ && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full border-2 border-white font-black shadow-sm">
                CTQ
              </div>
            )}
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-xl leading-tight tracking-tight">
              {element.name || 'Chưa đặt tên'}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thông tin công đoạn</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all hover:text-slate-600 active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1.5">
            <Cpu className="w-3 h-3 text-indigo-500" />
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Người đảm nhận</p>
          </div>
          <p className="text-sm text-slate-700 font-bold leading-relaxed">
            {element.task || <span className="text-slate-300 italic font-medium">Chưa có người đảm nhận</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <RotateCw className="w-3 h-3 text-emerald-500" />
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Thời gian</p>
            </div>
            <p className="text-sm text-slate-700 font-bold">
              {element.operationTime || <span className="text-slate-300 italic font-medium">--</span>}
            </p>
          </div>
          <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-1.5">
              <Settings2 className="w-3 h-3 text-amber-500" />
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Kỹ năng</p>
            </div>
            <p className="text-sm text-slate-700 font-bold">
              Bậc {element.level || 0}
            </p>
          </div>
        </div>

        <button
          onClick={() => onUpdate(element.id, { isCTQ: !element.isCTQ })}
          className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
            element.isCTQ 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors ${element.isCTQ ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-wider">Công đoạn CTQ</p>
              <p className="text-[10px] opacity-70">Đánh dấu công đoạn quan trọng chất lượng</p>
            </div>
          </div>
          <div className={`w-10 h-6 rounded-full relative transition-colors ${element.isCTQ ? 'bg-red-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${element.isCTQ ? 'left-5' : 'left-1'}`} />
          </div>
        </button>
      </div>

      {element.analysisTime && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-2.5 h-2.5 text-emerald-500" />
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Cập nhật từ BOM lúc</p>
          </div>
          <p className="text-[10px] text-slate-500 font-bold">
            {element.analysisTime}
          </p>
        </div>
      )}
      
      <div className="mt-6 flex gap-2">
        <button 
          onClick={onClose}
          className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          Đóng hồ sơ
        </button>
      </div>
    </motion.div>
  );
};

interface CanvasProps {
  layout: FactoryLayout;
  onUpdateElement: (id: string, updates: Partial<LayoutElement>) => void;
  onUpdateElements: (ids: string[], updates: (el: LayoutElement) => Partial<LayoutElement>) => void;
  onSelectElements: (ids: string[]) => void;
  onUpdateViewport: (x: number, y: number, zoom: number) => void;
  selectedIds: string[];
}

const FactoryElement = React.memo(({ 
  el, 
  isSelected, 
  onDragMove, 
  onDragEnd, 
  onTransformEnd, 
  onClick 
}: { 
  el: LayoutElement, 
  isSelected: boolean, 
  onDragMove: (id: string, e: any) => void,
  onDragEnd: (id: string, e: any) => void,
  onTransformEnd: (id: string, e: any) => void,
  onClick: (id: string, e: any) => void
}) => {
  if (el.type === 'label') {
    return (
      <Group
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        draggable
        onDragMove={(e) => onDragMove(el.id, e)}
        onDragEnd={(e) => onDragEnd(el.id, e)}
        onTransformEnd={(e) => onTransformEnd(el.id, e)}
        onClick={(e) => onClick(el.id, e)}
        rotation={el.rotation || 0}
      >
        <Rect
          width={el.width}
          height={el.height}
          fill="transparent"
          stroke={isSelected ? "#3b82f6" : "transparent"}
          strokeWidth={1}
          perfectDrawEnabled={false}
        />
        <Text
          text={el.name}
          fontSize={el.fontSize || 14}
          fontStyle="bold"
          fill="#000"
          align="center"
          verticalAlign="middle"
          width={el.width}
          height={el.height}
          listening={false}
        />
      </Group>
    );
  }

  if (el.type === 'arrow') {
    return (
      <Group
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        draggable
        onDragMove={(e) => onDragMove(el.id, e)}
        onDragEnd={(e) => onDragEnd(el.id, e)}
        onTransformEnd={(e) => onTransformEnd(el.id, e)}
        onClick={(e) => onClick(el.id, e)}
        rotation={el.rotation || 0}
      >
        <Arrow
          points={[0, 0, el.width, el.height]}
          stroke="#000"
          fill="#000"
          strokeWidth={2}
          perfectDrawEnabled={false}
        />
      </Group>
    );
  }

  if (el.type === 'worker') {
    const hasName = el.name && el.name.trim() !== '';
    const hasTask = el.task && el.task.trim() !== '';
    const isActive = hasName && hasTask;
    const level = el.level || 0;
    
    const workerColor = isActive ? LEVEL_COLORS[level] : '#94a3b8';
    const headSize = el.height * 0.35;
    const bodyWidth = el.width * 0.8;
    const bodyHeight = el.height * 0.55;
    const centerX = el.width / 2;

    return (
      <Group
        id={el.id}
        x={el.x}
        y={el.y}
        width={el.width}
        height={el.height}
        draggable
        onDragMove={(e) => onDragMove(el.id, e)}
        onDragEnd={(e) => onDragEnd(el.id, e)}
        onTransformEnd={(e) => onTransformEnd(el.id, e)}
        onClick={(e) => onClick(el.id, e)}
        rotation={el.rotation || 0}
      >
        {/* Glow effect for active state */}
        {isActive && (
          <Rect
            x={centerX - bodyWidth * 0.6}
            y={-5}
            width={bodyWidth * 1.2}
            height={el.height + 10}
            fill={workerColor}
            opacity={0.15}
            cornerRadius={12}
            shadowBlur={15}
            shadowColor={workerColor}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}

        {/* Invisible hit area */}
        <Rect
          width={el.width}
          height={el.height + 40}
          fill="transparent"
        />
        
        {/* Professional Silhouette - Head */}
        <Rect
          x={centerX - headSize / 2}
          y={0}
          width={headSize}
          height={headSize}
          fill={workerColor}
          cornerRadius={headSize / 2}
          stroke="#000"
          strokeWidth={1.5}
          perfectDrawEnabled={false}
        />
        {/* Professional Silhouette - Shoulders/Body */}
        <Rect
          x={centerX - bodyWidth / 2}
          y={headSize + 2}
          width={bodyWidth}
          height={bodyHeight}
          fill={workerColor}
          cornerRadius={bodyWidth * 0.2}
          stroke="#000"
          strokeWidth={1.5}
          perfectDrawEnabled={false}
        />

        {/* Level Badge */}
        {isActive && (
          <Group x={centerX + headSize / 2 - 8} y={-10} listening={false}>
            <Rect
              width={24}
              height={24}
              fill="#fff"
              stroke="#000"
              strokeWidth={1.5}
              cornerRadius={12}
              shadowBlur={2}
              shadowColor="#000"
              shadowOpacity={0.2}
              perfectDrawEnabled={false}
            />
            <Text
              text={level.toString()}
              fontSize={14}
              fontStyle="bold"
              width={24}
              height={24}
              align="center"
              verticalAlign="middle"
              fill="#000"
            />
          </Group>
        )}

        {/* Sequence Number Badge */}
        {el.sequenceNumber !== undefined && (
          <Group x={centerX - headSize / 2 - 20} y={-10} listening={false}>
            <Rect
              width={28}
              height={24}
              fill="#1e293b"
              stroke="#000"
              strokeWidth={1.5}
              cornerRadius={6}
              shadowBlur={2}
              shadowColor="#000"
              shadowOpacity={0.2}
              perfectDrawEnabled={false}
            />
            <Text
              text={el.sequenceNumber.toString()}
              fontSize={14}
              fontStyle="bold"
              width={28}
              height={24}
              align="center"
              verticalAlign="middle"
              fill="#fff"
            />
          </Group>
        )}

        {/* CTQ Badge */}
        {el.isCTQ && (
          <Group x={centerX - 20} y={-35} listening={false}>
            <Rect
              width={40}
              height={20}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={1.5}
              cornerRadius={6}
              shadowBlur={3}
              shadowColor="#000"
              shadowOpacity={0.3}
              perfectDrawEnabled={false}
            />
            <Text
              text="CTQ"
              fontSize={12}
              fontStyle="bold"
              width={40}
              height={20}
              align="center"
              verticalAlign="middle"
              fill="#fff"
            />
          </Group>
        )}

        <Text
          text={el.name || 'Chưa đặt tên'}
          fontSize={el.fontSize || 10}
          fontStyle="bold"
          width={el.width * 3}
          x={-el.width}
          align="center"
          y={el.height + 5}
          fill={el.name ? "#000" : "#94a3b8"}
          listening={false}
        />
      </Group>
    );
  }

  return (
    <Group
      id={el.id}
      x={el.x}
      y={el.y}
      width={el.width}
      height={el.height}
      draggable
      onDragMove={(e) => onDragMove(el.id, e)}
      onDragEnd={(e) => onDragEnd(el.id, e)}
      onTransformEnd={(e) => onTransformEnd(el.id, e)}
      onClick={(e) => onClick(el.id, e)}
      rotation={el.rotation || 0}
    >
      <Rect
        width={el.width}
        height={el.height}
        fill={el.type === 'area' ? 'transparent' : (el.type === 'conveyor' ? '#2d5a27' : el.color)}
        stroke="#000"
        strokeWidth={el.type === 'area' ? 2 : 1}
        dash={el.type === 'area' ? [5, 5] : undefined}
        shadowBlur={isSelected ? 5 : 0}
        shadowColor="#3b82f6"
        perfectDrawEnabled={false}
      />

      {el.showCross && (
        <Group listening={false}>
          <Line points={[0, 0, el.width, el.height]} stroke="#000" strokeWidth={1} perfectDrawEnabled={false} />
          <Line points={[el.width, 0, 0, el.height]} stroke="#000" strokeWidth={1} perfectDrawEnabled={false} />
        </Group>
      )}

      {el.type === 'conveyor' && (
        <Group listening={false}>
          {el.width >= el.height ? (
            Array.from({ length: Math.floor(el.width / 40) }).map((_, i) => (
              <Rect
                key={i}
                x={i * 40 + 5}
                y={2}
                width={30}
                height={el.height - 4}
                fill="#fff"
                stroke="#000"
                strokeWidth={1}
                perfectDrawEnabled={false}
              />
            ))
          ) : (
            Array.from({ length: Math.floor(el.height / 40) }).map((_, i) => (
              <Rect
                key={i}
                x={2}
                y={i * 40 + 5}
                width={el.width - 4}
                height={30}
                fill="#fff"
                stroke="#000"
                strokeWidth={1}
                perfectDrawEnabled={false}
              />
            ))
          )}
        </Group>
      )}

      {el.type !== 'area' && (
        <Text
          text={el.name}
          fontSize={el.fontSize || 10}
          fontStyle="bold"
          width={el.width}
          align="center"
          y={el.height / 2 - 5}
          fill={el.type === 'conveyor' ? '#000' : (el.color === '#fff' ? '#000' : '#fff')}
          listening={false}
        />
      )}

      {el.type === 'area' && (
        <Text
          text={el.name}
          fontSize={12}
          fontStyle="bold"
          x={5}
          y={5}
          fill="#000"
          listening={false}
        />
      )}
    </Group>
  );
});

const Grid = React.memo(() => (
  <Layer listening={false}>
    {Array.from({ length: 100 }).map((_, i) => (
      <Fragment key={i}>
        <Line points={[i * 40, 0, i * 40, 3000]} stroke="#f0f0f0" strokeWidth={1} perfectDrawEnabled={false} />
        <Line points={[0, i * 40, 4000, i * 40]} stroke="#f0f0f0" strokeWidth={1} perfectDrawEnabled={false} />
      </Fragment>
    ))}
  </Layer>
));

const Canvas: React.FC<CanvasProps> = ({ layout, onUpdateElement, onUpdateElements, onSelectElements, onUpdateViewport, selectedIds }) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionBox, setSelectionBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPos, setLastPanPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedIds.length > 0 && transformerRef.current && stageRef.current) {
      const stage = stageRef.current;
      const selectedNodes = selectedIds.map(id => stage.findOne('#' + id)).filter(node => !!node);
      transformerRef.current.nodes(selectedNodes);
      const layer = transformerRef.current.getLayer();
      if (layer) layer.batchDraw();
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedIds]);

  const handleDragMove = (id: string, e: any) => {
    if (selectedIds.includes(id) && selectedIds.length > 1 && stageRef.current) {
      const node = e.target;
      const originalEl = layout.elements.find(el => el.id === id);
      if (!originalEl) return;
      
      const dx = node.x() - originalEl.x;
      const dy = node.y() - originalEl.y;
      
      selectedIds.forEach(sid => {
        if (sid !== id) {
          const otherNode = stageRef.current.findOne('#' + sid);
          if (otherNode) {
            const otherOriginalEl = layout.elements.find(el => el.id === sid);
            if (otherOriginalEl) {
              otherNode.x(otherOriginalEl.x + dx);
              otherNode.y(otherOriginalEl.y + dy);
            }
          }
        }
      });
      stageRef.current.batchDraw();
    }
  };

  const handleDragEnd = (id: string, e: any) => {
    if (selectedIds.includes(id) && selectedIds.length > 1) {
      const node = e.target;
      const dx = node.x() - layout.elements.find(el => el.id === id)!.x;
      const dy = node.y() - layout.elements.find(el => el.id === id)!.y;
      
      onUpdateElements(selectedIds, (el) => ({
        x: el.x + dx,
        y: el.y + dy
      }));
    } else {
      onUpdateElement(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    }
  };

  const handleTransformEnd = (id: string, e: any) => {
    const node = e.target;
    if (selectedIds.length > 1 && stageRef.current) {
      onUpdateElements(selectedIds, (el) => {
        const n = stageRef.current.findOne('#' + el.id);
        if (!n) return {};
        return {
          x: n.x(),
          y: n.y(),
          width: n.width() * n.scaleX(),
          height: n.height() * n.scaleY(),
          rotation: n.rotation()
        };
      });
      selectedIds.forEach(sid => {
        const n = stageRef.current.findOne('#' + sid);
        if (n) {
          n.scaleX(1);
          n.scaleY(1);
        }
      });
    } else {
      onUpdateElement(id, {
        x: node.x(),
        y: node.y(),
        width: Math.max(5, node.width() * node.scaleX()),
        height: Math.max(5, node.height() * node.scaleY()),
        rotation: node.rotation(),
      });
      node.scaleX(1);
      node.scaleY(1);
    }
  };

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    
    if (e.evt.button === 1) {
      setIsPanning(true);
      setLastPanPos(pos);
      stage.container().style.cursor = 'grabbing';
      return;
    }

    if (e.target === stage && e.evt.button === 0) {
      const scale = stage.scaleX();
      const stageX = stage.x();
      const stageY = stage.y();
      
      const x = (pos.x - stageX) / scale;
      const y = (pos.y - stageY) / scale;
      
      setSelectionBox({ x1: x, y1: y, x2: x, y2: y });
      onSelectElements([]);
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (isPanning) {
      const dx = pos.x - lastPanPos.x;
      const dy = pos.y - lastPanPos.y;
      const newX = stage.x() + dx;
      const newY = stage.y() + dy;
      
      stage.position({ x: newX, y: newY });
      setLastPanPos(pos);
      onUpdateViewport(newX, newY, stage.scaleX());
      return;
    }

    if (selectionBox) {
      const scale = stage.scaleX();
      const stageX = stage.x();
      const stageY = stage.y();
      
      const x = (pos.x - stageX) / scale;
      const y = (pos.y - stageY) / scale;
      
      setSelectionBox({ ...selectionBox, x2: x, y2: y });
    }
  };

  const handleMouseUp = (e: any) => {
    if (isPanning) {
      setIsPanning(false);
      e.target.getStage().container().style.cursor = 'default';
    }

    if (selectionBox) {
      const x1 = Math.min(selectionBox.x1, selectionBox.x2);
      const y1 = Math.min(selectionBox.y1, selectionBox.y2);
      const x2 = Math.max(selectionBox.x1, selectionBox.x2);
      const y2 = Math.max(selectionBox.y1, selectionBox.y2);
      
      const selected = layout.elements.filter(el => {
        const ex1 = el.x;
        const ey1 = el.y;
        const ex2 = el.x + el.width;
        const ey2 = el.y + el.height;
        return !(ex1 > x2 || ex2 < x1 || ey1 > y2 || ey2 < y1);
      }).map(el => el.id);
      
      onSelectElements(selected);
      setSelectionBox(null);
    }
  };

  const handleStageDragEnd = (e: any) => {
    if (e.target === stageRef.current) {
      onUpdateViewport(e.target.x(), e.target.y(), layout.viewport?.zoom || 1);
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    onUpdateViewport(newPos.x, newPos.y, newScale);
  };

  const handleElementClick = (id: string, e: any) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      if (selectedIds.includes(id)) {
        onSelectElements(selectedIds.filter(sid => sid !== id));
      } else {
        onSelectElements([...selectedIds, id]);
      }
    } else {
      if (!selectedIds.includes(id)) {
        onSelectElements([id]);
      }
    }
  };


  return (
    <div ref={containerRef} className="w-full h-full bg-white overflow-hidden border border-slate-300 rounded-xl shadow-lg cursor-grab active:cursor-grabbing relative">
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600 z-20 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">SCALE:</span>
          <span>1px = 10mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">ZOOM:</span>
          <span>{Math.round((layout.viewport?.zoom || 1) * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">GRID:</span>
          <span>400mm</span>
        </div>
      </div>

      <Stage
        width={dimensions.width}
        height={dimensions.height}
        ref={stageRef}
        draggable={!selectionBox && !isPanning}
        x={layout.viewport?.x || 0}
        y={layout.viewport?.y || 0}
        scaleX={layout.viewport?.zoom || 1}
        scaleY={layout.viewport?.zoom || 1}
        onDragEnd={handleStageDragEnd}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.evt.preventDefault()}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            onSelectElements([]);
          }
        }}
      >
        <Grid />
        <Layer>
          {layout.elements.map(el => (
            <FactoryElement 
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onTransformEnd={handleTransformEnd}
              onClick={handleElementClick}
            />
          ))}

          {selectionBox && (
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(0, 161, 255, 0.3)"
              stroke="rgba(0, 161, 255, 1)"
              strokeWidth={1}
            />
          )}

          {selectedIds.length > 0 && (
            <Transformer
              ref={transformerRef}
              flipEnabled={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [models, setModels] = useState<Record<string, FactoryLayout>>({ 'Mặc định': INITIAL_LAYOUT });
  const [currentModelName, setCurrentModelName] = useState<string>('Mặc định');
  const [layout, setLayout] = useState<FactoryLayout>(INITIAL_LAYOUT);
  const [history, setHistory] = useState<FactoryLayout[]>([]);
  const [clipboard, setClipboard] = useState<LayoutElement[]>([]);
  const [newModelName, setNewModelName] = useState('');
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [editingModelName, setEditingModelName] = useState<string | null>(null);
  const [tempModelName, setTempModelName] = useState('');
  const [appName, setAppName] = useState('FactoryFlow AI');
  const [isEditingAppName, setIsEditingAppName] = useState(false);
  const [tempAppName, setTempAppName] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBOMModalOpen, setIsBOMModalOpen] = useState(false);
  const [isPdfBomModalOpen, setIsPdfBomModalOpen] = useState(false);
  const [isSchematicModalOpen, setIsSchematicModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isModelImageModalOpen, setIsModelImageModalOpen] = useState(false);
  const [bomData, setBomData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfBomInputRef = useRef<HTMLInputElement>(null);
  const schematicInputRef = useRef<HTMLInputElement>(null);
  const processInputRef = useRef<HTMLInputElement>(null);
  const modelImageInputRef = useRef<HTMLInputElement>(null);

  // AI Assistant State
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isExtractingBOM, setIsExtractingBOM] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      // 1. Load from localStorage FIRST (Instant & Offline friendly)
      const localModels = localStorage.getItem('factory-models');
      const localCurrentName = localStorage.getItem('current-model-name');
      const localAppName = localStorage.getItem('factory-app-name');

      if (localModels) {
        try {
          const parsed = JSON.parse(localModels);
          setModels(parsed);
          if (localCurrentName && parsed[localCurrentName]) {
            setCurrentModelName(localCurrentName);
            setLayout(parsed[localCurrentName]);
          }
        } catch (e) {
          console.error("Failed to parse local models", e);
        }
      }
      if (localAppName) setAppName(localAppName);

      // 2. Sync with server ONLY if available
      try {
        const res = await fetch('/api/layouts', { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const loadedModels: Record<string, FactoryLayout> = { ...models }; // Merge with local
            data.forEach((item: any) => {
              loadedModels[item.name] = JSON.parse(item.layout);
            });
            setModels(loadedModels);
            
            // If server has more up-to-date data, use it
            const lastModelName = localCurrentName || data[0].name;
            if (loadedModels[lastModelName]) {
              setCurrentModelName(lastModelName);
              setLayout(loadedModels[lastModelName]);
            }
          }
        }

        const appNameRes = await fetch('/api/settings/app-name', { signal: AbortSignal.timeout(2000) });
        if (appNameRes.ok) {
          const appNameData = await appNameRes.json();
          if (appNameData.value) {
            setAppName(appNameData.value);
          }
        }
      } catch (error) {
        console.log("Running in standalone/offline mode (Server storage unavailable)");
      }
    };
    init();
  }, []);
  
  // Update models record when current layout changes
  useEffect(() => {
    setModels(prev => ({
      ...prev,
      [currentModelName]: layout
    }));
  }, [layout, currentModelName]);

  const handleSaveLayout = async () => {
    // Save to LocalStorage immediately
    localStorage.setItem('current-model-name', currentModelName);
    
    // Sanitize models for localStorage to avoid quota exceeded error
    const sanitizeLayout = (l: FactoryLayout) => {
      if (!l.bom) return l;
      return {
        ...l,
        bom: { ...l.bom, data: '' } // Clear large base64 data for local storage
      };
    };

    const sanitizedModels: Record<string, FactoryLayout> = {};
    Object.keys(models).forEach(key => {
      sanitizedModels[key] = sanitizeLayout(models[key]);
    });
    sanitizedModels[currentModelName] = sanitizeLayout(layout);

    try {
      localStorage.setItem('factory-models', JSON.stringify(sanitizedModels));
    } catch (e) {
      console.warn("LocalStorage quota exceeded, even after sanitization", e);
    }
    
    localStorage.setItem('factory-app-name', appName);

    // Save to Server
    try {
      await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentModelName, layout: layout })
      });
    } catch (error) {
      console.error("Failed to auto-save to server:", error);
    }
  };

  // Auto-save to Server and LocalStorage
  useEffect(() => {
    const timeout = setTimeout(handleSaveLayout, 1000);
    return () => clearTimeout(timeout);
  }, [layout, currentModelName, models, appName]);

  const undo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setLayout(previous);
  };

  const copyElement = () => {
    const selected = layout.elements.filter(el => selectedIds.includes(el.id));
    if (selected.length > 0) {
      setClipboard(selected);
    }
  };

  const pasteElement = () => {
    if (!clipboard || (Array.isArray(clipboard) && clipboard.length === 0)) return;
    
    const elementsToPaste = Array.isArray(clipboard) ? clipboard : [clipboard];
    const newElements = elementsToPaste.map(el => ({
      ...el,
      id: Math.random().toString(36).substr(2, 9),
      x: el.x + 20,
      y: el.y + 20,
    }));

    updateLayoutWithHistory(prev => ({
      ...prev,
      elements: [...prev.elements, ...newElements]
    }));
    setSelectedIds(newElements.map(el => el.id));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName);
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        copyElement();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        pasteElement();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          deleteElement();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, layout, selectedIds, clipboard]);

  const updateLayoutWithHistory = (newLayout: FactoryLayout | ((prev: FactoryLayout) => FactoryLayout)) => {
    setHistory(prev => [...prev.slice(-29), layout]);
    if (typeof newLayout === 'function') {
      setLayout(newLayout);
    } else {
      setLayout(newLayout);
    }
  };

  const saveNewModel = async () => {
    if (!newModelName.trim()) return;
    const updatedModels = { ...models, [newModelName]: layout };
    setModels(updatedModels);
    setCurrentModelName(newModelName);
    setNewModelName('');
    
    try {
      await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newModelName, layout: layout })
      });
    } catch (error) {
      console.error("Failed to save new model:", error);
    }
  };

  const loadModel = (name: string) => {
    setCurrentModelName(name);
    setLayout(models[name]);
    setIsModelMenuOpen(false);
  };

  const deleteModel = async (name: string) => {
    if (Object.keys(models).length <= 1) return;
    const { [name]: _, ...rest } = models;
    setModels(rest);
    if (currentModelName === name) {
      const nextName = Object.keys(rest)[0];
      setCurrentModelName(nextName);
      setLayout(rest[nextName]);
    }
    
    try {
      await fetch(`/api/layouts/${name}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Failed to delete model:", error);
    }
  };

  const duplicateModel = async (name: string) => {
    const baseName = `${name} (Copy)`;
    let newName = baseName;
    let counter = 1;
    while (models[newName]) {
      newName = `${baseName} ${counter}`;
      counter++;
    }
    const updatedModels = { ...models, [newName]: models[name] };
    setModels(updatedModels);

    try {
      await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, layout: models[name] })
      });
    } catch (error) {
      console.error("Failed to duplicate model:", error);
    }
  };

  const renameModel = async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName || models[newName]) {
      setEditingModelName(null);
      return;
    }
    const { [oldName]: modelData, ...rest } = models;
    const updatedModels = { ...rest, [newName]: modelData };
    setModels(updatedModels);
    if (currentModelName === oldName) {
      setCurrentModelName(newName);
    }
    setEditingModelName(null);

    try {
      await fetch(`/api/layouts/${oldName}`, { method: 'DELETE' });
      await fetch('/api/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, layout: modelData })
      });
    } catch (error) {
      console.error("Failed to rename model:", error);
    }
  };

  const addElement = (type: ElementType) => {
    const colors = {
      machine: '#fff',
      workstation: '#fff',
      storage: '#fff',
      conveyor: '#2d5a27',
      area: '#fff',
      label: '#000',
      arrow: '#000',
      worker: '#fbbf24'
    };
    
    const newElement: LayoutElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 100,
      y: 100,
      width: type === 'conveyor' ? 400 : (type === 'worker' ? 40 : 100),
      height: type === 'conveyor' ? 40 : (type === 'worker' ? 40 : 100),
      name: type === 'worker' ? '' : `Mới ${type}`,
      status: 'active',
      color: colors[type],
      showCross: type === 'storage',
      task: type === 'worker' ? '' : undefined,
      level: type === 'worker' ? 0 : undefined
    };
    
    updateLayoutWithHistory(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const updateElement = (id: string, updates: Partial<LayoutElement>) => {
    updateLayoutWithHistory(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, ...updates } : el)
    }));
  };

  const updateElements = (ids: string[], updates: (el: LayoutElement) => Partial<LayoutElement>) => {
    updateLayoutWithHistory(prev => ({
      ...prev,
      elements: prev.elements.map(el => ids.includes(el.id) ? { ...el, ...updates(el) } : el)
    }));
  };

  const updateViewport = (x: number, y: number, zoom: number) => {
    setLayout(prev => ({
      ...prev,
      viewport: { x, y, zoom }
    }));
  };

  const resetView = () => {
    updateViewport(0, 0, 1);
  };

  const workerStats = useMemo(() => {
    const stats = {
      total: 0,
      levels: Array(8).fill(0),
      ctq: 0
    };
    layout.elements.forEach(el => {
      if (el.type === 'worker') {
        stats.total++;
        const level = Number(el.level || 0);
        if (level >= 0 && level <= 7) {
          stats.levels[Math.floor(level)]++;
        }
        if (el.isCTQ) stats.ctq++;
      }
    });
    return stats;
  }, [layout.elements]);

  const deleteElement = () => {
    if (selectedIds.length === 0) return;
    updateLayoutWithHistory(prev => ({
      ...prev,
      elements: prev.elements.filter(el => !selectedIds.includes(el.id)),
      connections: prev.connections.filter(c => !selectedIds.includes(c.fromId) && !selectedIds.includes(c.toId))
    }));
    setSelectedIds([]);
  };

  const saveAppName = async () => {
    if (tempAppName.trim()) {
      setAppName(tempAppName);
      localStorage.setItem('factory-app-name', tempAppName);
      try {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'app-name', value: tempAppName })
        });
      } catch (error) {
        console.error("Failed to save app name:", error);
      }
    }
    setIsEditingAppName(false);
  };

  // AI Assistant Logic
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAISend = async () => {
    if (!userInput.trim() || isAILoading) return;

    const input = userInput.trim().toLowerCase();
    const userMsg: ChatMessage = { role: 'user', text: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');

    // --- LOCAL COMMAND PROCESSOR (No API Key Required) ---
    if (input.includes('thêm') || input.includes('tạo')) {
      if (input.includes('công nhân') || input.includes('thợ')) {
        const nameMatch = userInput.match(/(?:thêm|tạo)\s+(?:công nhân|thợ)\s+(.+)/i);
        const name = nameMatch ? nameMatch[1] : 'Công nhân mới';
        
        updateLayoutWithHistory(prev => ({
          ...prev,
          elements: [...prev.elements, {
            id: `worker-${Date.now()}`,
            type: 'worker',
            x: 400, y: 400, width: 40, height: 40,
            name, task: 'Chưa phân công', level: 0, status: 'active', color: '#fbbf24'
          }]
        }));
        
        setChatMessages(prev => [...prev, { role: 'model', text: `✅ Đã thêm công nhân **${name}** vào layout.` }]);
        return;
      }
      if (input.includes('máy') || input.includes('thiết bị')) {
        updateLayoutWithHistory(prev => ({
          ...prev,
          elements: [...prev.elements, {
            id: `machine-${Date.now()}`,
            type: 'machine',
            x: 450, y: 450, width: 80, height: 60,
            name: 'Máy mới', status: 'idle', color: '#94a3b8'
          }]
        }));
        setChatMessages(prev => [...prev, { role: 'model', text: "✅ Đã thêm một thiết bị mới." }]);
        return;
      }
    }

    if (input.includes('xóa hết') || input.includes('dọn dẹp')) {
      updateLayoutWithHistory(prev => ({ ...prev, elements: [] }));
      setChatMessages(prev => [...prev, { role: 'model', text: "🗑️ Đã dọn dẹp toàn bộ layout." }]);
      return;
    }

    if (input.includes('lưu')) {
      handleSaveLayout();
      setChatMessages(prev => [...prev, { role: 'model', text: "💾 Đã lưu layout hiện tại." }]);
      return;
    }

    // --- AI FALLBACK (Requires API Key) ---
    const apiKey = process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      setChatMessages(prev => [...prev, 
        { role: 'model', text: "💡 **Chế độ Ngoại tuyến:** Tôi đã xử lý lệnh của bạn cục bộ. Để sử dụng tư vấn chuyên sâu hơn từ AI, bạn mới cần cấu hình `API Key`." }
      ]);
      return;
    }

    setIsAILoading(true);
    try {
      const genAI = new GoogleGenAI({ apiKey });
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: userInput }] }
        ],
        config: {
          systemInstruction: `Bạn là chuyên gia tư vấn thiết kế layout nhà máy và quản lý BOM cho ứng dụng FactoryFlow AI. 
          Thuật ngữ sử dụng:
          - "Tên công đoạn": Tên của máy móc hoặc bước sản xuất (hiển thị trên layout).
          - "Người đảm nhận": Tên nhân viên phụ trách công đoạn đó.
          - "CTQ (Critical to Quality)": Công đoạn quan trọng ảnh hưởng trực tiếp đến chất lượng sản phẩm.
          
          Dưới đây là thông tin về layout hiện tại:
          - Số lượng thiết bị: ${layout.elements.length}
          - Các loại thiết bị: ${Array.from(new Set(layout.elements.map(e => e.type))).join(', ')}
          - BOM: ${layout.bom ? layout.bom.name : 'Chưa tải lên'}
          
          Hãy trả lời ngắn gọn, chuyên nghiệp và hữu ích. Sử dụng Markdown để định dạng.`,
        }
      });

      const response = await model;
      const modelMsg: ChatMessage = { role: 'model', text: response.text || "Xin lỗi, tôi không thể trả lời lúc này." };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Đã xảy ra lỗi khi kết nối với AI Assistant." }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const handleBOMUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "❌ **Lỗi:** File quá lớn (trên 50MB). Vui lòng nén file hoặc chia nhỏ trước khi tải lên để đảm bảo hiệu suất." 
      }]);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      updateLayoutWithHistory(prev => ({
        ...prev,
        bom: {
          name: file.name,
          data: base64,
          type: isPdf ? 'pdf' : 'excel'
        }
      }));

      // Start automatic extraction
      extractWorkersFromBOM(base64, isPdf, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handlePdfBomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "❌ **Lỗi:** File quá lớn (trên 50MB). Vui lòng nén file hoặc chia nhỏ trước khi tải lên để đảm bảo hiệu suất." 
      }]);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "❌ **Lỗi:** Vui lòng chỉ tải lên file định dạng **PDF** cho mục này." 
      }]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateLayoutWithHistory(prev => ({
        ...prev,
        pdfBom: {
          name: file.name,
          data: base64
        }
      }));
      
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: `✅ **Đã tải lên file PDF:** \`${file.name}\`. Bạn có thể xem file này trong phần "BOM PDF (Xem)" ở thanh bên.` 
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleSchematicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "❌ **Lỗi:** File quá lớn (trên 50MB). Vui lòng nén file hoặc chia nhỏ trước khi tải lên để đảm bảo hiệu suất." 
      }]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateLayoutWithHistory(prev => ({
        ...prev,
        schematicPdf: { name: file.name, data: base64 }
      }));
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: `✅ **Đã tải lên Sơ đồ nguyên lý:** \`${file.name}\`.` 
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: "❌ **Lỗi:** File quá lớn (trên 50MB). Vui lòng nén file hoặc chia nhỏ trước khi tải lên để đảm bảo hiệu suất." 
      }]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      updateLayoutWithHistory(prev => ({
        ...prev,
        processPdf: { name: file.name, data: base64 }
      }));
      setChatMessages(prev => [...prev, { 
        role: 'model', 
        text: `✅ **Đã tải lên Chi tiết công đoạn:** \`${file.name}\`.` 
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handleModelImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: { name: string; data: string }[] = [];
    let processedCount = 0;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        newImages.push({ name: file.name, data: base64 });
        processedCount++;

        if (processedCount === files.length) {
          updateLayoutWithHistory(prev => ({
            ...prev,
            modelImages: [...(prev.modelImages || []), ...newImages]
          }));
          setChatMessages(prev => [...prev, { 
            role: 'model', 
            text: `✅ **Đã tải lên ${newImages.length} ảnh mẫu model.**` 
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeModelImage = (index: number) => {
    updateLayoutWithHistory(prev => ({
      ...prev,
      modelImages: (prev.modelImages || []).filter((_, i) => i !== index)
    }));
  };

  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
  const viewModelImage = (index: number) => {
    setViewingImageIndex(index);
    setIsModelImageModalOpen(true);
  };

  const viewSchematic = () => setIsSchematicModalOpen(true);
  const viewProcess = () => setIsProcessModalOpen(true);

  const extractWorkersFromBOM = async (base64Data: string, isPdf: boolean, fileName: string) => {
    setIsExtractingBOM(true);
    try {
      const base64Content = base64Data.split(',')[1];
      
      if (isPdf) {
        setChatMessages(prev => [...prev, { 
          role: 'model', 
          text: "⚠️ **Lưu ý:** Hiện tại hệ thống chỉ hỗ trợ phân tích tự động ngoại tuyến cho file **Excel (.xlsx, .xls)** và **CSV**. Đối với file PDF, vui lòng sử dụng API Key để AI hỗ trợ đọc dữ liệu." 
        }]);
        setIsExtractingBOM(false);
        return;
      }

      // --- LOCAL OFFLINE PARSING (Excel/CSV) ---
      try {
        const binaryStr = atob(base64Content);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }

        let jsonData: any[] = [];

        if (fileName.toLowerCase().endsWith('.csv')) {
          const csvText = new TextDecoder().decode(bytes);
          const results = Papa.parse(csvText, { header: true, skipEmptyLines: true });
          jsonData = results.data;
        } else {
          const workbook = XLSX.read(bytes, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          jsonData = XLSX.utils.sheet_to_json(worksheet);
        }

        if (jsonData.length > 0) {
          const mappedWorkers = jsonData.map((row: any) => {
            const keys = Object.keys(row);
            const findVal = (patterns: string[]) => {
              const key = keys.find(k => patterns.some(p => k.toLowerCase().includes(p.toLowerCase())));
              return key ? row[key] : null;
            };

            return {
              no: parseInt(findVal(['stt', 'no', 'id', 'số thứ tự', 'index']) || '0'),
              name: String(findVal(['tên công đoạn', 'công đoạn', 'thiết bị', 'máy', 'process', 'operation', 'station', 'vị trí']) || ''),
              task: String(findVal(['người đảm nhận', 'người', 'nhân viên', 'worker', 'name', 'person', 'họ tên', 'đảm nhận']) || ''),
              level: parseInt(findVal(['bậc', 'level', 'kỹ năng', 'grade', 'rank']) || '0'),
              operationTime: String(findVal(['thời gian', 'time', 'cycle', 'op time', 'thao tác']) || ''),
              isCTQ: String(findVal(['ctq', 'quan trọng', 'critical', 'chất lượng']) || '').toLowerCase().includes('x') || 
                     String(findVal(['ctq', 'quan trọng', 'critical', 'chất lượng']) || '').toLowerCase() === 'true' ||
                     String(findVal(['ctq', 'quan trọng', 'critical', 'chất lượng']) || '').toLowerCase() === '1'
            };
          }).filter(w => w.name && w.name !== 'undefined' && w.name !== '' && w.name.length > 1);

          if (mappedWorkers.length > 0) {
            applyExtractedWorkers(mappedWorkers, fileName);
            setChatMessages(prev => [...prev, { 
              role: 'model', 
              text: `📊 **Phân tích hoàn tất!** Tôi đã tìm thấy **${mappedWorkers.length}** nhân sự từ file \`${fileName}\` bằng bộ lọc dữ liệu cục bộ.` 
            }]);
          } else {
            setChatMessages(prev => [...prev, { 
              role: 'model', 
              text: `❌ **Không tìm thấy dữ liệu:** Tôi đã đọc file \`${fileName}\` nhưng không nhận diện được các cột tên hoặc công việc. Vui lòng kiểm tra lại định dạng file.` 
            }]);
          }
        }
      } catch (localError) {
        console.error("Local parsing error:", localError);
        setChatMessages(prev => [...prev, { 
          role: 'model', 
          text: `❌ **Lỗi đọc file:** Đã xảy ra lỗi khi cố gắng phân tích file \`${fileName}\` cục bộ.` 
        }]);
      }
    } catch (error) {
      console.error("BOM Extraction Error:", error);
    } finally {
      setIsExtractingBOM(false);
    }
  };

  const applyExtractedWorkers = (workers: any[], fileName: string) => {
    if (!Array.isArray(workers) || workers.length === 0) return;
    
    updateLayoutWithHistory(prev => {
      const newElements = [...prev.elements];
      let updatedCount = 0;
      let addedCount = 0;

      workers.forEach((w: any) => {
        // Try to find existing worker by sequenceNumber first, then name
        const existingIndex = newElements.findIndex(el => 
          el.type === 'worker' && 
          ((w.no && el.sequenceNumber === w.no) || 
           (el.name && el.name.toLowerCase() === w.name.toLowerCase()))
        );

        if (existingIndex !== -1) {
          newElements[existingIndex] = {
            ...newElements[existingIndex],
            name: w.name || newElements[existingIndex].name,
            task: w.task || newElements[existingIndex].task,
            level: typeof w.level === 'number' ? w.level : newElements[existingIndex].level,
            sequenceNumber: w.no || newElements[existingIndex].sequenceNumber,
            operationTime: w.operationTime || newElements[existingIndex].operationTime,
            isCTQ: w.isCTQ !== undefined ? w.isCTQ : newElements[existingIndex].isCTQ,
            analysisTime: new Date().toLocaleString('vi-VN')
          };
          updatedCount++;
        } else {
          // Add new worker at a position based on sequence number if it's a "fixed position"
          // Grid layout: 5 workers per row
          const row = Math.floor((w.no || (newElements.filter(e => e.type === 'worker').length + 1) - 1) / 5);
          const col = (w.no || (newElements.filter(e => e.type === 'worker').length + 1) - 1) % 5;
          
          const newWorker: LayoutElement = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'worker',
            x: 350 + (col * 60),
            y: 400 + (row * 80),
            width: 40,
            height: 40,
            name: w.name,
            task: w.task,
            level: w.level || 0,
            sequenceNumber: w.no,
            operationTime: w.operationTime,
            isCTQ: w.isCTQ,
            analysisTime: new Date().toLocaleString('vi-VN'),
            status: 'active',
            color: '#fbbf24'
          };
          newElements.push(newWorker);
          addedCount++;
        }
      });

      setChatMessages(prevMsgs => [...prevMsgs, {
        role: 'model',
        text: `✨ **Đã đồng bộ dữ liệu BOM!**\n\nTôi đã xử lý file \`${fileName}\` và tìm thấy ${workers.length} công đoạn:\n- Cập nhật: ${updatedCount} vị trí\n- Thêm mới: ${addedCount} vị trí\n\nCác thông tin về **tên công đoạn**, **người đảm nhận**, bậc thợ và thời gian thao tác đã được đồng bộ vào layout.`
      }]);

      return { ...prev, elements: newElements };
    });
  };

  const viewBOM = () => {
    if (!layout.bom) return;
    
    if (layout.bom.type === 'pdf') {
      setBomData([]); // Clear excel data
      setIsBOMModalOpen(true);
      return;
    }

    try {
      const base64Data = layout.bom.data.split(',')[1];
      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const workbook = XLSX.read(bytes, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setBomData(data);
      setIsBOMModalOpen(true);
    } catch (error) {
      console.error("Error reading BOM file:", error);
      alert("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng.");
    }
  };

  const viewPdfBom = () => {
    if (!layout.pdfBom) return;
    setIsPdfBomModalOpen(true);
  };

  const exportBOMToPDF = () => {
    if (bomData.length === 0) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Check for title row
    const isTitleRow = bomData[0] && bomData[0].filter((c: any) => c !== null && c !== '').length <= 2;
    let startY = 15;

    if (isTitleRow) {
      const title = String(bomData[0].find((c: any) => c !== null && c !== '') || 'BILL OF MATERIALS');
      doc.setFontSize(16);
      doc.text(title, 148, 15, { align: 'center' });
      startY = 25;
    }

    const headerRow = isTitleRow ? bomData[1] : bomData[0];
    const bodyRows = isTitleRow ? bomData.slice(2) : bomData.slice(1);

    autoTable(doc, {
      head: [headerRow.slice(0, 8).map((h: any) => String(h || ''))],
      body: bodyRows.map((row: any[]) => row.slice(0, 8).map((c: any) => String(c || ''))),
      startY: startY,
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [40, 40, 40],
        lineWidth: 0.1,
        font: 'helvetica', // Default font, might have issues with Vietnamese but standard for PDF
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { cellWidth: 40 },
        2: { halign: 'center', cellWidth: 20 },
        3: { cellWidth: 60 },
        4: { halign: 'center', cellWidth: 20 },
        5: { cellWidth: 40 },
        6: { cellWidth: 40 },
        7: { halign: 'center', cellWidth: 20 },
      },
      theme: 'grid',
      margin: { top: startY },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(`Trang ${data.pageNumber}`, 280, 200);
      }
    });

    doc.save(`${layout.bom?.name.replace(/\.[^/.]+$/, "") || 'BOM'}.pdf`);
  };

  const selectedElement = layout.elements.find(el => selectedIds.length === 1 && el.id === selectedIds[0]);

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 overflow-hidden whitespace-nowrap"
          >
            <div className="w-64 flex flex-col h-full overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div className="space-y-6">
                  <div className="relative">
                  <button 
                    onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
                    className="w-full flex items-center justify-between p-2 text-sm font-semibold bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FolderOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="truncate">{currentModelName}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isModelMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isModelMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto"
                      >
                        <div className="p-2 space-y-1">
                          {Object.keys(models).map(name => (
                            <div key={name} className="flex items-center justify-between group px-2 py-1.5 rounded-lg hover:bg-slate-50">
                              {editingModelName === name ? (
                                <div className="flex-1 flex items-center gap-1">
                                  <input 
                                    autoFocus
                                    type="text"
                                    value={tempModelName}
                                    onChange={(e) => setTempModelName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') renameModel(name, tempModelName);
                                      if (e.key === 'Escape') setEditingModelName(null);
                                    }}
                                    className="flex-1 text-xs p-1 rounded border border-indigo-300 outline-none"
                                  />
                                  <button 
                                    onClick={() => renameModel(name, tempModelName)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => loadModel(name)}
                                    className={`flex-1 text-left text-xs font-medium truncate ${currentModelName === name ? 'text-indigo-600' : 'text-slate-600'}`}
                                  >
                                    {name}
                                  </button>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                      onClick={() => {
                                        setEditingModelName(name);
                                        setTempModelName(name);
                                      }}
                                      className="p-1 text-slate-400 hover:text-indigo-600"
                                      title="Đổi tên"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={() => duplicateModel(name)}
                                      className="p-1 text-slate-400 hover:text-indigo-600"
                                      title="Nhân bản"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    {Object.keys(models).length > 1 && (
                                      <button 
                                        onClick={() => deleteModel(name)}
                                        className="p-1 text-slate-400 hover:text-red-500"
                                        title="Xóa"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="p-2 border-t border-slate-100 bg-slate-50">
                          <div className="flex gap-1">
                            <input 
                              type="text" 
                              placeholder="Tên model mới..."
                              value={newModelName}
                              onChange={(e) => setNewModelName(e.target.value)}
                              className="flex-1 text-[10px] p-1.5 rounded border border-slate-200 outline-none"
                            />
                            <button 
                              onClick={saveNewModel}
                              className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              <FilePlus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Worker Stats Dashboard - Moved to top for priority */}
                <section className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-indigo-600" />
                      <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nhân sự Model</h2>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {workerStats.ctq > 0 && (
                        <div className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black">
                          CTQ: {workerStats.ctq}
                        </div>
                      )}
                      <div className="bg-slate-900 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                        Tổng: {workerStats.total}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {workerStats.levels.map((count, lvl) => (
                      <div key={lvl} className="flex flex-col items-center gap-0.5 group">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-transform group-hover:scale-110"
                          style={{ 
                            backgroundColor: LEVEL_COLORS[lvl],
                            boxShadow: count > 0 ? `0 2px 8px ${LEVEL_COLORS[lvl]}44` : 'none',
                            opacity: count > 0 ? 1 : 0.3
                          }}
                        >
                          {lvl}
                        </div>
                        <span className={`text-[9px] font-black ${count > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* BOM Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Quản lý BOM</p>
                    {layout.bom && (
                      <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold">Đã lưu</span>
                    )}
                  </div>
                  
                  {layout.bom ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={viewBOM}
                        disabled={isExtractingBOM}
                        className="flex items-center gap-2 p-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all border border-indigo-100 group disabled:opacity-50"
                      >
                        {isExtractingBOM ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3 flex-shrink-0" />
                        )}
                        <span className="text-[10px] font-bold truncate flex-1 text-left">
                          {isExtractingBOM ? 'Đang trích xuất...' : layout.bom.name}
                        </span>
                        {!isExtractingBOM && <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isExtractingBOM}
                        className="text-[9px] text-slate-400 hover:text-indigo-600 font-bold flex items-center gap-1 px-1 disabled:opacity-50"
                      >
                        <Upload className="w-2.5 h-2.5" /> Thay đổi BOM
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                    >
                      <Upload className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600">Tải lên BOM</span>
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleBOMUpload}
                    accept=".xlsx, .xls, .pdf"
                    className="hidden"
                  />
                </div>

                {/* PDF BOM Viewer Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">BOM PDF (Xem)</p>
                    {layout.pdfBom && (
                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">Đã tải</span>
                    )}
                  </div>
                  
                  {layout.pdfBom ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={viewPdfBom}
                        className="flex items-center gap-2 p-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 group"
                      >
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="text-[10px] font-bold truncate flex-1 text-left">
                          {layout.pdfBom.name}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button 
                        onClick={() => pdfBomInputRef.current?.click()}
                        className="text-[9px] text-slate-400 hover:text-blue-600 font-bold flex items-center gap-1 px-1"
                      >
                        <Upload className="w-2.5 h-2.5" /> Thay đổi PDF
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => pdfBomInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <Upload className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-blue-600">Tải lên PDF BOM</span>
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={pdfBomInputRef}
                    onChange={handlePdfBomUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>

                {/* Schematic Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sơ đồ nguyên lý</p>
                    {layout.schematicPdf && (
                      <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Đã tải</span>
                    )}
                  </div>
                  
                  {layout.schematicPdf ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={viewSchematic}
                        className="flex items-center gap-2 p-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all border border-orange-100 group"
                      >
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="text-[10px] font-bold truncate flex-1 text-left">
                          {layout.schematicPdf.name}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button 
                        onClick={() => schematicInputRef.current?.click()}
                        className="text-[9px] text-slate-400 hover:text-orange-600 font-bold flex items-center gap-1 px-1"
                      >
                        <Upload className="w-2.5 h-2.5" /> Thay đổi PDF
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => schematicInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                    >
                      <Upload className="w-3 h-3 text-slate-400 group-hover:text-orange-500" />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-orange-600">Tải lên Sơ đồ</span>
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={schematicInputRef}
                    onChange={handleSchematicUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>

                {/* Process Details Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chi tiết công đoạn</p>
                    {layout.processPdf && (
                      <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">Đã tải</span>
                    )}
                  </div>
                  
                  {layout.processPdf ? (
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={viewProcess}
                        className="flex items-center gap-2 p-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all border border-purple-100 group"
                      >
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        <span className="text-[10px] font-bold truncate flex-1 text-left">
                          {layout.processPdf.name}
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button 
                        onClick={() => processInputRef.current?.click()}
                        className="text-[9px] text-slate-400 hover:text-purple-600 font-bold flex items-center gap-1 px-1"
                      >
                        <Upload className="w-2.5 h-2.5" /> Thay đổi PDF
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => processInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
                    >
                      <Upload className="w-3 h-3 text-slate-400 group-hover:text-purple-500" />
                      <span className="text-[10px] font-bold text-slate-500 group-hover:text-purple-600">Tải lên Công đoạn</span>
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={processInputRef}
                    onChange={handleProcessUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>

                {/* Model Image Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ảnh mẫu model</p>
                    {layout.modelImages && layout.modelImages.length > 0 && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                        {layout.modelImages.length} ảnh
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {layout.modelImages?.map((img, idx) => (
                      <div key={idx} className="flex items-center gap-1 group">
                        <button 
                          onClick={() => viewModelImage(idx)}
                          className="flex-1 flex items-center gap-2 p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 overflow-hidden"
                        >
                          <ImageIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="text-[10px] font-bold truncate text-left">
                            {img.name}
                          </span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
                        </button>
                        <button 
                          onClick={() => removeModelImage(idx)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Xóa ảnh"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => modelImageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                  >
                    <Upload className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600">
                      {layout.modelImages && layout.modelImages.length > 0 ? 'Thêm ảnh mẫu' : 'Tải lên Ảnh mẫu'}
                    </span>
                  </button>
                  
                  <input 
                    type="file" 
                    ref={modelImageInputRef}
                    onChange={handleModelImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>

                <section>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase mb-3 px-2">Thêm thiết bị</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => addElement('machine')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <Cpu className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 mb-1" />
                      <span className="text-[10px] font-medium">Thiết bị</span>
                    </button>
                    <button onClick={() => addElement('conveyor')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <ArrowRightLeft className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 mb-1" />
                      <span className="text-[10px] font-medium">Băng tải</span>
                    </button>
                    <button onClick={() => addElement('area')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <Factory className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 mb-1" />
                      <span className="text-[10px] font-medium">Khu vực</span>
                    </button>
                    <button onClick={() => addElement('label')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <Plus className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 mb-1" />
                      <span className="text-[10px] font-medium">Ghi chú</span>
                    </button>
                    <button onClick={() => addElement('arrow')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <ArrowRightLeft className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 mb-1" />
                      <span className="text-[10px] font-medium">Mũi tên</span>
                    </button>
                    <button onClick={() => addElement('worker')} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                      <User className="w-6 h-6 text-slate-600 group-hover:text-indigo-600 mb-1" />
                      <span className="text-[10px] font-medium">Công nhân</span>
                    </button>
                  </div>
                </section>

                {selectedElement && (
                  <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xs font-bold text-slate-700 uppercase">Cấu hình</h2>
                      <button onClick={deleteElement} className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      {selectedElement.type === 'worker' && (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Số thứ tự (BOM)</label>
                          <input 
                            type="number" 
                            value={selectedElement.sequenceNumber || ''}
                            onChange={(e) => updateElement(selectedElement.id, { sequenceNumber: parseInt(e.target.value) || undefined })}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ví dụ: 1, 2, 3..."
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">Tên công đoạn</label>
                        <input 
                          type="text" 
                          value={selectedElement.name}
                          onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                          className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      {selectedElement.type === 'worker' && (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Người đảm nhận</label>
                          <input 
                            type="text" 
                            value={selectedElement.task || ''}
                            onChange={(e) => updateElement(selectedElement.id, { task: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ví dụ: Nguyễn Văn A..."
                          />
                        </div>
                      )}
                      {selectedElement.type === 'worker' && (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Thời gian thao tác</label>
                          <input 
                            type="text" 
                            value={selectedElement.operationTime || ''}
                            onChange={(e) => updateElement(selectedElement.id, { operationTime: e.target.value })}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Ví dụ: 30s, 1.5m..."
                          />
                        </div>
                      )}
                      {selectedElement.type === 'worker' && (
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Bậc công nhân (0-7)</label>
                          <div className="flex gap-1 overflow-x-auto pb-1">
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(lvl => (
                              <button
                                key={lvl}
                                onClick={() => updateElement(selectedElement.id, { level: lvl })}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${
                                  selectedElement.level === lvl 
                                    ? 'border-indigo-600 ring-2 ring-indigo-200 scale-110' 
                                    : 'border-slate-200 hover:bg-slate-100'
                                }`}
                                style={{ 
                                  backgroundColor: LEVEL_COLORS[lvl],
                                  color: lvl === 7 || lvl === 6 ? '#fff' : '#000'
                                }}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Dài (mm)</label>
                          <input 
                            type="number" 
                            value={Math.round(selectedElement.width * MM_PER_PX)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) updateElement(selectedElement.id, { width: val / MM_PER_PX });
                            }}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Rộng (mm)</label>
                          <input 
                            type="number" 
                            value={Math.round(selectedElement.height * MM_PER_PX)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) updateElement(selectedElement.id, { height: val / MM_PER_PX });
                            }}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Cỡ chữ</label>
                          <input 
                            type="number" 
                            value={selectedElement.fontSize || 10}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val)) updateElement(selectedElement.id, { fontSize: val });
                            }}
                            className="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 block mb-1">Xoay (độ)</label>
                          <div className="flex gap-1">
                            <input 
                              type="number" 
                              value={selectedElement.rotation || 0}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val)) updateElement(selectedElement.id, { rotation: val });
                              }}
                              className="w-full text-sm p-2 rounded-lg border border-slate-200 outline-none"
                            />
                            <button 
                              onClick={() => updateElement(selectedElement.id, { rotation: ((selectedElement.rotation || 0) + 90) % 360 })}
                              className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                              title="Xoay 90°"
                            >
                              <RotateCw className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                )}
                {selectedIds.length > 1 && (
                  <motion.section 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-xs font-bold text-slate-700 uppercase">Đã chọn {selectedIds.length} đối tượng</h2>
                      <button onClick={deleteElement} className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Bạn có thể di chuyển hoặc xóa các đối tượng đã chọn cùng lúc.</p>
                  </motion.section>
                )}
                </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Floating Controls */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-xl shadow-lg border border-slate-200 transition-all text-slate-600 active:scale-95"
            title={isSidebarOpen ? "Ẩn thanh công cụ" : "Hiện thanh công cụ"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
          </button>
          
          <button 
            onClick={undo}
            disabled={history.length === 0}
            className="p-2.5 bg-white hover:bg-slate-50 rounded-xl shadow-lg border border-slate-200 transition-all text-slate-600 disabled:opacity-50 active:scale-95"
            title="Hoàn tác (Ctrl+Z)"
          >
            <ArrowRightLeft className="w-5 h-5 rotate-180" />
          </button>

          <button 
            onClick={() => setIsAIChatOpen(!isAIChatOpen)}
            className={`p-2.5 rounded-xl shadow-lg border transition-all active:scale-95 flex items-center gap-2 ${
              isAIChatOpen ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="AI Assistant"
          >
            <Sparkles className={`w-5 h-5 ${isAIChatOpen ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-bold pr-1">AI Assistant</span>
          </button>
        </div>

        <div className="flex-1 bg-slate-50 relative flex">
          <div className="flex-1 relative">
            <Canvas 
              layout={layout} 
              onUpdateElement={updateElement} 
              onUpdateElements={updateElements}
              onSelectElements={setSelectedIds}
              onUpdateViewport={updateViewport}
              selectedIds={selectedIds}
            />

            <AnimatePresence>
              {!isSidebarOpen && selectedElement && selectedElement.type === 'worker' && (
                <WorkerProfilePopup 
                  element={selectedElement} 
                  onClose={() => setSelectedIds([])} 
                  onUpdate={updateElement}
                />
              )}
            </AnimatePresence>
          </div>

          {/* AI Chat Sidebar */}
          <AnimatePresence>
            {isAIChatOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 350, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-white border-l border-slate-200 flex flex-col shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 p-1.5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-black text-slate-800 text-sm tracking-tight">AI Assistant</h3>
                  </div>
                  <button 
                    onClick={() => setIsAIChatOpen(false)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-indigo-200" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Xin chào! Tôi có thể giúp gì cho bạn?</p>
                        <p className="text-xs text-slate-400 mt-1">Hỏi tôi về cách tối ưu layout hoặc phân tích BOM của bạn.</p>
                      </div>
                      <div className="grid grid-cols-1 gap-2 w-full">
                        <button 
                          onClick={() => setUserInput("Hãy phân tích layout hiện tại của tôi.")}
                          className="text-[10px] p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 text-left transition-colors"
                        >
                          "Hãy phân tích layout hiện tại của tôi."
                        </button>
                        <button 
                          onClick={() => setUserInput("Làm thế nào để tối ưu luồng sản xuất?")}
                          className="text-[10px] p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 text-left transition-colors"
                        >
                          "Làm thế nào để tối ưu luồng sản xuất?"
                        </button>
                      </div>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                        msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                      }`}>
                        <div className="markdown-body">
                          <Markdown>{msg.text}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isAILoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI đang suy nghĩ...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-slate-100">
                  <div className="relative">
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAISend();
                        }
                      }}
                      placeholder="Nhập câu hỏi tại đây..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pr-12 text-xs outline-none focus:border-indigo-500 transition-colors resize-none h-20"
                    />
                    <button 
                      onClick={handleAISend}
                      disabled={!userInput.trim() || isAILoading}
                      className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modals */}
          <BOMModal 
            isOpen={isBOMModalOpen} 
            onClose={() => setIsBOMModalOpen(false)} 
            layout={layout} 
            bomData={bomData} 
            exportBOMToPDF={exportBOMToPDF} 
          />

          <PdfBomModal 
            isOpen={isPdfBomModalOpen} 
            onClose={() => setIsPdfBomModalOpen(false)} 
            layout={layout} 
          />

          <GenericPdfModal
            isOpen={isSchematicModalOpen}
            onClose={() => setIsSchematicModalOpen(false)}
            data={layout.schematicPdf?.data}
            name={layout.schematicPdf?.name}
            title="Sơ đồ nguyên lý"
          />

          <GenericPdfModal
            isOpen={isProcessModalOpen}
            onClose={() => setIsProcessModalOpen(false)}
            data={layout.processPdf?.data}
            name={layout.processPdf?.name}
            title="Chi tiết công đoạn"
          />

          <ImageModal 
            isOpen={isModelImageModalOpen} 
            onClose={() => {
              setIsModelImageModalOpen(false);
              setViewingImageIndex(null);
            }} 
            data={viewingImageIndex !== null ? layout.modelImages?.[viewingImageIndex]?.data : undefined}
            name={viewingImageIndex !== null ? layout.modelImages?.[viewingImageIndex]?.name : undefined}
            title="Ảnh mẫu model" 
          />
        </div>
      </main>
    </div>
  );
}
