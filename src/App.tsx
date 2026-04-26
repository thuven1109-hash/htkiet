import React from "react";
import { IntroScreen } from "./components/IntroScreen";
import { ChatInterface } from "./components/ChatInterface";
import { Sidebar } from "./components/Sidebar";
import { UserInfo, ChatSession, Message, CustomSideCharacter, DiaryEntry, MusicState, UserProfile } from "./types";
import { FIRST_MESSAGE, CHAR_AVATAR, PUBLIC_INFO, GEMINI_MODELS } from "./constants";
import { sendMessage } from "./services/gemini";
import { motion, AnimatePresence } from "motion/react";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { SettingsModal } from "./components/SettingsModal";
import { MusicPlayer, FloatingMusicDisc } from "./components/MusicPlayer";

const STORAGE_KEY = "hoi_uc_nam_ky_sessions";
const API_KEY_STORAGE = "user_api_key";
const API_KEYS_LIST_STORAGE = "user_api_keys_list";
const MODEL_STORAGE = "selectedModel";
const NOTEBOOK_STORAGE = "user_notebook_content";
const NOTEBOOK_ENABLED_STORAGE = "user_notebook_enabled";
const MUSIC_STORAGE = "hoi_uc_nam_ky_music";
const USER_PROFILES_STORAGE = "hoi_uc_nam_ky_user_profiles";

