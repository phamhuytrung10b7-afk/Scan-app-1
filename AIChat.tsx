import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, MessageSquare, Loader2, Send } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage } from './types';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  userInput: string;
  setUserInput: (val: string) => void;
  isLoading: boolean;
  onSend: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const AIChat: React.FC<AIChatProps> = ({ 
  isOpen, 
  onClose, 
  messages, 
  userInput, 
  setUserInput, 
  isLoading, 
  onSend, 
  chatEndRef 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
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
            {messages.map((msg, i) => (
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
            {isLoading && (
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
                    onSend();
                  }
                }}
                placeholder="Nhập câu hỏi tại đây..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 pr-12 text-xs outline-none focus:border-indigo-500 transition-colors resize-none h-20"
              />
              <button 
                onClick={onSend}
                disabled={!userInput.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;
