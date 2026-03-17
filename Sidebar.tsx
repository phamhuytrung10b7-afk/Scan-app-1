import React from 'react';
import { motion } from 'motion/react';
import { 
  Menu, ChevronLeft, Layout, Plus, Trash2, Copy, Edit3, 
  Save, Download, Upload, FileText, MessageSquare, 
  MousePointer2, Square, Type, ArrowRight, User, 
  Settings, HelpCircle, LogOut, Search, MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { FactoryLayout } from './types';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  models: FactoryLayout[];
  currentModelId: string;
  setCurrentModelId: (id: string) => void;
  onNewModel: () => void;
  onDeleteModel: (id: string) => void;
  onDuplicateModel: (id: string) => void;
  onRenameModel: (id: string, name: string) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBOMUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPdfBomUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSchematicUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProcessUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModelImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewBOM: () => void;
  onViewPdfBom: () => void;
  onViewSchematic: () => void;
  onViewProcess: () => void;
  onViewModelImage: () => void;
  onToggleChat: () => void;
  tool: string;
  setTool: (t: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  models,
  currentModelId,
  setCurrentModelId,
  onNewModel,
  onDeleteModel,
  onDuplicateModel,
  onRenameModel,
  onSave,
  onExport,
  onImport,
  onBOMUpload,
  onPdfBomUpload,
  onSchematicUpload,
  onProcessUpload,
  onModelImageUpload,
  onViewBOM,
  onViewPdfBom,
  onViewSchematic,
  onViewProcess,
  onViewModelImage,
  onToggleChat,
  tool,
  setTool
}) => {
  return (
    <motion.div
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className="bg-white border-r border-slate-200 flex flex-col shadow-xl z-20 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
            <Layout className="w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden whitespace-nowrap">
              <h1 className="font-black text-slate-800 text-lg tracking-tighter leading-none">FACTORY</h1>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Layout Pro v2</p>
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all active:scale-90"
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        <div>
          {isSidebarOpen && (
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dự án của bạn</h2>
              <button 
                onClick={onNewModel}
                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="space-y-1">
            {models.map(m => (
              <div key={m.id} className="group relative">
                <button
                  onClick={() => setCurrentModelId(m.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${
                    currentModelId === m.id 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <FileText className={`w-5 h-5 shrink-0 ${currentModelId === m.id ? 'text-indigo-400' : 'text-slate-300'}`} />
                  {isSidebarOpen && (
                    <span className="text-sm font-bold truncate pr-16">{m.name}</span>
                  )}
                </button>
                {isSidebarOpen && currentModelId === m.id && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt('Nhập tên mới:', m.name);
                        if (newName) onRenameModel(m.id, newName);
                      }}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDuplicateModel(m.id); }}
                      className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteModel(m.id); }}
                      className="p-1.5 hover:bg-red-500/50 rounded-lg text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          {isSidebarOpen && (
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Công cụ vẽ</h2>
          )}
          <div className="grid grid-cols-1 gap-1">
            {[
              { id: 'select', icon: MousePointer2, label: 'Chọn' },
              { id: 'rect', icon: Square, label: 'Hình khối' },
              { id: 'text', icon: Type, label: 'Nhãn' },
              { id: 'arrow', icon: ArrowRight, label: 'Mũi tên' },
              { id: 'worker', icon: User, label: 'Công nhân' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                  tool === t.id 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <t.icon className={`w-5 h-5 shrink-0 ${tool === t.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                {isSidebarOpen && <span className="text-sm font-bold">{t.label}</span>}
              </button>
            ))}
          </div>
        </div>

        <div>
          {isSidebarOpen && (
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Tệp tin & BOM</h2>
          )}
          <div className="space-y-1">
            <button onClick={onSave} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Save className="w-5 h-5 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Lưu dự án</span>}
            </button>
            <button onClick={onExport} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Download className="w-5 h-5 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Xuất file .json</span>}
            </button>
            <label className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
              <Upload className="w-5 h-5 shrink-0 text-slate-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Nhập file .json</span>}
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
            <div className="h-px bg-slate-100 my-2 mx-2" />
            <label className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
              <FileText className="w-5 h-5 shrink-0 text-indigo-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Tải BOM (Excel/CSV)</span>}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={onBOMUpload} className="hidden" />
            </label>
            <button onClick={onViewBOM} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Layout className="w-5 h-5 shrink-0 text-indigo-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Xem bảng BOM</span>}
            </button>
            <div className="h-px bg-slate-100 my-2 mx-2" />
            <label className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
              <FileText className="w-5 h-5 shrink-0 text-blue-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Tải PDF BOM (Xem)</span>}
              <input type="file" accept=".pdf" onChange={onPdfBomUpload} className="hidden" />
            </label>
            <button onClick={onViewPdfBom} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Layout className="w-5 h-5 shrink-0 text-blue-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Xem PDF BOM</span>}
            </button>
            <div className="h-px bg-slate-100 my-2 mx-2" />
            
            <label className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
              <FileText className="w-5 h-5 shrink-0 text-orange-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Tải Sơ đồ nguyên lý (PDF)</span>}
              <input type="file" accept=".pdf" onChange={onSchematicUpload} className="hidden" />
            </label>
            <button onClick={onViewSchematic} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Layout className="w-5 h-5 shrink-0 text-orange-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Xem Sơ đồ nguyên lý</span>}
            </button>
            
            <div className="h-px bg-slate-100 my-2 mx-2" />
            
            <label className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
              <FileText className="w-5 h-5 shrink-0 text-purple-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Tải Chi tiết công đoạn (PDF)</span>}
              <input type="file" accept=".pdf" onChange={onProcessUpload} className="hidden" />
            </label>
            <button onClick={onViewProcess} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Layout className="w-5 h-5 shrink-0 text-purple-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Xem Chi tiết công đoạn</span>}
            </button>
            
            <div className="h-px bg-slate-100 my-2 mx-2" />
            
            <label className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all cursor-pointer">
              <ImageIcon className="w-5 h-5 shrink-0 text-emerald-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Tải Ảnh mẫu model</span>}
              <input type="file" accept="image/*" onChange={onModelImageUpload} className="hidden" />
            </label>
            <button onClick={onViewModelImage} className="w-full flex items-center gap-3 p-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all">
              <Layout className="w-5 h-5 shrink-0 text-emerald-400" />
              {isSidebarOpen && <span className="text-sm font-bold">Xem Ảnh mẫu model</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <button 
          onClick={onToggleChat}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <MessageSquare className="w-5 h-5 shrink-0" />
          {isSidebarOpen && <span className="text-sm font-bold">Trợ lý AI</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
