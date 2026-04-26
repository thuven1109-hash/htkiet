import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Type, Moon, Sun, ALargeSmall, Check, Plus, Trash2, Pencil } from "lucide-react";
import { useSettings, Theme, FontSize, FontType } from "../contexts/SettingsContext";
import { UserInfo, UserProfile } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo;
  onUpdateUserInfo: (info: UserInfo) => void;
  userProfiles: UserProfile[];
  onUpdateUserProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userInfo,
  onUpdateUserInfo,
  userProfiles,
  onUpdateUserProfiles,
}) => {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<"profile" | "appearance">("profile");
  const [tempUserInfo, setTempUserInfo] = useState<UserInfo>(userInfo);
  const [tempSettings, setTempSettings] = useState(settings);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<UserProfile>({
    id: "",
    name: "",
    appearance: "",
    personality: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setTempSettings(settings);
      setTempUserInfo(userInfo);
    }
  }, [isOpen, settings, userInfo]);

  const fonts: { id: FontType; name: string }[] = [
    { id: "inter", name: "Inter (Mặc định)" },
    { id: "playfair", name: "Playfair Display" },
    { id: "be-vietnam", name: "Be Vietnam Pro" },
    { id: "lora", name: "Lora" },
    { id: "montserrat", name: "Montserrat" },
  ];

  const fontSizes: { id: FontSize; name: string }[] = [
    { id: "xs", name: "Rất bé" },
    { id: "sm", name: "Bé" },
    { id: "base", name: "Vừa" },
    { id: "lg", name: "Lớn" },
    { id: "xl", name: "Rất lớn" },
  ];

  const handleSaveProfile = () => {
    onUpdateUserInfo(tempUserInfo);
  };

  const handleAddProfile = () => {
    if (!profileForm.name.trim()) return;
    if (userProfiles.length >= 5) {
      alert("Tối đa 5 hồ sơ!");
      return;
    }

    const newProfile = { ...profileForm, id: Date.now().toString() };
    onUpdateUserProfiles(prev => [...prev, newProfile]);
    setProfileForm({ id: "", name: "", appearance: "", personality: "" });
    setIsAddingProfile(false);
  };

  const handleUpdateProfile = () => {
    if (!editingProfileId || !profileForm.name.trim()) return;
    onUpdateUserProfiles(prev => prev.map(p => p.id === editingProfileId ? { ...profileForm, id: editingProfileId } : p));
    setEditingProfileId(null);
    setProfileForm({ id: "", name: "", appearance: "", personality: "" });
    setIsAddingProfile(false);
  };

  const handleDeleteProfile = (id: string) => {
    onUpdateUserProfiles(prev => prev.filter(p => p.id !== id));
  };

  const startEditProfile = (profile: UserProfile) => {
    setEditingProfileId(profile.id);
    setProfileForm(profile);
    setIsAddingProfile(true);
  };

  const handleSaveAppearance = () => {
    updateSettings(tempSettings);
  };

  const getFontSizeIndex = (size: FontSize) => fontSizes.findIndex(s => s.id === size);
  const getFontSizeFromIndex = (index: number) => fontSizes[index].id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--color-bg-secondary)] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Type className="w-5 h-5 text-pink-500" />
            Cài đặt
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "profile"
                ? "text-pink-500 border-b-2 border-pink-500"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Hồ sơ
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`flex-1 py-3 font-medium transition-colors ${
              activeTab === "appearance"
                ? "text-pink-500 border-b-2 border-pink-500"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Giao diện
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "profile" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Tên của bạn</label>
                <input
                  type="text"
                  value={tempUserInfo.name}
                  onChange={(e) => setTempUserInfo({ ...tempUserInfo, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ngoại hình / Vai trò</label>
                <textarea
                  value={tempUserInfo.appearance}
                  onChange={(e) => setTempUserInfo({ ...tempUserInfo, appearance: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSaveProfile}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 dark:shadow-none"
              >
                Lưu thay đổi hồ sơ
              </button>

              <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Danh sách hồ sơ ({userProfiles.length}/5)</h3>
                  <button
                    onClick={() => {
                      setEditingProfileId(null);
                      setProfileForm({ id: "", name: "", appearance: "", personality: "" });
                      setIsAddingProfile(!isAddingProfile);
                    }}
                    disabled={userProfiles.length >= 5 && !isAddingProfile}
                    className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-full disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {isAddingProfile && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-pink-100 dark:border-gray-700 space-y-3 overflow-hidden"
                    >
                      <input
                        placeholder="Tên hồ sơ"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <textarea
                        placeholder="Ngoại hình"
                        value={profileForm.appearance}
                        onChange={(e) => setProfileForm({ ...profileForm, appearance: e.target.value })}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 h-16 resize-none"
                      />
                      <textarea
                        placeholder="Tính cách"
                        value={profileForm.personality}
                        onChange={(e) => setProfileForm({ ...profileForm, personality: e.target.value })}
                        className="w-full p-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-pink-500 h-16 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={editingProfileId ? handleUpdateProfile : handleAddProfile}
                          className="flex-1 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold"
                        >
                          {editingProfileId ? "Cập nhật" : "Lưu hồ sơ"}
                        </button>
                        <button
                          onClick={() => setIsAddingProfile(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-xs font-bold"
                        >
                          Hủy
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {userProfiles.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{profile.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{profile.appearance}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditProfile(profile)}
                          className="p-1.5 text-gray-400 hover:text-pink-500"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {userProfiles.length === 0 && !isAddingProfile && (
                    <p className="text-center py-4 text-xs text-gray-400 italic">Chưa có hồ sơ nào được lưu.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Chế độ hiển thị</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTempSettings({ ...tempSettings, theme: "light" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      tempSettings.theme === "light"
                        ? "border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    Sáng
                  </button>
                  <button
                    onClick={() => setTempSettings({ ...tempSettings, theme: "dark" })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      tempSettings.theme === "dark"
                        ? "border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    Tối
                  </button>
                </div>
              </div>

              {/* Font Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Phông chữ</label>
                <div className="grid grid-cols-1 gap-2">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setTempSettings({ ...tempSettings, fontType: f.id })}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        tempSettings.fontType === f.id
                          ? "border-pink-500 bg-pink-50 text-pink-600 dark:bg-pink-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-pink-300"
                      }`}
                    >
                      <span style={{ fontFamily: getFontFamily(f.id) }}>{f.name}</span>
                      {tempSettings.fontType === f.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-500">Kích cỡ chữ</label>
                  <span className="text-xs font-bold text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded-md">
                    {fontSizes[getFontSizeIndex(tempSettings.fontSize)].name}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={getFontSizeIndex(tempSettings.fontSize)}
                  onChange={(e) => setTempSettings({ ...tempSettings, fontSize: getFontSizeFromIndex(parseInt(e.target.value)) })}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between mt-2 px-1">
                  {fontSizes.map((s, i) => (
                    <div key={s.id} className="flex flex-col items-center">
                      <div className={`w-1 h-1 rounded-full ${i <= getFontSizeIndex(tempSettings.fontSize) ? 'bg-pink-500' : 'bg-gray-300'}`} />
                    </div>
                  ))}
                </div>
                
                {/* Preview Box */}
                <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Xem trước</p>
                  <p 
                    style={{ 
                      fontFamily: getFontFamily(tempSettings.fontType),
                      fontSize: getFontSizeValue(tempSettings.fontSize)
                    }}
                    className="text-[var(--color-text-primary)] transition-all"
                  >
                    Đây là nội dung văn bản mẫu để bạn xem trước kích cỡ và phông chữ.
                  </p>
                </div>
              </div>

              <button
                onClick={handleSaveAppearance}
                className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 dark:shadow-none"
              >
                Lưu thiết lập giao diện
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-400">
          Nhấn "Lưu" để áp dụng các thay đổi của bạn.
        </div>
      </motion.div>
    </div>
  );
};

function getFontSizeValue(size: FontSize): string {
  switch (size) {
    case "xs": return "12px";
    case "sm": return "14px";
    case "lg": return "16px";
    case "xl": return "28px";
    default: return "15px";
  }
}

function getFontFamily(font: FontType): string {
  switch (font) {
    case "playfair": return "'Playfair Display', serif";
    case "be-vietnam": return "'Be Vietnam Pro', sans-serif";
    case "lora": return "'Lora', serif";
    case "montserrat": return "'Montserrat', sans-serif";
    default: return "'Inter', sans-serif";
  }
}
