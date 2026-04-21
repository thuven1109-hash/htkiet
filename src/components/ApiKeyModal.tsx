import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Key, ExternalLink, AlertCircle, Cpu, Loader2, X, Trash2, CheckCircle2 } from "lucide-react";
import { GEMINI_MODELS } from "../constants";
import { validateApiKey } from "../services/gemini";

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string, model: string) => void;
  onClose?: () => void;
  error?: string | null;
  initialModel?: string;
  savedKeys?: string[];
  onDeleteKey?: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onSave, 
  onClose, 
  error, 
  initialModel,
  savedKeys = [],
  onDeleteKey
}) => {
  const [inputKey, setInputKey] = React.useState("");
  const [selectedModel, setSelectedModel] = React.useState(initialModel || "gemini-flash-latest");
  const [isValidating, setIsValidating] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleValidateAndSave = async (key: string) => {
    const trimmedKey = key.trim();
    if (!trimmedKey) return;

    setIsValidating(true);
    setLocalError(null);

    const isValid = await validateApiKey(trimmedKey, selectedModel);
    
    setIsValidating(false);
    if (isValid) {
      onSave(trimmedKey, selectedModel);
    } else {
      setLocalError("Mã API Key không hợp lệ hoặc không có quyền truy cập vào Model này. Vui lòng kiểm tra lại.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleValidateAndSave(inputKey);
  };

  const displayError = localError || error;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[var(--color-bg-secondary)] rounded-3xl shadow-2xl overflow-hidden border border-pink-100 dark:border-gray-800"
          >
            <div className="relative p-8">
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-pink-500"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              
              <div className="w-16 h-16 bg-pink-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Key className="w-8 h-8 text-[#ff99cc]" />
              </div>
              
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">Chào mừng đến với Kat</h2>
              <p className="text-sm text-[var(--color-text-secondary)] text-center mb-8 leading-relaxed">
                Vui lòng nhập API Key Gemini của bạn để bắt đầu câu chuyện. 
                Kat không lưu trữ Key của bạn trên máy chủ, mọi thứ chỉ nằm ở trình duyệt cá nhân của bạn.
              </p>

              {displayError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="font-medium">{displayError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Chọn phiên bản AI
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-5 py-4 bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[var(--color-text-primary)] appearance-none cursor-pointer font-medium"
                  >
                    {GEMINI_MODELS.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Model Details */}
                  {(() => {
                    const model = GEMINI_MODELS.find(m => m.id === selectedModel);
                    if (!model) return null;
                    return (
                      <div className="mt-3 p-4 bg-pink-50/50 dark:bg-gray-800/50 rounded-2xl border border-pink-100/50 dark:border-gray-700 space-y-2">
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed italic">
                          "{model.description}"
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Chi phí:</span>
                          <span className="text-[10px] font-bold text-[#ff99cc]">{model.price}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-[var(--color-text-secondary)] ml-1 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                  </label>
                  <input
                    type="password"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="Dán API Key của bạn vào đây..."
                    className="w-full px-5 py-4 bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[var(--color-text-primary)]"
                    required
                  />
                </div>

                {savedKeys.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                      Mã đã lưu ({savedKeys.length})
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {savedKeys.map((key, index) => (
                        <div 
                          key={index}
                          className="group flex items-center gap-2 p-3 bg-pink-50/30 dark:bg-gray-800/30 border border-pink-100/30 dark:border-gray-700/50 rounded-xl hover:border-pink-200 dark:hover:border-gray-600 transition-all"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setInputKey(key);
                              // Optional: Auto-submit
                              // handleSubmit(new Event('submit') as any);
                            }}
                            className="flex-1 text-left text-xs font-mono text-[var(--color-text-secondary)] truncate hover:text-[#ff99cc] transition-colors"
                          >
                            {key.substring(0, 8)}••••••••{key.substring(key.length - 4)}
                          </button>
                          {inputKey === key ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setInputKey(key);
                                handleValidateAndSave(key);
                              }}
                              className="text-[10px] font-bold text-[#ff99cc] hover:underline"
                            >
                              Sử dụng
                            </button>
                          )}
                          {onDeleteKey && (
                            <button
                              type="button"
                              onClick={() => onDeleteKey(key)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isValidating || !inputKey.trim()}
                  className="w-full py-4 bg-[#ff99cc] hover:bg-[#ff80bf] text-white font-bold text-lg rounded-2xl shadow-lg shadow-pink-100 dark:shadow-none transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang kiểm tra...
                    </>
                  ) : (
                    "Bắt đầu ngay"
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#ff99cc] hover:text-[#ff80bf] transition-colors"
                >
                  Chưa có mã? Lấy miễn phí tại Google AI Studio
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
