import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Package, Send, Sparkles, Gem, Scroll, Coins, Gift, Utensils, Flower2, Circle } from "lucide-react";

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  items: string[];
  onAction: (item: string, type: "use" | "show" | "gift") => void;
  userName: string;
}

const getItemIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("nhẫn") || n.includes("vòng") || n.includes("hột xoàn") || n.includes("trâm") || n.includes("ximen")) return <Gem className="w-4 h-4" />;
  if (n.includes("thư") || n.includes("giấy") || n.includes("sổ") || n.includes("bản đồ")) return <Scroll className="w-4 h-4" />;
  if (n.includes("tiền") || n.includes("bạc") || n.includes("vàng") || n.includes("cắc")) return <Coins className="w-4 h-4" />;
  if (n.includes("quà") || n.includes("hộp")) return <Gift className="w-4 h-4" />;
  if (n.includes("bánh") || n.includes("trà") || n.includes("rượu") || n.includes("cơm")) return <Utensils className="w-4 h-4" />;
  if (n.includes("hoa") || n.includes("sen") || n.includes("nhài")) return <Flower2 className="w-4 h-4" />;
  if (n.includes("ngọc") || n.includes("cẩm thạch")) return <Circle className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
};

export const InventoryPopup: React.FC<InventoryPopupProps> = ({
  isOpen,
  onClose,
  items,
  onAction,
  userName,
}) => {
  const [actingItem, setActingItem] = React.useState<string | null>(null);

  const handleActionClick = (item: string, type: "use" | "show" | "gift") => {
    onAction(item, type);
    setActingItem(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-24 left-4 w-72 bg-[var(--color-bg-secondary)] rounded-2xl shadow-xl border border-pink-100 dark:border-gray-800 overflow-hidden z-50"
          >
          <div className="p-3 bg-pink-50 dark:bg-gray-800 border-b border-pink-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#ff99cc]" />
              <span className="text-sm font-bold text-[var(--color-text-primary)]">Túi đồ của {userName}</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">{items.length} món</span>
          </div>
          
          <div className="max-h-72 overflow-y-auto p-3 relative">
            {items.length === 0 ? (
              <div className="text-center py-10">
                <Package className="w-8 h-8 text-pink-100 dark:text-gray-800 mx-auto mb-2" />
                <p className="text-xs text-gray-400 italic">Túi đồ trống rỗng...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col p-3 rounded-xl bg-pink-50/30 dark:bg-gray-800/30 border border-pink-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-gray-600 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-[#ff99cc] flex-shrink-0 shadow-sm">
                        {getItemIcon(item)}
                      </div>
                      <span className="text-sm text-[var(--color-text-primary)] font-bold truncate flex-1">{item}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActingItem(item)}
                        className="flex-1 py-2 bg-white dark:bg-gray-800 text-[#ff99cc] border border-pink-100 dark:border-gray-700 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors active:scale-95"
                      >
                        Hành động
                      </button>
                      <button
                        onClick={() => onAction(item, "show")}
                        className="flex-1 py-2 bg-[#ff99cc] text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold hover:bg-[#ff80bf] transition-colors shadow-sm shadow-pink-100 dark:shadow-none active:scale-95"
                      >
                        Khoe đồ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Sub-menu */}
            <AnimatePresence>
              {actingItem && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4"
                >
                  <p className="text-xs font-bold text-gray-500 mb-4 text-center">Bạn muốn làm gì với <br/><span className="text-pink-500">"{actingItem}"</span>?</p>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-[160px]">
                    <button
                      onClick={() => handleActionClick(actingItem, "use")}
                      className="py-2.5 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-xl text-xs font-bold hover:bg-pink-100 transition-colors"
                    >
                      Dùng ngay
                    </button>
                    <button
                      onClick={() => handleActionClick(actingItem, "show")}
                      className="py-2.5 bg-pink-50 dark:bg-pink-900/20 text-pink-500 rounded-xl text-xs font-bold hover:bg-pink-100 transition-colors"
                    >
                      Khoe với Cậu
                    </button>
                    <button
                      onClick={() => handleActionClick(actingItem, "gift")}
                      className="py-2.5 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-100 dark:shadow-none"
                    >
                      Tặng cho Cậu
                    </button>
                    <button
                      onClick={() => setActingItem(null)}
                      className="mt-2 py-2 text-gray-400 text-[10px] font-bold hover:text-gray-600 transition-colors"
                    >
                      Quay lại
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
  );
};
