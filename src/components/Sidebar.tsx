import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, History, Users, Trash2, Settings, BookMarked, UserPlus, Calendar, UserCircle, Heart, Palette, Brain, Pencil, Camera, RotateCcw } from "lucide-react";
import { ChatSession, SideCharacter, CustomSideCharacter, StorySnapshot } from "../types";
import { SIDE_CHARACTERS } from "../constants";
import { cn } from "../lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "history" | "characters" | "notebook" | "snapshots";
  onTabChange: (tab: "history" | "characters" | "notebook" | "snapshots") => void;
  isChatActive: boolean;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
  onChangeApiKey: () => void;
  notebookEvents: string[];
  onAddNotebookEvent: (event: string) => void;
  onEditNotebookEvent: (index: number, event: string) => void;
  onDeleteNotebookEvent: (index: number) => void;
  customCharacters: CustomSideCharacter[];
  onAddCustomCharacter: (char: CustomSideCharacter) => void;
  onDeleteCustomCharacter: (index: number) => void;
  snapshots: StorySnapshot[];
  onSaveSnapshot: (name: string) => void;
  onLoadSnapshot: (snapshot: StorySnapshot) => void;
  onDeleteSnapshot: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  isChatActive,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onChangeApiKey,
  notebookEvents,
  onAddNotebookEvent,
  onEditNotebookEvent,
  onDeleteNotebookEvent,
  customCharacters,
  onAddCustomCharacter,
  onDeleteCustomCharacter,
  snapshots,
  onSaveSnapshot,
  onLoadSnapshot,
  onDeleteSnapshot,
}) => {
  const [isAddingChar, setIsAddingChar] = React.useState(false);
  const [newChar, setNewChar] = React.useState<CustomSideCharacter>({
    name: "",
    gender: "Nam",
    role: "",
    description: "",
    birthDate: "",
    appearance: "",
    personality: "",
  });
  const [newEvent, setNewEvent] = React.useState("");
  const [isAddingEvent, setIsAddingEvent] = React.useState(false);
  const [editingEventIndex, setEditingEventIndex] = React.useState<number | null>(null);
  const [editEventValue, setEditEventValue] = React.useState("");
  const [isAddingSnapshot, setIsAddingSnapshot] = React.useState(false);
  const [snapshotName, setSnapshotName] = React.useState("");
  const [sessionToDeleteId, setSessionToDeleteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isChatActive && activeTab === "notebook") {
      onTabChange("history");
    }
  }, [isChatActive, activeTab, onTabChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 bg-[var(--color-bg-primary)] shadow-2xl z-50 flex flex-col border-l border-pink-100 dark:border-gray-800"
          >
            <div className="p-4 flex items-center justify-between border-b border-pink-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Menu</h2>
              <button onClick={onClose} className="p-2 hover:bg-pink-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-[var(--color-text-primary)]" />
              </button>
            </div>

            <div className="flex border-b border-pink-100 dark:border-gray-800">
              <button
                onClick={() => onTabChange("history")}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  activeTab === "history" ? "text-[#ff99cc] border-b-2 border-[#ff99cc]" : "text-[var(--color-text-secondary)]"
                )}
              >
                <History className="w-4 h-4" />
                Lịch sử
              </button>
              <button
                onClick={() => onTabChange("characters")}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  activeTab === "characters" ? "text-[#ff99cc] border-b-2 border-[#ff99cc]" : "text-[var(--color-text-secondary)]"
                )}
              >
                <Users className="w-4 h-4" />
                Nhân vật
              </button>
              {isChatActive && (
                <button
                  onClick={() => onTabChange("notebook")}
                  className={cn(
                    "flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                    activeTab === "notebook" ? "text-[#ff99cc] border-b-2 border-[#ff99cc]" : "text-[var(--color-text-secondary)]"
                  )}
                >
                  <BookMarked className="w-4 h-4" />
                  Sổ tay
                </button>
              )}
              {isChatActive && (
                <button
                  onClick={() => onTabChange("snapshots")}
                  className={cn(
                    "flex-1 py-3 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                    activeTab === "snapshots" ? "text-[#ff99cc] border-b-2 border-[#ff99cc]" : "text-[var(--color-text-secondary)]"
                  )}
                >
                  <Camera className="w-4 h-4" />
                  Snapshot
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === "history" && (
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onNewChat();
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-[var(--color-bg-secondary)] border border-pink-200 dark:border-gray-700 rounded-xl flex items-center gap-3 text-[var(--color-text-primary)] hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                  >
                    <Plus className="w-5 h-5 text-[#ff99cc]" />
                    <span className="font-medium">Chat mới</span>
                  </button>

                  <div className="pt-4 space-y-2">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "group relative p-3 rounded-xl border transition-all cursor-pointer",
                          session.id === currentSessionId
                            ? "bg-[var(--color-bg-secondary)] border-[#ff99cc] shadow-md"
                            : "bg-[var(--color-bg-secondary)]/50 border-pink-100 dark:border-gray-800 hover:border-pink-200 dark:hover:border-gray-600"
                        )}
                        onClick={() => {
                          onSelectSession(session.id);
                          onClose();
                        }}
                      >
                        <div className="pr-12">
                          <p className="font-bold text-[var(--color-text-primary)] truncate">{session.name}</p>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <p className="text-[10px] text-[var(--color-text-secondary)]">
                              {new Date(session.lastUpdate).toLocaleString("vi-VN")}
                            </p>
                            <p className="text-[10px] text-[#ff99cc] font-medium">
                              {session.messages.length} lượt chat
                            </p>
                          </div>
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {sessionToDeleteId === session.id ? (
                            <div className="flex items-center gap-1 bg-[var(--color-bg-primary)] p-1 rounded-lg border border-red-200 shadow-sm animate-in fade-in zoom-in duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteSession(session.id);
                                  setSessionToDeleteId(null);
                                }}
                                className="text-[10px] bg-red-500 text-white px-2 py-1 rounded-md font-bold hover:bg-red-600 transition-colors"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSessionToDeleteId(null);
                                }}
                                className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-2 py-1 rounded-md font-bold"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSessionToDeleteId(session.id);
                              }}
                              className="p-2 text-gray-400 hover:text-red-500 transition-all opacity-100 sm:opacity-40 group-hover:opacity-100"
                              title="Xóa lịch sử"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "characters" && (
                <div className="space-y-4">
                  {isChatActive && (
                    <button
                      onClick={() => setIsAddingChar(!isAddingChar)}
                      className="w-full py-3 px-4 bg-[var(--color-bg-secondary)] border border-pink-200 dark:border-gray-700 rounded-xl flex items-center gap-3 text-[var(--color-text-primary)] hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors shadow-sm mb-4"
                    >
                      <UserPlus className="w-5 h-5 text-[#ff99cc]" />
                      <span className="font-medium">Thêm nhân vật phụ</span>
                    </button>
                  )}

                  <AnimatePresence>
                    {isAddingChar && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-pink-200 dark:border-gray-700 shadow-inner space-y-3 mb-6 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            placeholder="Tên"
                            value={newChar.name}
                            onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                            className="text-xs p-2 bg-pink-50 dark:bg-gray-800 rounded-lg border border-pink-100 dark:border-gray-700 text-[var(--color-text-primary)]"
                          />
                          <select
                            value={newChar.gender}
                            onChange={(e) => setNewChar({ ...newChar, gender: e.target.value })}
                            className="text-xs p-2 bg-pink-50 dark:bg-gray-800 rounded-lg border border-pink-100 dark:border-gray-700 text-[var(--color-text-primary)]"
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>
                        <input
                          placeholder="Ngày sinh (VD: 12/10/1900)"
                          value={newChar.birthDate}
                          onChange={(e) => setNewChar({ ...newChar, birthDate: e.target.value })}
                          className="text-xs p-2 w-full bg-pink-50 dark:bg-gray-800 rounded-lg border border-pink-100 dark:border-gray-700 text-[var(--color-text-primary)]"
                        />
                        <input
                          placeholder="Mối quan hệ"
                          value={newChar.role}
                          onChange={(e) => setNewChar({ ...newChar, role: e.target.value })}
                          className="text-xs p-2 w-full bg-pink-50 dark:bg-gray-800 rounded-lg border border-pink-100 dark:border-gray-700 text-[var(--color-text-primary)]"
                        />
                        <textarea
                          placeholder="Ngoại hình"
                          value={newChar.appearance}
                          onChange={(e) => setNewChar({ ...newChar, appearance: e.target.value })}
                          className="text-xs p-2 w-full bg-pink-50 dark:bg-gray-800 rounded-lg border border-pink-100 dark:border-gray-700 text-[var(--color-text-primary)] h-16 resize-none"
                        />
                        <textarea
                          placeholder="Tính cách"
                          value={newChar.personality}
                          onChange={(e) => setNewChar({ ...newChar, personality: e.target.value })}
                          className="text-xs p-2 w-full bg-pink-50 dark:bg-gray-800 rounded-lg border border-pink-100 dark:border-gray-700 text-[var(--color-text-primary)] h-16 resize-none"
                        />
                        <button
                          onClick={() => {
                            if (newChar.name) {
                              onAddCustomCharacter({
                                ...newChar,
                                description: `Ngày sinh: ${newChar.birthDate}. Ngoại hình: ${newChar.appearance}. Tính cách: ${newChar.personality}`,
                              });
                              setNewChar({ name: "", gender: "Nam", role: "", description: "", birthDate: "", appearance: "", personality: "" });
                              setIsAddingChar(false);
                            }
                          }}
                          className="w-full py-2 bg-[#ff99cc] text-white rounded-lg text-xs font-bold"
                        >
                          Lưu nhân vật
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Nhân vật mặc định</p>
                    {SIDE_CHARACTERS.map((char, i) => (
                      <div key={i} className="bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-pink-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-[var(--color-text-primary)]">{char.name}</p>
                          <span className="text-[10px] bg-pink-50 dark:bg-pink-900/20 text-[#ff99cc] px-2 py-0.5 rounded-full font-bold">
                            {char.gender}
                          </span>
                        </div>
                        <p className="text-xs text-[#ff99cc] font-medium mb-2">{char.role}</p>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{char.description}</p>
                      </div>
                    ))}
                  </div>

                  {isChatActive && customCharacters.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 pt-4">Nhân vật của bạn</p>
                      {customCharacters.map((char, i) => (
                        <div key={i} className="bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-[#ff99cc]/30 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-[var(--color-text-primary)]">{char.name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-pink-50 dark:bg-pink-900/20 text-[#ff99cc] px-2 py-0.5 rounded-full font-bold">
                                  {char.gender}
                                </span>
                                <button
                                  onClick={() => onDeleteCustomCharacter(i)}
                                  className="text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-[#ff99cc] font-medium mb-2">{char.role}</p>
                            <div className="space-y-2">
                              <div className="flex items-start gap-2 text-[11px] text-[var(--color-text-secondary)]">
                                <Calendar className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{char.birthDate}</span>
                              </div>
                              <div className="flex items-start gap-2 text-[11px] text-[var(--color-text-secondary)]">
                                <Palette className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{char.appearance}</span>
                              </div>
                              <div className="flex items-start gap-2 text-[11px] text-[var(--color-text-secondary)]">
                                <Brain className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{char.personality}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  </div>
              )}

              {activeTab === "notebook" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">Sổ tay sự kiện ({notebookEvents.length}/20)</p>
                    <button
                      onClick={() => setIsAddingEvent(!isAddingEvent)}
                      disabled={notebookEvents.length >= 20}
                      className="p-1.5 bg-[#ff99cc] text-white rounded-full disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isAddingEvent && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[var(--color-bg-secondary)] p-3 rounded-xl border border-pink-200 dark:border-gray-700 shadow-sm space-y-2">
                          <textarea
                            value={newEvent}
                            onChange={(e) => setNewEvent(e.target.value)}
                            placeholder="Nhập sự kiện mới (VD: {{user}} đang bệnh...)"
                            className="w-full h-20 p-2 text-xs bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-lg focus:outline-none resize-none text-[var(--color-text-primary)]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (newEvent.trim()) {
                                  onAddNotebookEvent(newEvent.trim());
                                  setNewEvent("");
                                  setIsAddingEvent(false);
                                }
                              }}
                              className="flex-1 py-2 bg-[#ff99cc] text-white rounded-lg text-xs font-bold"
                            >
                              Thêm
                            </button>
                            <button
                              onClick={() => setIsAddingEvent(false)}
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg text-xs font-bold"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    {notebookEvents.map((event, i) => (
                      <div key={i} className="bg-[var(--color-bg-secondary)] p-3 rounded-xl border border-pink-100 dark:border-gray-800 shadow-sm flex flex-col gap-2 group">
                        {editingEventIndex === i ? (
                          <div className="space-y-2">
                            <textarea
                              value={editEventValue}
                              onChange={(e) => setEditEventValue(e.target.value)}
                              className="w-full h-20 p-2 text-xs bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-lg focus:outline-none resize-none text-[var(--color-text-primary)]"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  if (editEventValue.trim()) {
                                    onEditNotebookEvent(i, editEventValue.trim());
                                    setEditingEventIndex(null);
                                  }
                                }}
                                className="flex-1 py-1.5 bg-[#ff99cc] text-white rounded-lg text-[10px] font-bold"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingEventIndex(null)}
                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg text-[10px] font-bold"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between gap-3">
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{event}</p>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingEventIndex(i);
                                  setEditEventValue(event);
                                }}
                                className="text-gray-400 hover:text-[#ff99cc] transition-all"
                                title="Chỉnh sửa"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteNotebookEvent(i)}
                                className="text-gray-400 hover:text-red-500 transition-all"
                                title="Xóa sự kiện"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {notebookEvents.length === 0 && (
                      <div className="text-center py-12">
                        <BookMarked className="w-12 h-12 text-pink-100 dark:text-gray-800 mx-auto mb-3" />
                        <p className="text-xs text-gray-400">Chưa có sự kiện nào được ghi lại.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "snapshots" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm font-bold text-[var(--color-text-primary)]">Snapshots ({snapshots.length}/10)</p>
                    <button
                      onClick={() => setIsAddingSnapshot(!isAddingSnapshot)}
                      disabled={snapshots.length >= 10}
                      className="p-1.5 bg-[#ff99cc] text-white rounded-full disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isAddingSnapshot && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[var(--color-bg-secondary)] p-3 rounded-xl border border-pink-200 dark:border-gray-700 shadow-sm space-y-2">
                          <input
                            value={snapshotName}
                            onChange={(e) => setSnapshotName(e.target.value)}
                            placeholder="Tên snapshot (VD: Trước khi gặp Cậu Út...)"
                            className="w-full p-2 text-xs bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-lg focus:outline-none text-[var(--color-text-primary)]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                if (snapshotName.trim()) {
                                  onSaveSnapshot(snapshotName.trim());
                                  setSnapshotName("");
                                  setIsAddingSnapshot(false);
                                }
                              }}
                              className="flex-1 py-2 bg-[#ff99cc] text-white rounded-lg text-xs font-bold"
                            >
                              Lưu Snapshot
                            </button>
                            <button
                              onClick={() => setIsAddingSnapshot(false)}
                              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-lg text-xs font-bold"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-3">
                    {snapshots.map((snapshot) => (
                      <div key={snapshot.id} className="bg-[var(--color-bg-secondary)] p-4 rounded-xl border border-pink-100 dark:border-gray-800 shadow-sm group">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-[var(--color-text-primary)] truncate">{snapshot.name}</p>
                            <p className="text-[10px] text-gray-400">{new Date(snapshot.timestamp).toLocaleString("vi-VN")}</p>
                          </div>
                          <button
                            onClick={() => onDeleteSnapshot(snapshot.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-pink-50 dark:bg-pink-900/10 p-2 rounded-lg">
                            <p className="text-[9px] text-gray-400 uppercase font-bold">Yêu thích</p>
                            <p className="text-xs font-bold text-[#ff99cc]">{snapshot.favorability}%</p>
                          </div>
                          <div className="bg-pink-50 dark:bg-pink-900/10 p-2 rounded-lg">
                            <p className="text-[9px] text-gray-400 uppercase font-bold">Tin nhắn</p>
                            <p className="text-xs font-bold text-[#ff99cc]">{snapshot.messageCount}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn tải lại snapshot "${snapshot.name}"? Tiến trình hiện tại sẽ bị ghi đè.`)) {
                              onLoadSnapshot(snapshot);
                              onClose();
                            }
                          }}
                          className="w-full py-2 bg-pink-50 dark:bg-gray-800 text-[#ff99cc] border border-pink-100 dark:border-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-pink-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Tải lại Snapshot
                        </button>
                      </div>
                    ))}
                    {snapshots.length === 0 && (
                      <div className="text-center py-12">
                        <Camera className="w-12 h-12 text-pink-100 dark:text-gray-800 mx-auto mb-3" />
                        <p className="text-xs text-gray-400">Chưa có snapshot nào.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-pink-100 dark:border-gray-800">
              <button
                onClick={() => {
                  onChangeApiKey();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-pink-50 dark:bg-gray-800 text-[#ff99cc] rounded-xl flex items-center justify-center gap-3 font-bold hover:bg-pink-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Cài đặt API Key
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
