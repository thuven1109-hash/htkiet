import React from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { Music, Repeat, Trash2, Plus, X, Music2, Heart, Sparkles, Star, Shuffle, SkipBack, SkipForward, Play, Pause } from "lucide-react";
import { Song, MusicState } from "../types";

interface MusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  musicState: MusicState;
  setMusicState: React.Dispatch<React.SetStateAction<MusicState>>;
}

const CatPawIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12,14c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S14.2,14,12,14z M7,11c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S8.1,11,7,11z M17,11c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S18.1,11,17,11z M9,6C7.9,6,7,6.9,7,8s0.9,2,2,2s2-0.9,2-2S10.1,6,9,6z M15,6c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S16.1,6,15,6z" />
  </svg>
);

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isOpen,
  onClose,
  musicState,
  setMusicState,
}) => {
  const [newUrl, setNewUrl] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playerRef = React.useRef<any>(null);

  // Initialize YouTube Player API
  React.useEffect(() => {
    // @ts-ignore
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      // If API already exists, we might need to trigger player creation
      initPlayer();
    }

    // @ts-ignore
    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const initPlayer = () => {
    // @ts-ignore
    if (window.YT && window.YT.Player && !playerRef.current) {
      const song = musicStateRef.current.playlist[musicStateRef.current.currentSongIndex];
      // @ts-ignore
      new window.YT.Player('youtube-player', {
        height: '100',
        width: '100',
        videoId: song?.youtubeId || '',
        playerVars: {
          autoplay: musicStateRef.current.isPlaying ? 1 : 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }
  };

  const onPlayerReady = (event: any) => {
    playerRef.current = event.target;
    if (musicStateRef.current.isPlaying) {
      event.target.playVideo();
    }
  };

  const musicStateRef = React.useRef(musicState);
  React.useEffect(() => {
    musicStateRef.current = musicState;
  }, [musicState]);

  const onPlayerStateChange = (event: any) => {
    // @ts-ignore
    if (event.data === window.YT.PlayerState.ENDED) {
      const state = musicStateRef.current;
      if (state.loopMode === 'single') {
        event.target.playVideo();
      } else if (state.isShuffle) {
        const nextIndex = Math.floor(Math.random() * state.playlist.length);
        setMusicState(prev => ({ ...prev, currentSongIndex: nextIndex, isPlaying: true }));
      } else if (state.loopMode === 'list') {
        const nextIndex = (state.currentSongIndex + 1) % state.playlist.length;
        setMusicState(prev => ({ ...prev, currentSongIndex: nextIndex, isPlaying: true }));
      } else {
        const nextIndex = state.currentSongIndex + 1;
        if (nextIndex < state.playlist.length) {
          setMusicState(prev => ({ ...prev, currentSongIndex: nextIndex, isPlaying: true }));
        } else {
          setMusicState(prev => ({ ...prev, isPlaying: false }));
        }
      }
    }
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    const updateProgress = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const current = playerRef.current.getCurrentTime();
        const total = playerRef.current.getDuration();
        if (total > 0) {
          setCurrentTime(current);
          setDuration(total);
          setProgress((current / total) * 100);
        }
      }
    };

    if (musicState.isPlaying) {
      interval = setInterval(updateProgress, 500);
    }
    return () => clearInterval(interval);
  }, [musicState.isPlaying]);

  React.useEffect(() => {
    if (playerRef.current) {
      if (musicState.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [musicState.isPlaying]);

  const currentSong = musicState.playlist[musicState.currentSongIndex];

  React.useEffect(() => {
    if (playerRef.current && currentSong) {
      const state = playerRef.current.getPlayerState();
      // Only load if it's a different video than what's currently loaded
      const currentVideoUrl = playerRef.current.getVideoUrl?.() || "";
      if (!currentVideoUrl.includes(currentSong.youtubeId)) {
        if (musicState.isPlaying) {
          playerRef.current.loadVideoById(currentSong.youtubeId);
        } else {
          playerRef.current.cueVideoById(currentSong.youtubeId);
        }
      }
    }
  }, [musicState.currentSongIndex, !!currentSong]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
    setProgress(percentage * 100);
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchTitle = async (id: string) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      const data = await response.json();
      return data.title || `Bài hát ${musicState.playlist.length + 1}`;
    } catch (e) {
      return `Bài hát ${musicState.playlist.length + 1}`;
    }
  };

  const handleAddSong = async () => {
    const id = extractYoutubeId(newUrl);
    if (!id) {
      alert("Link YouTube không hợp lệ!");
      return;
    }
    if (musicState.playlist.length >= 5) {
      alert("Tối đa 5 bài hát!");
      return;
    }

    const title = await fetchTitle(id);
    const newSong: Song = {
      id: Date.now().toString(),
      title: title,
      youtubeId: id,
      url: newUrl,
    };

    setMusicState(prev => ({
      ...prev,
      playlist: [...prev.playlist, newSong]
    }));
    setNewUrl("");
  };

  const handleDeleteSong = (id: string) => {
    setMusicState(prev => {
      const newPlaylist = prev.playlist.filter(s => s.id !== id);
      let newIndex = prev.currentSongIndex;
      if (newIndex >= newPlaylist.length) {
        newIndex = 0;
      }
      return {
        ...prev,
        playlist: newPlaylist,
        currentSongIndex: newIndex
      };
    });
  };

  const togglePlay = () => {
    setMusicState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const playNext = () => {
    setMusicState(prev => {
      if (prev.playlist.length === 0) return prev;
      let nextIndex;
      if (prev.isShuffle) {
        nextIndex = Math.floor(Math.random() * prev.playlist.length);
      } else {
        nextIndex = (prev.currentSongIndex + 1) % prev.playlist.length;
      }
      return { ...prev, currentSongIndex: nextIndex, isPlaying: true };
    });
  };

  const playPrev = () => {
    setMusicState(prev => {
      if (prev.playlist.length === 0) return prev;
      const prevIndex = (prev.currentSongIndex - 1 + prev.playlist.length) % prev.playlist.length;
      return { ...prev, currentSongIndex: prevIndex, isPlaying: true };
    });
  };

  const handleLoopClick = () => {
    setMusicState(prev => {
      if (prev.loopMode === "none") return { ...prev, loopMode: "list" };
      if (prev.loopMode === "list") return { ...prev, loopMode: "single" };
      return { ...prev, loopMode: "none" };
    });
  };

  const playlistIds = musicState.playlist.map(s => s.youtubeId).join(",");

  return (
    <>
      {/* Persistent Player Placeholder */}
      <div className="fixed -top-100 -left-100 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
        <div id="youtube-player"></div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pink-100/20 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border-4 border-pink-200 dark:border-pink-900/30 relative">
              {/* Decorative background elements */}
              <div className="absolute top-10 left-10 text-pink-100 dark:text-pink-900/20 pointer-events-none">
                <Star className="w-12 h-12 rotate-12" />
              </div>
              <div className="absolute bottom-10 right-10 text-pink-100 dark:text-pink-900/20 pointer-events-none">
                <Heart className="w-16 h-16 -rotate-12" />
              </div>

              <div className="bg-pink-200 dark:bg-pink-900/50 p-5 flex items-center justify-between text-pink-600 dark:text-pink-300 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                    <Music className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg tracking-tight">Giai Điệu Của Cậu</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                {/* Current Song Info */}
                <div className="text-center space-y-2">
                  <div className="inline-block p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl mb-2">
                    <Sparkles className="w-6 h-6 text-pink-400 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-pink-500 dark:text-pink-400 truncate px-4">
                    {currentSong ? currentSong.title : "Chưa chọn bài hát"}
                  </h4>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={handleLoopClick}
                      className={`p-3 rounded-xl transition-all relative group ${
                        musicState.loopMode !== "none" 
                          ? "bg-pink-100 text-pink-500 dark:bg-pink-900/40" 
                          : "bg-gray-50 text-gray-300 dark:bg-gray-800"
                      }`}
                    >
                      <Repeat className={`w-5 h-5 ${musicState.loopMode === "single" ? "scale-110" : ""}`} />
                      {musicState.loopMode === "single" && (
                        <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[8px] w-3 h-3 rounded-full flex items-center justify-center">1</span>
                      )}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {musicState.loopMode === "none" ? "Không lặp" : musicState.loopMode === "list" ? "Lặp danh sách" : "Lặp 1 bài"}
                      </div>
                    </button>

                    <button
                      onClick={playPrev}
                      className="p-3 bg-pink-50 hover:bg-pink-100 text-pink-400 rounded-xl transition-all active:scale-90 dark:bg-gray-800"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 bg-pink-300 hover:bg-pink-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
                    >
                      {musicState.isPlaying ? (
                        <Pause className="w-8 h-8 fill-current" />
                      ) : (
                        <Play className="w-8 h-8 fill-current ml-1" />
                      )}
                    </button>

                    <button
                      onClick={playNext}
                      className="p-3 bg-pink-50 hover:bg-pink-100 text-pink-400 rounded-xl transition-all active:scale-90 dark:bg-gray-800"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => setMusicState(prev => ({ ...prev, isShuffle: !prev.isShuffle }))}
                      className={`p-3 rounded-xl transition-all relative group ${
                        musicState.isShuffle
                          ? "bg-pink-100 text-pink-500 dark:bg-pink-900/40" 
                          : "bg-gray-50 text-gray-300 dark:bg-gray-800"
                      }`}
                    >
                      <Shuffle className="w-5 h-5" />
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        Phát ngẫu nhiên: {musicState.isShuffle ? "Bật" : "Tắt"}
                      </div>
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 relative z-10">
                    <div 
                      className="h-3 w-full bg-pink-50 dark:bg-gray-800 rounded-full overflow-hidden border border-pink-100 dark:border-pink-900/20 relative cursor-pointer"
                      onClick={handleSeek}
                    >
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-300 to-pink-400"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                      />
                    </div>
                    {/* Progress Indicator */}
                    <motion.div 
                      className="absolute top-0 -mt-1 text-pink-400 pointer-events-none"
                      initial={false}
                      animate={{ left: `${progress}%` }}
                      style={{ x: "-50%" }}
                      transition={{ duration: 0.5, ease: "linear" }}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </motion.div>
                    <div className="flex justify-between text-[10px] font-bold text-pink-300 uppercase tracking-widest">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Toggle Disc Visibility */}
                <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-gray-800 rounded-2xl border border-pink-100 dark:border-pink-900/20">
                  <div className="flex items-center gap-3">
                    <Music2 className="w-5 h-5 text-pink-400" />
                    <span className="text-sm font-bold text-pink-600 dark:text-pink-400">Đĩa nhạc di động</span>
                  </div>
                  <button
                    onClick={() => setMusicState(prev => ({ ...prev, isDiscVisible: !prev.isDiscVisible }))}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      musicState.isDiscVisible ? "bg-pink-400" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <motion.div
                      animate={{ x: musicState.isDiscVisible ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Add Song */}
                <div className="flex gap-3 relative z-10">
                  <input
                    type="text"
                    placeholder="Dán link YouTube cute..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="flex-1 px-5 py-3 bg-pink-50 dark:bg-gray-800 border-2 border-pink-100 dark:border-pink-900/30 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/20 transition-all"
                  />
                  <button
                    onClick={handleAddSong}
                    disabled={musicState.playlist.length >= 5}
                    className="p-3 bg-pink-300 text-white rounded-2xl hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-pink-100 dark:shadow-none"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                {/* Playlist */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                  {musicState.playlist.map((song, index) => (
                    <div
                      key={song.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        musicState.currentSongIndex === index
                          ? "bg-pink-50 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800"
                          : "bg-white border-gray-50 dark:bg-gray-800 dark:border-gray-700"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setMusicState(prev => ({ ...prev, currentSongIndex: index, isPlaying: true }));
                          setProgress(0);
                        }}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className={`p-2 rounded-xl ${
                          musicState.currentSongIndex === index ? "bg-pink-400 text-white" : "bg-pink-50 dark:bg-gray-700 text-pink-300"
                        }`}>
                          <Heart className="w-4 h-4 fill-current" />
                        </div>
                        <span className={`text-sm font-bold truncate max-w-[180px] ${
                          musicState.currentSongIndex === index ? "text-pink-600 dark:text-pink-400" : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {song.title}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const FloatingMusicDisc: React.FC<{
  isPlaying: boolean;
  onClick: () => void;
  position?: { x: number; y: number };
  onDragEnd: (x: number, y: number) => void;
}> = ({ isPlaying, onClick, position, onDragEnd }) => {
  const x = position?.x ?? (typeof window !== 'undefined' ? window.innerWidth - 80 : 0);
  const y = position?.y ?? 80;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ 
        left: 0, 
        right: typeof window !== 'undefined' ? window.innerWidth - 64 : 1000, 
        top: 0, 
        bottom: typeof window !== 'undefined' ? window.innerHeight - 64 : 1000 
      }}
      initial={{ x, y }}
      animate={{ x, y }}
      onDragEnd={(_, info) => onDragEnd(info.point.x - 32, info.point.y - 32)}
      className="fixed top-0 left-0 z-[9999] cursor-move"
      whileDrag={{ scale: 1.1 }}
    >
      <button
        onClick={onClick}
        className="relative group pointer-events-auto"
      >
        <motion.div
          animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
          transition={isPlaying ? { duration: 6, repeat: Infinity, ease: "linear" } : {}}
          className={`w-16 h-16 rounded-full border-4 border-pink-200 bg-pink-50 flex items-center justify-center shadow-xl ${
            isPlaying ? "ring-8 ring-pink-100/50" : ""
          }`}
        >
          <div className="w-full h-full bg-gradient-to-br from-pink-50 to-pink-200 flex items-center justify-center rounded-full">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-inner">
              <CatPawIcon className="w-6 h-6 text-pink-300" />
            </div>
          </div>
          
          {/* Grooves */}
          <div className="absolute inset-0 border-2 border-white/40 rounded-full scale-90"></div>
          <div className="absolute inset-0 border border-white/20 rounded-full scale-75"></div>
        </motion.div>

        {/* Floating Notes/Hearts */}
        <AnimatePresence>
          {isPlaying && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 0, x: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0], 
                    y: -60 - Math.random() * 40, 
                    x: (Math.random() - 0.5) * 80 
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    delay: i * 0.6,
                    ease: "easeOut"
                  }}
                  className="absolute top-0 left-1/2 text-pink-300 pointer-events-none"
                >
                  {i % 2 === 0 ? <Heart className="w-5 h-5 fill-current" /> : <Star className="w-4 h-4 fill-current" />}
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <div className="absolute top-full right-0 mt-3 bg-white dark:bg-gray-800 text-[10px] font-black text-pink-400 px-3 py-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border-2 border-pink-100 dark:border-pink-900/30 uppercase tracking-tighter">
          Giai điệu của bạn
        </div>
      </button>
    </motion.div>
  );
};
