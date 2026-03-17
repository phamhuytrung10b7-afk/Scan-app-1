import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, X, Check, RotateCw } from 'lucide-react';
import { LayoutElement } from './types';
import { LEVEL_COLORS } from './constants';

interface WorkerProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  worker: LayoutElement | null;
  onSave: (updated: LayoutElement) => void;
}

const WorkerProfilePopup: React.FC<WorkerProfilePopupProps> = React.memo(({ isOpen, onClose, worker, onSave }) => {
  if (!isOpen || !worker) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="absolute top-4 right-4 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-40"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">Hồ sơ nhân sự</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {worker.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Họ và tên</label>
              <input 
                type="text" 
                value={worker.name}
                onChange={(e) => onSave({ ...worker, name: e.target.value })}
                className="w-full text-sm p-3 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Nhập tên nhân viên..."
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Công việc / Task</label>
              <input 
                type="text" 
                value={worker.task || ''}
                onChange={(e) => onSave({ ...worker, task: e.target.value })}
                className="w-full text-sm p-3 bg-slate-50 rounded-xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="Mô tả công việc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">Bậc nghề</label>
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => onSave({ ...worker, level: lvl })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border ${
                        worker.level === lvl 
                          ? 'border-indigo-600 ring-2 ring-indigo-200 scale-110' 
                          : 'border-slate-200 hover:bg-slate-100'
                      }`}
                      style={{ 
                        backgroundColor: LEVEL_COLORS[lvl as keyof typeof LEVEL_COLORS] as string,
                        color: lvl === 'L7' || lvl === 'L6' ? '#fff' : '#000'
                      }}
                    >
                      {lvl.replace('L', '')}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1.5">CTQ</label>
                <button 
                  onClick={() => onSave({ ...worker, isCTQ: !worker.isCTQ })}
                  className={`w-full py-2 rounded-xl text-[10px] font-bold transition-all border ${
                    worker.isCTQ 
                      ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {worker.isCTQ ? 'ĐANG LÀ CTQ' : 'ĐẶT LÀ CTQ'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Đóng hồ sơ
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default WorkerProfilePopup;
