import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, MoreVertical, Plus, Send, RotateCcw, FastForward, Settings, Pencil, Check, X as CloseIcon, BookMarked, ChevronDown, Heart, Package, Book, Music } from "lucide-react";
import { Message, UserInfo, DiaryEntry } from "../types";
import { MessageItem } from "./MessageItem";
import { InventoryPopup } from "./InventoryPopup";
import { DiaryModal } from "./DiaryModal";
import { CHAR_AVATAR, PUBLIC_INFO, FAVORABILITY_LEVELS } from "../constants";
import { cn } from "../lib/utils";

interface ChatInterfaceProps {
  messages: Message[];
  userInfo: UserInfo;
  onSendMessage: (content: string) => void;
  onBack: () => void;
  onToggleSidebar: () => void;
  onRefresh: () => void;
  onFastForward: () => void;
  onEditLastMessage: (content: string) => void;
  onEditMessage: (id: string, content: string) => void;
  onDeleteMessage: (id: string) => void;
  onSelectVariant: (id: string, variantIndex: number) => void;
  onOpenSettings: () => void;
  onOpenNotebook: () => void;
  onOpenMusicPlayer: () => void;
  inventory: string[];
  favorability: number;
  diaryEntries: DiaryEntry[];
  onUseItem: (item: string) => void;
  isTyping: boolean;
  modelName: string;
  charAvatar: string;
  hasError?: boolean;
  onRetry?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  userInfo,
  onSendMessage,
  onBack,
  onToggleSidebar,
  onRefresh,
  onFastForward,
  onEditLastMessage,
  onEditMessage,
  onDeleteMessage,
  onSelectVariant,
  onOpenSettings,
  onOpenNotebook,
  onOpenMusicPlayer,
  inventory,
  favorability,
  diaryEntries,
  onUseItem,
  isTyping,
  modelName,
  charAvatar,
  hasError,
  onRetry,
}) => {
  const [input, setInput] = React.useState("");
  const [isInventoryOpen, setIsInventoryOpen] = React.useState(false);
  const [isEditingLast, setIsEditingLast] = React.useState(false);
  const [editContent, setEditContent] = React.useState("");
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const [isFavorabilityModalOpen, setIsFavorabilityModalOpen] = React.useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = React.useState(false);
  const [isDiaryModalOpen, setIsDiaryModalOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const lastAssistantMessage = [...messages].reverse().find(m => m.role === "assistant");

  const getCurrentFavorabilityLevel = () => {
    if (favorability >= 0) {
      // Positive or zero: find the highest threshold <= favorability
      const level = [...FAVORABILITY_LEVELS]
        .filter(l => l.threshold >= 0)
        .sort((a, b) => b.threshold - a.threshold)
        .find(l => favorability >= l.threshold);
      return level || FAVORABILITY_LEVELS.find(l => l.threshold === 0)!;
    } else {
      // Negative: find the lowest threshold >= favorability (e.g., -15 is "Chán" because -15 <= -10)
      const level = [...FAVORABILITY_LEVELS]
        .filter(l => l.threshold < 0)
        .sort((a, b) => a.threshold - b.threshold) // -500, -100, -50, -10
        .find(l => favorability <= l.threshold);
      return level || FAVORABILITY_LEVELS.find(l => l.threshold === 0)!;
    }
  };

  const currentLevel = getCurrentFavorabilityLevel();

  // Handle manual scroll detection
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
  const [editingMessageContent, setEditingMessageContent] = React.useState("");

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  // Only auto-scroll when user sends a message, not when AI is typing or responding
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleStartEdit = () => {
    if (lastAssistantMessage) {
      setEditContent(lastAssistantMessage.content);
      setIsEditingLast(true);
    }
  };

  const handleSaveEdit = () => {
    onEditLastMessage(editContent);
    setIsEditingLast(false);
  };

  const handleInventoryAction = (item: string, type: "use" | "show" | "gift") => {
    let text = "";
    if (type === "show") {
      text = `{{user}} lấy [${item}] ra cho {{char}} xem...`;
    } else if (type === "gift") {
      text = `{{user}} tặng [${item}] cho {{char}}...`;
    } else {
      text = `{{user}} sử dụng [${item}]...`;
    }
    setInput(text);
    setIsInventoryOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[var(--color-bg-secondary)]/80 backdrop-blur-md border-b border-pink-100 dark:border-gray-800 flex flex-col z-20 shadow-sm">
        <div className="flex-1 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-[var(--color-text-primary)]" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src={charAvatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-pink-200 dark:border-gray-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-[var(--color-text-primary)] leading-tight">{PUBLIC_INFO.name}</p>
                <p className="text-[10px] text-[#ff99cc] font-bold uppercase tracking-wider">{PUBLIC_INFO.title.split(" / ")[0]}</p>
                <p className="text-[8px] text-[var(--color-text-secondary)] font-medium">Đang trò chuyện bằng: {modelName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={onOpenNotebook}
              className="p-2 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-full transition-colors text-[var(--color-text-primary)]"
              title="Sổ tay sự kiện"
            >
              <BookMarked className="w-6 h-6" />
            </button>
            <button onClick={onOpenSettings} className="p-2 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-full transition-colors" title="Cài đặt">
              <Settings className="w-6 h-6 text-[var(--color-text-primary)]" />
            </button>
            <button onClick={onToggleSidebar} className="p-2 hover:bg-pink-50 dark:hover:bg-gray-800 rounded-full transition-colors">
              <MoreVertical className="w-6 h-6 text-[var(--color-text-primary)]" />
            </button>
          </div>
        </div>
        
        {/* Favorability Bar */}
        <div 
          className="px-4 pb-2 cursor-pointer hover:bg-pink-50/50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => setIsFavorabilityModalOpen(true)}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest">Mức độ yêu thích</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold" style={{ color: currentLevel.color }}>{currentLevel.icon} {currentLevel.label}</span>
              <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">({favorability})</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              initial={false}
              animate={{ 
                width: `${Math.min(100, Math.max(0, ((favorability + 500) / 2000) * 100))}%`,
                backgroundColor: currentLevel.color 
              }}
              className="h-full transition-colors duration-500"
            />
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pt-24 pb-24 px-4 scroll-smooth"
      >
        <div className="max-w-2xl mx-auto relative">
          {messages.map((msg) => (
            <div key={msg.id}>
              {editingMessageId === msg.id ? (
                <div className="flex w-full mb-6 justify-end">
                  <div className="flex max-w-[85%] flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-pink-200 dark:border-gray-700">
                    <textarea
                      value={editingMessageContent}
                      onChange={(e) => setEditingMessageContent(e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[60px] text-[var(--color-text-primary)]"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setEditingMessageId(null)}
                        className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onEditMessage(msg.id, editingMessageContent);
                          setEditingMessageId(null);
                        }}
                        className="px-3 py-1.5 text-sm bg-pink-500 text-white hover:bg-pink-600 rounded-lg transition-colors"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <MessageItem
                  content={msg.content}
                  role={msg.role}
                  userName={userInfo.name}
                  scoreChange={msg.scoreChange}
                  charAvatar={charAvatar}
                  variantsCount={msg.variants?.length}
                  currentVariantIndex={msg.currentVariantIndex}
                  onSelectVariant={(index) => onSelectVariant(msg.id, index)}
                  onCopy={() => navigator.clipboard.writeText(msg.content)}
                  onEdit={msg.role === "user" ? () => {
                    setEditingMessageId(msg.id);
                    setEditingMessageContent(msg.content);
                  } : undefined}
                  onDelete={() => onDeleteMessage(msg.id)}
                />
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="flex items-end gap-2">
                <img
                  src={charAvatar}
                  alt="AI Avatar"
                  className="w-8 h-8 rounded-full border border-pink-200 dark:border-gray-700"
                  referrerPolicy="no-referrer"
                />
                <div className="bg-[var(--color-bg-secondary)] p-4 rounded-2xl rounded-bl-none shadow-sm text-pink-500 text-xs font-bold flex items-center gap-2">
                  <span>Nhân vật đang soạn phản hồi...</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasError && onRetry && (
            <div className="flex flex-col items-center gap-4 mb-20">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl border border-red-100 dark:border-red-900/30 text-center text-sm">
                Có lỗi xảy ra trong lúc kết nối với nhân vật (Có thể do mạng yếu hoặc API Key hết lượt).
              </div>
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-full font-bold hover:bg-pink-600 transition-all active:scale-95 shadow-lg shadow-pink-200"
              >
                <RotateCcw className="w-5 h-5" />
                Thử lại lần nữa
              </button>
            </div>
          )}

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={scrollToBottom}
                className="fixed bottom-28 right-8 p-3 bg-white dark:bg-gray-800 text-pink-500 rounded-full shadow-xl border border-pink-100 dark:border-gray-700 z-30 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Action Icons */}
          <div className="flex gap-4 mt-2 mb-8 ml-10">
            <button
              onClick={onRefresh}
              className="p-2 bg-[var(--color-bg-secondary)] rounded-full shadow-sm border border-pink-100 dark:border-gray-800 text-[#ff99cc] hover:bg-pink-50 dark:hover:bg-gray-800 transition-all active:scale-95"
              title="Làm mới"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={handleStartEdit}
              className="p-2 bg-[var(--color-bg-secondary)] rounded-full shadow-sm border border-pink-100 dark:border-gray-800 text-[#ff99cc] hover:bg-pink-50 dark:hover:bg-gray-800 transition-all active:scale-95"
              title="Chỉnh sửa phản hồi"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={onFastForward}
              className="p-2 bg-[var(--color-bg-secondary)] rounded-full shadow-sm border border-pink-100 dark:border-gray-800 text-[#ff99cc] hover:bg-pink-50 dark:hover:bg-gray-800 transition-all active:scale-95"
              title="Tiếp tục"
            >
              <FastForward className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditingLast && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--color-bg-secondary)] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-pink-500" />
                  Chỉnh sửa phản hồi của nhân vật
                </h3>
                <button onClick={() => setIsEditingLast(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-64 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-pink-500 outline-none resize-none leading-relaxed"
                  placeholder="Nhập nội dung phản hồi mới..."
                />
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => setIsEditingLast(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Lưu phản hồi
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Favorability Details Modal */}
      <AnimatePresence>
        {isFavorabilityModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[var(--color-bg-secondary)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  Mức độ yêu thích
                </h3>
                <button onClick={() => setIsFavorabilityModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Current Status Card */}
                <div className="bg-pink-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-pink-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái hiện tại</span>
                    <span className="text-xl font-bold" style={{ color: currentLevel.color }}>{currentLevel.icon} {currentLevel.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(0, ((favorability + 500) / 2000) * 100))}%` }}
                        className="h-full"
                        style={{ backgroundColor: currentLevel.color }}
                      />
                    </div>
                    <span className="text-sm font-mono font-bold text-gray-600 dark:text-gray-400">{favorability}</span>
                  </div>
                </div>

                {/* Levels List */}
                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {[...FAVORABILITY_LEVELS].sort((a, b) => b.threshold - a.threshold).map((level) => (
                    <div 
                      key={level.label}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                        level.label === currentLevel.label
                          ? "bg-white dark:bg-gray-800 border-pink-200 dark:border-pink-900 shadow-sm scale-[1.02]" 
                          : "border-transparent opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{level.icon}</span>
                        <span className="font-bold text-sm" style={{ color: level.color }}>{level.label}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-gray-400">
                        {level.threshold > 0 ? `+${level.threshold}` : level.threshold}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                  Mức độ yêu thích thay đổi dựa trên cách bạn đối đãi và trò chuyện với nhân vật. Hãy cẩn trọng trong từng lời nói.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory Popup */}
      <InventoryPopup
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        items={inventory}
        onAction={handleInventoryAction}
        userName={userInfo.name}
      />

      {/* Input Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-secondary)] border-t border-pink-100 dark:border-gray-800 p-4 z-20">
        <div className="max-w-2xl mx-auto relative flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className={cn(
                "p-3 rounded-full transition-all active:scale-90 shadow-sm",
                isPlusMenuOpen ? "bg-[#ff99cc] text-white" : "bg-pink-50 dark:bg-gray-800 text-[#ff99cc] hover:bg-pink-100 dark:hover:bg-gray-700"
              )}
            >
              <Plus className={cn("w-6 h-6 transition-transform", isPlusMenuOpen && "rotate-45")} />
            </button>

            <AnimatePresence>
              {isPlusMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsPlusMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute bottom-full left-0 mb-4 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-pink-100 dark:border-gray-700 overflow-hidden z-40"
                  >
                    <button
                      onClick={() => {
                        setIsInventoryOpen(true);
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-500">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Túi đồ</span>
                        <span className="text-[10px] text-gray-400">Hành trang của {userInfo.name}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsDiaryModalOpen(true);
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-50 dark:border-gray-700"
                    >
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-500">
                        <Book className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Nhật ký</span>
                        <span className="text-[10px] text-gray-400">Tâm tình của {PUBLIC_INFO.name}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        onOpenMusicPlayer();
                        setIsPlusMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 dark:hover:bg-gray-700 transition-colors text-left border-t border-gray-50 dark:border-gray-700"
                    >
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-500">
                        <Music className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">Máy phát nhạc</span>
                        <span className="text-[10px] text-gray-400">Giai điệu hoài niệm</span>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <form onSubmit={handleSend} className="flex-1 flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-5 py-3 bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[var(--color-text-primary)] resize-none min-h-[48px] max-h-32 custom-scrollbar"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 bg-[#ff99cc] text-white rounded-full shadow-lg shadow-pink-100 dark:shadow-none disabled:opacity-50 disabled:shadow-none transition-all active:scale-90 mb-1"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </footer>

      <DiaryModal
        isOpen={isDiaryModalOpen}
        onClose={() => setIsDiaryModalOpen(false)}
        entries={diaryEntries}
        charName={PUBLIC_INFO.name}
      />
    </div>
  );
};
