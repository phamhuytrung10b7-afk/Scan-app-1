import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, X, AlertCircle, Download, Image as ImageIcon } from 'lucide-react';
import { FactoryLayout } from './types';
import SafePdfViewer from './SafePdfViewer';

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: FactoryLayout;
  bomData: any[];
  exportBOMToPDF: () => void;
}

export const BOMModal: React.FC<BOMModalProps> = ({ isOpen, onClose, layout, bomData, exportBOMToPDF }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden ${layout.bom?.type === 'pdf' ? 'rounded-none' : 'rounded-none'}`}
          >
            <div className={`border-b border-slate-100 flex items-center justify-between bg-slate-50/50 ${layout.bom?.type === 'pdf' ? 'p-3' : 'p-4 md:p-6'}`}>
              <div className="flex items-center gap-4">
                <div className={`${layout.bom?.type === 'pdf' ? 'p-1.5' : 'p-3'} bg-indigo-100 rounded-2xl`}>
                  <FileText className={`${layout.bom?.type === 'pdf' ? 'w-4 h-4' : 'w-6 h-6'} text-indigo-600`} />
                </div>
                <div>
                  <h2 className={`${layout.bom?.type === 'pdf' ? 'text-sm' : 'text-xl'} font-black text-slate-800 tracking-tight`}>Danh mục vật tư (BOM)</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{layout.bom?.name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 transition-all hover:text-slate-600 active:scale-90">
                <X className={`${layout.bom?.type === 'pdf' ? 'w-5 h-5' : 'w-6 h-6'}`} />
              </button>
            </div>
            
            <div className={`flex-1 overflow-auto bg-slate-50 ${layout.bom?.type === 'pdf' ? 'p-0' : 'p-6'}`}>
              {layout.bom?.type === 'pdf' ? (
                <div className="w-full h-full overflow-hidden">
                  <SafePdfViewer base64Data={layout.bom.data} title="BOM PDF Viewer" />
                </div>
              ) : bomData.length > 0 ? (
                <div className="inline-block min-w-full align-middle">
                  <div className="bg-white p-8 shadow-inner rounded-sm border border-slate-300">
                    <table className="min-w-full border-collapse bom-table text-slate-900">
                      <tbody>
                        {bomData.map((row: any[], rowIdx: number) => {
                          const isTitleRow = rowIdx === 0 && row.filter(c => c !== null && c !== '').length <= 2;
                          if (isTitleRow) {
                            return (
                              <tr key={rowIdx}>
                                <td colSpan={8} className="text-center py-6 text-3xl font-black uppercase tracking-tighter border-b-2 border-slate-900">
                                  {row.find(c => c !== null && c !== '')}
                                </td>
                              </tr>
                            );
                          }
                          const isHeaderRow = rowIdx === 1 || (rowIdx === 0 && !isTitleRow);
                          return (
                            <tr key={rowIdx} className={isHeaderRow ? "bg-slate-100" : "hover:bg-slate-50 transition-colors"}>
                              {row.map((cell: any, cellIdx: number) => {
                                if (cellIdx >= 8) return null;
                                const cellValue = cell === null || cell === undefined ? "" : String(cell);
                                if (isHeaderRow) {
                                  return <th key={cellIdx} className="px-4 py-3 text-xs font-black uppercase tracking-tight border border-slate-900">{cellValue}</th>;
                                }
                                return (
                                  <td key={cellIdx} className={`px-4 py-2 text-xs border border-slate-900 ${cellIdx === 0 || cellIdx === 2 || cellIdx === 4 || cellIdx === 7 ? "text-center" : "text-left"} ${cellIdx === 5 || cellIdx === 6 ? "font-medium" : ""}`}>
                                    {cellValue.includes('\n') ? <div className="whitespace-pre-line">{cellValue}</div> : cellValue}
                                  </td>
                                );
                              })}
                              {row.length < 8 && !isTitleRow && Array.from({ length: 8 - row.length }).map((_, i) => (
                                <td key={`pad-${i}`} className="border border-slate-900"></td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <AlertCircle className="w-12 h-12 opacity-20" />
                  <p className="font-bold">Không có dữ liệu hiển thị</p>
                </div>
              )}
            </div>
            
            {layout.bom?.type !== 'pdf' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button onClick={exportBOMToPDF} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100 flex items-center gap-2">
                  <Download className="w-4 h-4" /> Xuất PDF
                </button>
                <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
                  Đóng bảng BOM
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface PdfBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: FactoryLayout;
}

export const PdfBomModal: React.FC<PdfBomModalProps> = ({ isOpen, onClose, layout }) => {
  return (
    <GenericPdfModal 
      isOpen={isOpen} 
      onClose={onClose} 
      data={layout.pdfBom?.data} 
      name={layout.pdfBom?.name} 
      title="Xem file BOM PDF" 
    />
  );
};

interface GenericPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: string;
  name?: string;
  title: string;
}

export const GenericPdfModal: React.FC<GenericPdfModalProps> = ({ isOpen, onClose, data, name, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full h-full bg-white shadow-2xl overflow-hidden flex flex-col border border-white"
          >
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all hover:text-slate-600 active:scale-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden bg-slate-100">
              {data ? (
                <SafePdfViewer base64Data={data} title={title} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                  <AlertCircle className="w-12 h-12 opacity-20" />
                  <p className="font-bold">Không có file PDF để hiển thị</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: string;
  name?: string;
  title: string;
}

export const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, data, name, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full h-full bg-white shadow-2xl overflow-hidden flex flex-col border border-white"
          >
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{name}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all hover:text-slate-600 active:scale-90">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-slate-100 p-4 flex items-center justify-center">
              {data ? (
                <img src={data} alt={name} className="max-w-full max-h-full object-contain rounded-xl shadow-lg" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
                  <AlertCircle className="w-12 h-12 opacity-20" />
                  <p className="font-bold">Không có ảnh để hiển thị</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
