import React from "react";
import { motion } from "motion/react";
import { CHAR_AVATAR, INTRO_HISTORY, PUBLIC_INFO } from "../constants";
import { UserInfo } from "../types";
import { Info, History as HistoryIcon, MoreVertical, User, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface IntroScreenProps {
  onStart: (userInfo: UserInfo, charAvatar: string) => void;
  onToggleSidebar: () => void;
  userProfiles: UserProfile[];
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, onToggleSidebar, userProfiles }) => {
  const [name, setName] = React.useState("");
  const [appearance, setAppearance] = React.useState("");
  const [personality, setPersonality] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"info" | "history">("info");
  const [showAvatarSelect, setShowAvatarSelect] = React.useState(false);
  const [selectedAvatar, setSelectedAvatar] = React.useState(CHAR_AVATAR);

  const AVATAR_OPTIONS = [
    "https://lh3.googleusercontent.com/u/0/d/13zl5gqCSjCYz_k9sY04UXPDH3gLvGkB4"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onStart({
      name: name.trim(),
      appearance: appearance.trim() || "22 tuổi. Làn da trắng bóc bẩm sinh, nét đẹp thanh thoát, rực rỡ và kiêu hãnh của phụ nữ hiện đại dù phải khoác lên mình bộ áo bà ba mộc mạc.",
      personality: personality.trim(),
      age: 22,
      background: "Linh hồn là một cô gái hiện đại 18 tuổi ở thế kỷ 21, trượt chân ở Đà Lạt xuyên không về thập niên 1930. Mất trí nhớ suốt 4 năm, được Cậu Hai nhặt về từ rừng cao su, làm con hầu rồi được nâng lên làm vợ lẽ. Vừa mới lấy lại được ký ức sau vụ sẩy thai do Cậu Hai gây ra."
    }, selectedAvatar);
  };

  const selectProfile = (profile: UserProfile) => {
    setName(profile.name);
    setAppearance(profile.appearance);
    setPersonality(profile.personality);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center p-6 overflow-y-auto transition-colors duration-300">
      {/* Header for Intro Screen */}
      <div className="w-full max-w-2xl flex justify-end mb-4">
        <button 
          onClick={onToggleSidebar}
          className="p-3 bg-[var(--color-bg-secondary)]/50 hover:bg-[var(--color-bg-secondary)] rounded-full transition-colors shadow-sm border border-pink-100 dark:border-gray-800"
        >
          <MoreVertical className="w-6 h-6 text-[var(--color-text-primary)]" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[var(--color-bg-secondary)]/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-pink-100 dark:border-gray-800 mb-8"
      >
        {/* Character Info Section */}
        <div className="p-8 flex flex-col items-center text-center border-b border-pink-50 dark:border-gray-800">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-[#ffb6c1] p-1 shadow-lg relative group cursor-pointer" onClick={() => setShowAvatarSelect(true)}>
              <img
                src={selectedAvatar}
                alt={PUBLIC_INFO.name}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-bold">Đổi ảnh</span>
              </div>
            </div>
            <div className="absolute -bottom-2 right-0 bg-[#ff99cc] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              {PUBLIC_INFO.title.split(" / ")[0]}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">{PUBLIC_INFO.name}</h1>
          <p className="text-[#ff99cc] font-medium mb-4">{PUBLIC_INFO.title}</p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "info" ? "bg-[#ffb6c1] text-white shadow-md" : "bg-pink-50 dark:bg-gray-800 text-[#ffb6c1]"
              }`}
            >
              <Info className="w-4 h-4" />
              Thông tin công khai
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === "history" ? "bg-[#ffb6c1] text-white shadow-md" : "bg-pink-50 dark:bg-gray-800 text-[#ffb6c1]"
              }`}
            >
              <HistoryIcon className="w-4 h-4" />
              Lịch sử
            </button>
          </div>

          <div className="text-left w-full bg-pink-50/50 dark:bg-gray-800/50 p-4 rounded-2xl border border-pink-100 dark:border-gray-700">
            {activeTab === "info" ? (
              <div className="space-y-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                <p><strong className="text-[var(--color-text-primary)]">Giới tính:</strong> {PUBLIC_INFO.gender}</p>
                <p><strong className="text-[var(--color-text-primary)]">Tuổi:</strong> {PUBLIC_INFO.age}</p>
                <p><strong className="text-[var(--color-text-primary)]">Ngày sinh:</strong> {PUBLIC_INFO.birthdate}</p>
                <p><strong className="text-[var(--color-text-primary)]">Timeline:</strong> {PUBLIC_INFO.timeline}</p>
                <p><strong className="text-[var(--color-text-primary)]">Thân thế:</strong> {PUBLIC_INFO.background}</p>
                <p><strong className="text-[var(--color-text-primary)]">Ngoại hình:</strong> {PUBLIC_INFO.appearance}</p>
                <p><strong className="text-[var(--color-text-primary)]">Tính cách:</strong> {PUBLIC_INFO.personality}</p>
              </div>
            ) : (
              <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-h-48 overflow-y-auto pr-2">
                {INTRO_HISTORY.split("\n\n").map((p, i) => (
                  <p key={i} className="mb-3 italic">{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Info Form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#ff99cc] rounded-full"></span>
            Thông tin của bạn
          </h2>

          {/* User Profiles Quick Select */}
          {userProfiles.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-pink-400" />
                Chọn nhanh hồ sơ đã lưu
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {userProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => selectProfile(profile)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl hover:border-pink-300 transition-all shadow-sm"
                  >
                    <div className="w-6 h-6 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-pink-500" />
                    </div>
                    <span className="text-sm font-bold text-[var(--color-text-primary)]">{profile.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Tên của bạn</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên..."
                className="w-full px-5 py-3 bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[var(--color-text-primary)]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Ngoại hình / Đặc điểm</label>
              <textarea
                value={appearance}
                onChange={(e) => setAppearance(e.target.value)}
                placeholder="Mô tả ngoại hình của bạn..."
                rows={3}
                className="w-full px-5 py-3 bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[var(--color-text-primary)] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-2 ml-1">Tính cách</label>
              <textarea
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder="Mô tả tính cách của bạn..."
                rows={3}
                className="w-full px-5 py-3 bg-pink-50 dark:bg-gray-800 border border-pink-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#ffb6c1] transition-all text-[var(--color-text-primary)] resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#ff99cc] hover:bg-[#ff80bf] text-white font-bold text-lg rounded-2xl shadow-lg shadow-pink-200 dark:shadow-none transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Bắt đầu trò chuyện
            </button>
          </form>
        </div>
      </motion.div>

      {/* Avatar Selection Modal */}
      {showAvatarSelect && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-pink-100 dark:border-gray-800"
          >
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 text-center">Chọn ảnh đại diện</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {AVATAR_OPTIONS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAvatar(url);
                    setShowAvatarSelect(false);
                  }}
                  className={`relative aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                    selectedAvatar === url ? "border-[#ff99cc] scale-105 shadow-lg" : "border-transparent hover:border-pink-200"
                  }`}
                >
                  <img src={url} alt={`Avatar option ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAvatarSelect(false)}
              className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--color-text-primary)] font-bold rounded-xl transition-colors"
            >
              Đóng
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