export default function App() {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [sidebarTab, setSidebarTab] = React.useState<"history" | "characters" | "notebook" | "snapshots">("history");
  const [isTyping, setIsTyping] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  
  // Notebook & Custom Character State
  const [notebookEvents, setNotebookEvents] = React.useState<string[]>([]);
  const [customCharacters, setCustomCharacters] = React.useState<CustomSideCharacter[]>([]);
  const [userProfiles, setUserProfiles] = React.useState<UserProfile[]>([]);
  const [diaryEntries, setDiaryEntries] = React.useState<DiaryEntry[]>([]);

  // API Key & Model State
  const [apiKey, setApiKey] = React.useState<string | null>(() => localStorage.getItem(API_KEY_STORAGE));
  const [savedApiKeys, setSavedApiKeys] = React.useState<string[]>(() => {
    const saved = localStorage.getItem(API_KEYS_LIST_STORAGE);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [selectedModel, setSelectedModel] = React.useState<string>(() => localStorage.getItem(MODEL_STORAGE) || "gemini-3-flash-preview");
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = React.useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = React.useState(false);
  const [apiKeyError, setApiKeyError] = React.useState<string | null>(null);
  const [lastError, setLastError] = React.useState<{ message: string; sessionId: string } | null>(null);

  // Music State
  const [musicState, setMusicState] = React.useState<MusicState>(() => {
    const defaultState: MusicState = {
      playlist: [],
      isPlaying: false,
      currentSongIndex: 0,
      loopMode: 'none',
      isShuffle: false,
      isDiscVisible: true,
      discPosition: { x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300, y: 80 }
    };
    const saved = localStorage.getItem(MUSIC_STORAGE);
    if (saved) {
      try {
        return { ...defaultState, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse music state", e);
      }
    }
    return defaultState;
  });
  const [isMusicPlayerOpen, setIsMusicPlayerOpen] = React.useState(false);

  const handleUpdateUserInfo = (info: UserInfo) => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) => (s.id === currentSessionId ? { ...s, userInfo: info } : s))
    );
    showToast("Đã cập nhật hồ sơ của bạn");
  };

  const handleSaveApiKey = (key: string, model: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    localStorage.setItem(MODEL_STORAGE, model);
    
    // Add to list if not already there
    if (!savedApiKeys.includes(key)) {
      const newList = [key, ...savedApiKeys];
      setSavedApiKeys(newList);
      localStorage.setItem(API_KEYS_LIST_STORAGE, JSON.stringify(newList));
    }

    setApiKey(key);
    setSelectedModel(model);
    setIsApiKeyModalOpen(false);
    setApiKeyError(null);
  };

  const handleDeleteSavedKey = (key: string) => {
    const newList = savedApiKeys.filter(k => k !== key);
    setSavedApiKeys(newList);
    localStorage.setItem(API_KEYS_LIST_STORAGE, JSON.stringify(newList));
    
    // If the deleted key was the current one, clear it
    if (apiKey === key) {
      localStorage.removeItem(API_KEY_STORAGE);
      setApiKey(null);
    }
  };

  // Load sessions from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions to localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  // Save music state to localStorage
  React.useEffect(() => {
    localStorage.setItem(MUSIC_STORAGE, JSON.stringify(musicState));
  }, [musicState]);

  // Load user profiles from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(USER_PROFILES_STORAGE);
    if (saved) {
      try {
        setUserProfiles(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse user profiles", e);
      }
    }
  }, []);

  // Save user profiles to localStorage
  React.useEffect(() => {
    localStorage.setItem(USER_PROFILES_STORAGE, JSON.stringify(userProfiles));
  }, [userProfiles]);

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartChat = (userInfo: UserInfo, charAvatar: string) => {
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Chuyện của ${userInfo.name}`,
      messages: [
        {
          id: "first",
          role: "assistant",
          content: FIRST_MESSAGE,
          timestamp: Date.now(),
        },
      ],
      lastUpdate: Date.now(),
      userInfo,
      inventory: [],
      customCharacters: [],
      notebookEvents: [],
      favorability: 0,
      diaryEntries: [],
      charAvatar,
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
    setNotebookEvents([]);
    setCustomCharacters([]);
    setDiaryEntries([]);
  };

  const processAIResponse = (text: string, sessionId: string, replaceMessageId?: string) => {
    let processedText = text;
    const inventoryUpdates: string[] = [];
    let scoreChange = 0;

    // Extract [GET: Item Name]
    const getRegex = /\[GET:\s*(.*?)\]/g;
    let match;
    while ((match = getRegex.exec(text)) !== null) {
      inventoryUpdates.push(match[1].trim());
    }

    // Extract SCORE: [number] or SCORE: number or [SCORE: number] or **SCORE:** number
    const scoreRegex = /\[?\**SCORE\**:\s*\[?([+-]?\s*\d+)\]?\]?/i;
    const scoreMatch = text.match(scoreRegex);
    if (scoreMatch) {
      scoreChange = parseInt(scoreMatch[1].replace(/\s+/g, ''));
    }

    // Remove [GET: ...] and SCORE: ... from display text
    const scoreReplaceRegex = /\[?\**SCORE\**:\s*\[?([+-]?\s*\d+)\]?\]?.*$/gim;
    processedText = processedText.replace(getRegex, "").replace(scoreReplaceRegex, "").trim();

    // Update session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const newInventory = [...s.inventory];
          inventoryUpdates.forEach((item) => {
            if (!newInventory.includes(item)) {
              newInventory.push(item);
              showToast(`Bạn đã nhận được [${item}]`);
            }
          });
          
          let newMessages = [...s.messages];
          let newFavorability = s.favorability || 0;

          if (replaceMessageId) {
            const msgIndex = newMessages.findIndex(m => m.id === replaceMessageId);
            if (msgIndex !== -1) {
              const oldMsg = newMessages[msgIndex];
              const oldScore = oldMsg.scoreChange || 0;
              
              const variants = oldMsg.variants ? [...oldMsg.variants] : [{ content: oldMsg.content, scoreChange: oldMsg.scoreChange }];
              variants.push({ content: processedText, scoreChange: scoreChange !== 0 ? scoreChange : undefined });
              
              newMessages[msgIndex] = {
                ...oldMsg,
                content: processedText,
                scoreChange: scoreChange !== 0 ? scoreChange : undefined,
                variants,
                currentVariantIndex: variants.length - 1,
              };
              
              newFavorability = newFavorability - oldScore + scoreChange;
            }
          } else {
            newFavorability += scoreChange;
            newMessages.push({
              id: Date.now().toString(),
              role: "assistant",
              content: processedText,
              timestamp: Date.now(),
              scoreChange: scoreChange !== 0 ? scoreChange : undefined,
              variants: [{ content: processedText, scoreChange: scoreChange !== 0 ? scoreChange : undefined }],
              currentVariantIndex: 0,
            });
          }

          return {
            ...s,
            messages: newMessages,
            inventory: newInventory,
            favorability: newFavorability,
            lastUpdate: Date.now(),
          };
        }
        return s;
      })
    );
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId || !currentSession) return;

    // Detect item removal
    const removalKeywords = ["sử dụng", "bán", "bỏ", "vứt", "tặng", "trao", "khoe"];
    let itemToRemove: string | null = null;
    const lowerContent = content.toLowerCase();

    // Check for items in inventory mentioned in the message along with removal keywords
    for (const item of currentSession.inventory) {
      if (lowerContent.includes(item.toLowerCase())) {
        if (removalKeywords.some((kw) => lowerContent.includes(kw))) {
          itemToRemove = item;
          break;
        }
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    // Update UI immediately
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          const newInventory = itemToRemove
            ? s.inventory.filter((i) => i !== itemToRemove)
            : s.inventory;
          
          if (itemToRemove) {
            showToast(`Đã dùng/bỏ: [${itemToRemove}]`);
          }

          return {
            ...s,
            messages: [...s.messages, userMessage],
            inventory: newInventory,
            lastUpdate: Date.now(),
          };
        }
        return s;
      })
    );

    setIsTyping(true);
    setLastError(null);
    try {
      if (!apiKey) throw new Error("MISSING_KEY");
      
      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        [...currentSession.messages, userMessage],
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        currentSession.userInfo.personality || "",
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Lỗi không xác định";
      
      if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("invalid") || errorMessage === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      } else {
        setLastError({ message: errorMessage, sessionId: currentSessionId });
        showToast(errorMessage.length < 100 ? errorMessage : "Có lỗi xảy ra khi kết nối với nhân vật...");
      }
    } finally {
      setIsTyping(false);
      
      const today = new Date().toISOString().split('T')[0];
      const hasDiaryToday = diaryEntries.find(e => e.date === today);
      if (!hasDiaryToday && Math.random() < 0.15) {
        setTimeout(() => handleGenerateDiary(), 5000);
      }
    }
  };

  const handleEditLastMessage = (newContent: string) => {
    if (!currentSessionId || !currentSession) return;
    
    const lastMsg = currentSession.messages[currentSession.messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m, i) => 
                i === s.messages.length - 1 ? { ...m, content: newContent } : m
              ),
              lastUpdate: Date.now()
            }
          : s
      )
    );
    showToast("Đã cập nhật nội dung phản hồi");
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === messageId ? { ...m, content: newContent } : m
              ),
              lastUpdate: Date.now(),
            }
          : s
      )
    );
    showToast("Đã cập nhật tin nhắn");
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: s.messages.filter((m) => m.id !== messageId),
              lastUpdate: Date.now(),
            }
          : s
      )
    );
    showToast("Đã xóa tin nhắn");
  };

  const handleRetry = async () => {
    if (!lastError || !currentSessionId || !currentSession) return;
    
    // The message that needs a response is the last user message
    const lastUserMessage = [...currentSession.messages].reverse().find(m => m.role === "user");
    if (!lastUserMessage) return;

    setIsTyping(true);
    setLastError(null);
    
    try {
      if (!apiKey) throw new Error("MISSING_KEY");
      
      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        currentSession.messages,
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        currentSession.userInfo.personality || "",
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("invalid") || error.message === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      } else {
        setLastError({ message: error.message || "Unknown error", sessionId: currentSessionId });
        showToast("Có lỗi xảy ra khi kết nối với nhân vật...");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectVariant = (messageId: string, variantIndex: number) => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessionId) {
          let newFavorability = s.favorability || 0;
          const newMessages = s.messages.map((m) => {
            if (m.id === messageId && m.variants && m.variants[variantIndex]) {
              const oldScore = m.scoreChange || 0;
              const newScore = m.variants[variantIndex].scoreChange || 0;
              newFavorability = newFavorability - oldScore + newScore;
              return {
                ...m,
                content: m.variants[variantIndex].content,
                scoreChange: m.variants[variantIndex].scoreChange,
                currentVariantIndex: variantIndex,
              };
            }
            return m;
          });
          return {
            ...s,
            messages: newMessages,
            favorability: newFavorability,
            lastUpdate: Date.now(),
          };
        }
        return s;
      })
    );
  };

  const handleSaveSnapshot = (name: string) => {
    if (!currentSessionId || !currentSession) return;

    const newSnapshot = {
      id: Date.now().toString(),
      name,
      timestamp: Date.now(),
      messageCount: currentSession.messages.length,
      inventory: [...currentSession.inventory],
      favorability: currentSession.favorability || 0,
      notebookEvents: [...notebookEvents],
      messages: [...currentSession.messages],
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, snapshots: [newSnapshot, ...(s.snapshots || [])] }
          : s
      )
    );
    showToast(`Đã lưu snapshot: ${name}`);
  };

  const handleLoadSnapshot = (snapshot: any) => {
    if (!currentSessionId) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [...snapshot.messages],
              inventory: [...snapshot.inventory],
              favorability: snapshot.favorability,
              notebookEvents: [...snapshot.notebookEvents],
              lastUpdate: Date.now(),
            }
          : s
      )
    );
    setNotebookEvents([...snapshot.notebookEvents]);
    showToast(`Đã tải lại snapshot: ${snapshot.name}`);
  };

  const handleDeleteSnapshot = (snapshotId: string) => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              snapshots: (s.snapshots || []).filter((snap) => snap.id !== snapshotId),
            }
          : s
      )
    );
    showToast("Đã xóa snapshot");
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      setNotebookEvents(session.notebookEvents || []);
      setCustomCharacters(session.customCharacters || []);
      setDiaryEntries(session.diaryEntries || []);
    }
  };

  const handleAddNotebookEvent = (event: string) => {
    if (notebookEvents.length >= 20) return;
    const newEvents = [...notebookEvents, event];
    setNotebookEvents(newEvents);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, notebookEvents: newEvents } : s));
  };

  const handleDeleteNotebookEvent = (index: number) => {
    const newEvents = notebookEvents.filter((_, i) => i !== index);
    setNotebookEvents(newEvents);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, notebookEvents: newEvents } : s));
  };

  const handleEditNotebookEvent = (index: number, event: string) => {
    const newEvents = notebookEvents.map((e, i) => i === index ? event : e);
    setNotebookEvents(newEvents);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, notebookEvents: newEvents } : s));
  };

  const handleAddCustomCharacter = (char: CustomSideCharacter) => {
    const newChars = [...customCharacters, char];
    setCustomCharacters(newChars);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, customCharacters: newChars } : s));
  };

  const handleDeleteCustomCharacter = (index: number) => {
    const newChars = customCharacters.filter((_, i) => i !== index);
    setCustomCharacters(newChars);
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, customCharacters: newChars } : s));
  };

  const handleGenerateDiary = async () => {
    if (!currentSessionId || !currentSession) return;

    const today = new Date().toISOString().split('T')[0];
    const existingEntry = diaryEntries.find(e => e.date === today);
    
    if (existingEntry) return;

    try {
      if (!apiKey) return;

      const diaryPrompt = `
        Dựa trên lịch sử trò chuyện và bối cảnh nhân vật ${PUBLIC_INFO.name}, hãy viết một trang nhật ký cho ngày hôm nay (Ngày thứ ${diaryEntries.length + 1}).
        
        YÊU CẦU:
        1. Viết dưới góc nhìn thứ nhất (xưng "ta" hoặc "tôi") của ${PUBLIC_INFO.name}.
        2. Thể hiện những suy nghĩ sâu sắc, trăn trở về những gì đã xảy ra trong cuộc trò chuyện gần đây với {{user}}.
        3. Bộc lộ những cảm xúc mâu thuẫn: hận thù, khao khát chiếm hữu, sự lụy tình thầm kín.
        4. Sử dụng văn phong Nam Bộ xưa, sâu sắc và đầy tâm trạng.
        5. KHÔNG bao gồm bất kỳ định dạng nào khác (như SCORE hay GET). Chỉ trả về nội dung trang nhật ký.
        6. Độ dài khoảng 200-400 chữ.
      `;

      const response = await sendMessage(
        currentSession.messages,
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        apiKey,
        selectedModel,
        diaryPrompt
      );

      const newEntry: DiaryEntry = {
        day: diaryEntries.length + 1,
        date: today,
        content: response,
        timestamp: Date.now(),
      };

      const newDiaryEntries = [...diaryEntries, newEntry];
      setDiaryEntries(newDiaryEntries);
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, diaryEntries: newDiaryEntries } : s));
      showToast("Nhân vật vừa âm thầm viết một trang nhật ký mới...");
    } catch (error) {
      console.error("Failed to generate auto diary", error);
    }
  };
  const handleRefresh = async () => {
    if (!currentSessionId || !currentSession || isTyping) return;
    
    // Get last message if it was from assistant
    const lastMsg = currentSession.messages[currentSession.messages.length - 1];
    if (lastMsg.role !== "assistant") return;

    // We use the messages BEFORE the last one for context
    const newMessages = currentSession.messages.slice(0, -1);

    setIsTyping(true);
    try {
      if (!apiKey) throw new Error("MISSING_KEY");

      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        newMessages,
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        currentSession.userInfo.personality || "",
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId, lastMsg.id);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Lỗi không xác định";

      if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("invalid") || errorMessage === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      } else {
        setLastError({ message: errorMessage, sessionId: currentSessionId });
        showToast(errorMessage.length < 100 ? errorMessage : "Có lỗi xảy ra khi kết nối với nhân vật...");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleFastForward = async () => {
    if (!currentSessionId || !currentSession || isTyping) return;
    
    setIsTyping(true);
    try {
      if (!apiKey) throw new Error("MISSING_KEY");

      let additionalPrompt = "";
      if (notebookEvents.length > 0) {
        additionalPrompt += `SỔ TAY SỰ KIỆN (Ghi nhớ quan trọng):\n${notebookEvents.map((e, i) => `${i+1}. ${e}`).join("\n")}\n\n`;
      }
      if (customCharacters.length > 0) {
        additionalPrompt += `NHÂN VẬT PHỤ MỚI XUẤT HIỆN:\n${customCharacters.map(c => `- ${c.name} (${c.gender}): ${c.role}. ${c.description}`).join("\n")}\n\n`;
      }

      const response = await sendMessage(
        currentSession.messages,
        currentSession.userInfo.name,
        currentSession.userInfo.appearance,
        currentSession.userInfo.personality || "",
        apiKey,
        selectedModel,
        additionalPrompt
      );
      processAIResponse(response, currentSessionId);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "Lỗi không xác định";

      if (errorMessage.includes("API_KEY_INVALID") || errorMessage.includes("invalid") || errorMessage === "MISSING_KEY") {
        setApiKeyError("Mã Key không hợp lệ, vui lòng kiểm tra lại");
        setIsApiKeyModalOpen(true);
      } else {
        setLastError({ message: errorMessage, sessionId: currentSessionId });
        showToast(errorMessage.length < 100 ? errorMessage : "Có lỗi xảy ra khi kết nối với nhân vật...");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  return (
    <div className="text-[var(--color-text-primary)]">
      <AnimatePresence mode="wait">
        {!currentSessionId ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <IntroScreen 
              onStart={handleStartChat} 
              onToggleSidebar={() => setIsSidebarOpen(true)}
              userProfiles={userProfiles}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChatInterface
              messages={currentSession.messages}
              userInfo={currentSession.userInfo}
              onSendMessage={handleSendMessage}
              onBack={() => {
                setCurrentSessionId(null);
                setNotebookEvents([]);
                setCustomCharacters([]);
              }}
              onToggleSidebar={() => setIsSidebarOpen(true)}
              onRefresh={handleRefresh}
              onFastForward={handleFastForward}
              onEditLastMessage={handleEditLastMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onSelectVariant={handleSelectVariant}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onOpenNotebook={() => {
                setSidebarTab("notebook");
                setIsSidebarOpen(true);
              }}
              onOpenMusicPlayer={() => setIsMusicPlayerOpen(true)}
              inventory={currentSession?.inventory || []}
              favorability={currentSession?.favorability || 0}
              diaryEntries={diaryEntries}
              onUseItem={() => {}} // Handled inside ChatInterface
              isTyping={isTyping}
              modelName={GEMINI_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
              charAvatar={currentSession.charAvatar || CHAR_AVATAR}
              hasError={!!lastError && lastError.sessionId === currentSessionId}
              onRetry={handleRetry}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={sidebarTab}
        onTabChange={setSidebarTab}
        isChatActive={!!currentSessionId}
        sessions={sessions}
        currentSessionId={currentSessionId || ""}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={() => {
          setCurrentSessionId(null);
          setNotebookEvents([]);
          setCustomCharacters([]);
        }}
        onChangeApiKey={() => setIsApiKeyModalOpen(true)}
        notebookEvents={notebookEvents}
        onAddNotebookEvent={handleAddNotebookEvent}
        onEditNotebookEvent={handleEditNotebookEvent}
        onDeleteNotebookEvent={handleDeleteNotebookEvent}
        customCharacters={customCharacters}
        onAddCustomCharacter={handleAddCustomCharacter}
        onDeleteCustomCharacter={handleDeleteCustomCharacter}
        snapshots={currentSession?.snapshots || []}
        onSaveSnapshot={handleSaveSnapshot}
        onLoadSnapshot={handleLoadSnapshot}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onSave={handleSaveApiKey}
        onClose={() => setIsApiKeyModalOpen(false)}
        error={apiKeyError}
        initialModel={selectedModel}
        savedKeys={savedApiKeys}
        onDeleteKey={handleDeleteSavedKey}
      />

      {currentSession && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          userInfo={currentSession.userInfo}
          onUpdateUserInfo={handleUpdateUserInfo}
          userProfiles={userProfiles}
          onUpdateUserProfiles={setUserProfiles}
        />
      )}

      {/* Music Player */}
      <MusicPlayer
        isOpen={isMusicPlayerOpen}
        onClose={() => setIsMusicPlayerOpen(false)}
        musicState={musicState}
        setMusicState={setMusicState}
      />

      {musicState.isDiscVisible && musicState.playlist.length > 0 && (
        <FloatingMusicDisc
          isPlaying={musicState.isPlaying}
          onClick={() => setIsMusicPlayerOpen(true)}
          position={musicState.discPosition}
          onDragEnd={(x, y) => setMusicState(prev => ({ ...prev, discPosition: { x, y } }))}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#ff99cc] text-white px-6 py-3 rounded-full shadow-lg z-50 font-bold text-sm"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}