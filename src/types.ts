export interface UserProfile {
  id: string;
  name: string;
  appearance: string;
  personality: string;
}

export interface UserInfo {
  name: string;
  appearance: string;
  personality?: string;
  age: number;
  background: string;
}

export interface MessageVariant {
  content: string;
  scoreChange?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  scoreChange?: number;
  variants?: MessageVariant[];
  currentVariantIndex?: number;
}

export interface DiaryEntry {
  day: number;
  date: string; // YYYY-MM-DD
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastUpdate: number;
  userInfo: UserInfo;
  inventory: string[];
  customCharacters?: CustomSideCharacter[];
  notebookEvents?: string[];
  favorability?: number;
  diaryEntries?: DiaryEntry[];
  snapshots?: StorySnapshot[];
  charAvatar?: string;
}

export interface StorySnapshot {
  id: string;
  name: string;
  timestamp: number;
  messageCount: number;
  inventory: string[];
  favorability: number;
  notebookEvents: string[];
  // We store the current message history up to this point
  messages: Message[];
}

export interface SideCharacter {
  name: string;
  description: string;
  role: string;
  gender: string;
}

export interface CustomSideCharacter extends SideCharacter {
  birthDate: string;
  appearance: string;
  personality: string;
}

export interface GeminiModel {
  id: string;
  name: string;
  description: string;
  price: string;
}

export interface Song {
  id: string;
  title: string;
  youtubeId: string;
  url: string;
}

export interface MusicState {
  playlist: Song[];
  isPlaying: boolean;
  currentSongIndex: number;
  loopMode: 'none' | 'list' | 'single';
  isShuffle: boolean;
  discPosition?: { x: number; y: number };
  isDiscVisible: boolean;
}
