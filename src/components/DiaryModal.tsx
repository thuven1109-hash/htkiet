import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X as CloseIcon, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { DiaryEntry } from "../types";
import { cn } from "../lib/utils";

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: DiaryEntry[];
  charName: string;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  isOpen,
  onClose,
  entries,
  charName,
}) => {
  const [selectedEntry, setSelectedEntry] = React.useState<DiaryEntry | null>(null);
  const [isFlipping, setIsFlipping] = React.useState(false);

  const handleDayClick = (entry: DiaryEntry) => {
    setIsFlipping(true);
    setTimeout(() => {
      setSelectedEntry(entry);
      setIsFlipping(false);
    }, 600);
  };

  const sortedEntries = [...entries].sort((a, b) => a.day - b.day);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedEntry(null);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            className="relative w-full max-w-4xl h-[80vh] flex flex-col md:flex-row bg-[#fdfaf1] rounded-lg shadow-2xl overflow-hidden border-[12px] border-[#4a3b3d]"
            style={{ perspective: "2000px" }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-[#4a3b3d] text-white rounded-full hover:bg-[#5d4a4d] transition-colors"
            >
              <CloseIcon className="w-6 h-6" />
            </button>

            {/* Left Page: Calendar/Index */}
            <div className="w-full md:w-1/3 border-r border-[#e5dcc3] p-8 flex flex-col bg-[#f7f1e3] shadow-inner">
              <div className="mb-8 text-center">
                <h2 className="font-handwriting text-3xl text-[#4a3b3d] mb-2">Nhật ký của {charName}</h2>
                <div className="h-px bg-[#4a3b3d]/20 w-24 mx-auto" />
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: Math.max(30, sortedEntries.length) }).map((_, i) => {
                    const day = i + 1;
                    const entry = sortedEntries.find(e => e.day === day);
                    const isSelected = selectedEntry?.day === day;

                    return (
                      <button
                        key={day}
                        disabled={!entry}
                        onClick={() => entry && handleDayClick(entry)}
                        className={cn(
                          "aspect-square rounded-lg flex flex-col items-center justify-center transition-all border-2",
                          entry 
                            ? isSelected 
                              ? "bg-[#4a3b3d] text-white border-[#4a3b3d] shadow-lg scale-105"
                              : "bg-white text-[#4a3b3d] border-[#e5dcc3] hover:border-[#4a3b3d] hover:shadow-md"
                            : "bg-gray-100/50 text-gray-300 border-dashed border-gray-200 cursor-not-allowed"
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold opacity-60">Ngày</span>
                        <span className="text-xl font-bold">{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Page: Content */}
            <div className="flex-1 relative bg-[#fdfaf1] overflow-hidden">
              {/* Paper Texture Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ 
                  backgroundImage: `url('https://www.transparenttextures.com/patterns/scratched-metal.png')`,
                  backgroundSize: '400px'
                }}
              />
              
              <AnimatePresence mode="wait">
                {selectedEntry ? (
                  <motion.div
                    key={selectedEntry.day}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="h-full p-12 flex flex-col"
                  >
                    <div className="flex justify-between items-center mb-10 border-b border-[#4a3b3d]/10 pb-4">
                      <div className="flex items-center gap-3 text-[#4a3b3d]/60">
                        <Calendar className="w-5 h-5" />
                        <span className="font-mono text-sm">{selectedEntry.date}</span>
                      </div>
                      <span className="font-handwriting text-2xl text-[#4a3b3d]">Ngày thứ {selectedEntry.day}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                      <p className="font-handwriting text-2xl leading-[1.8] text-[#2c2425] whitespace-pre-wrap first-letter:text-5xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-[#4a3b3d]">
                        {selectedEntry.content}
                      </p>
                    </div>

                    <div className="mt-8 text-right italic font-handwriting text-xl text-[#4a3b3d]/70">
                      — {charName}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#4a3b3d]/30 p-12 text-center">
                    <div className="w-32 h-32 mb-6 opacity-20">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,2L14,6.5V17.5L19,13V2M6.5,5C4.85,5 3.5,6.35 3.5,8V20C3.5,20.65 4.05,21.2 4.7,21.2C4.85,21.2 5,21.15 5.15,21.1L6.5,20.5L7.85,21.1C8,21.15 8.15,21.2 8.3,21.2C8.95,21.2 9.5,20.65 9.5,20V8C9.5,6.35 8.15,5 6.5,5M14.5,20V8C14.5,6.35 15.85,5 17.5,5H20V15H17.5C16.75,15 16.05,15.25 15.5,15.65V20C15.5,20.65 14.95,21.2 14.3,21.2C14.15,21.2 14,21.15 13.85,21.1L12.5,20.5L11.15,21.1C11,21.15 10.85,21.2 10.7,21.2C10.05,21.2 9.5,20.65 9.5,20V15.65C8.95,15.25 8.25,15 7.5,15H5V8C5,7.15 5.7,6.5 6.5,6.5C7.3,6.5 8,7.15 8,8V16.5H6.5V18H8V20H9.5V18H11V16.5H9.5V8C9.5,6.35 8.15,5 6.5,5H11V20L12.5,19.3L14,20V2M17.5,6.5C18.3,6.5 19,7.15 19,8V13.5H17.5C16.7,13.5 16,14.15 16,15V16.5H17.5V15H19V16.5H20.5V15C20.5,14.15 19.8,13.5 19,13.5V8C19,7.15 18.3,6.5 17.5,6.5Z" />
                      </svg>
                    </div>
                    <p className="font-handwriting text-2xl">Hãy chọn một ngày để đọc tâm tình của {charName}...</p>
                  </div>
                )}
              </AnimatePresence>

              {/* Page Flip Effect Overlay */}
              <AnimatePresence>
                {isFlipping && (
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -180 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#f7f1e3] origin-left z-40 shadow-2xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-black/20 to-transparent" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
