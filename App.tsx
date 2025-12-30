
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_SLIDES } from './constants';
import { SlideData } from './types';
import Slide from './components/Slide';

const STORAGE_KEY = 'NYE_GALA_SLIDES_V1';
const AUDIO_STORAGE_KEY = 'NYE_GALA_AUDIO_V1';

const App: React.FC = () => {
  // 安全地初始化状态，捕获 localStorage 异常
  const [slides, setSlides] = useState<SlideData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("无法访问本地存储，使用初始数据:", e);
    }
    return INITIAL_SLIDES;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [globalAudioSrc, setGlobalAudioSrc] = useState<string>(() => {
    try {
      return localStorage.getItem(AUDIO_STORAGE_KEY) || './bgm.mp3';
    } catch (e) {
      return './bgm.mp3';
    }
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickTimer = useRef<number | null>(null);

  const totalSlides = slides.length;
  const QUIZ_BOARD_INDEX = 17;
  const QUIZ_START_INDEX = 18;
  const QUIZ_END_INDEX = 42;
  const NEXT_AFTER_QUIZ = 43;
  const CREDITS_INDEX = 44;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    } catch (e) {
      // 忽略运行时的存储失败
    }
  }, [slides]);

  const handleAudioSrcChange = (src: string) => {
    setGlobalAudioSrc(src);
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, src);
    } catch (e) {}
  };

  const stopMusic = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const playClosingMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const startPlay = () => {
      audio.currentTime = 30;
      audio.play().catch(() => {
        const resume = () => {
          if (audio.paused && currentIndex === CREDITS_INDEX) {
            audio.currentTime = 30;
            audio.play();
          }
          window.removeEventListener('click', resume);
        };
        window.addEventListener('click', resume);
      });
    };
    if (audio.readyState >= 1) startPlay();
    else audio.onloadedmetadata = startPlay;
  }, [currentIndex, CREDITS_INDEX]);

  useEffect(() => {
    if (currentIndex === CREDITS_INDEX) playClosingMusic();
    else stopMusic();
  }, [currentIndex, playClosingMusic, stopMusic, CREDITS_INDEX]);

  const jumpToSlide = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      if (index >= QUIZ_START_INDEX && index <= QUIZ_END_INDEX) {
        setSlides(prev => {
          const next = [...prev];
          next[index] = { ...next[index], visited: true };
          return next;
        });
      }
      setCurrentIndex(index);
    }
  }, [totalSlides]);

  const nextSlide = useCallback(() => {
    if (currentIndex === QUIZ_BOARD_INDEX) jumpToSlide(NEXT_AFTER_QUIZ);
    else if (currentIndex >= QUIZ_START_INDEX && currentIndex <= QUIZ_END_INDEX) jumpToSlide(QUIZ_BOARD_INDEX);
    else setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  }, [currentIndex, jumpToSlide, NEXT_AFTER_QUIZ, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentIndex === NEXT_AFTER_QUIZ) jumpToSlide(QUIZ_BOARD_INDEX);
    else setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, [currentIndex, jumpToSlide]);

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.controls-panel') || target.closest('button') || target.closest('input') || target.closest('.upload-zone')) return;
    if (document.activeElement?.getAttribute('contenteditable') === 'true') return;

    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      stopMusic();
    } else {
      clickTimer.current = window.setTimeout(() => {
        nextSlide();
        clickTimer.current = null;
      }, 250);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        alert("请手动点击全屏播放按钮。");
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.getAttribute('contenteditable') === 'true') return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') nextSlide();
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') prevSlide();
      if (e.key.toLowerCase() === 'f') toggleFullscreen();
      if (e.key.toLowerCase() === 'b') jumpToSlide(QUIZ_BOARD_INDEX);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, jumpToSlide]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    const calculateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w <= 0 || h <= 0) return;
      // 1920 * 1080 基准缩放
      setScale(Math.min((w - 40) / 1920, (h - 40) / 1080));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  const handleUpdateSlide = (updatedSlide: SlideData) => {
    setSlides(prev => {
      const next = [...prev];
      const idx = prev.findIndex(s => s.id === updatedSlide.id);
      if (idx !== -1) next[idx] = updatedSlide;
      return next;
    });
  };

  return (
    <div className={`min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center relative ${isFullscreen ? 'cursor-none' : ''}`} onClick={handleContainerClick}>
      <audio ref={audioRef} src={globalAudioSrc} loop preload="auto" />
      <div className={`controls-panel fixed top-4 right-4 z-50 flex gap-2 transition-opacity ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg border border-white/20 px-4 transition-all shadow-lg backdrop-blur-md">
          {isFullscreen ? '退出全屏' : '全屏播放'}
        </button>
      </div>
      <div className={`controls-panel fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 p-2 px-6 rounded-full transition-opacity ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} disabled={currentIndex === 0} className="p-2 text-white hover:bg-white/10 rounded-full disabled:opacity-20"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <div className="flex gap-1 overflow-x-auto max-w-md px-2 scrollbar-hide">
          {slides.map((slide, idx) => (idx >= QUIZ_START_INDEX && idx <= QUIZ_END_INDEX ? null : (
            <div key={idx} className={`h-1.5 shrink-0 rounded-full cursor-pointer transition-all ${idx === currentIndex ? 'bg-yellow-400 w-8' : (slide.visited ? 'bg-white/20 w-3' : 'bg-white/40 w-3')}`} onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }} />
          )))}
        </div>
        <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} disabled={currentIndex === totalSlides - 1} className="p-2 text-white hover:bg-white/10 rounded-full disabled:opacity-20"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
        <span className="text-white/60 text-sm font-medium ml-4 border-l border-white/20 pl-4">{currentIndex + 1} / {totalSlides}</span>
      </div>
      <div className="flex-1 flex items-center justify-center w-full h-full p-4 overflow-hidden">
        <Slide key={slides[currentIndex].id} data={slides[currentIndex]} allSlides={slides} scale={scale} audioSrc={globalAudioSrc} onAudioSrcChange={handleAudioSrcChange} onUpdate={handleUpdateSlide} onJump={jumpToSlide} />
      </div>
      {!isFullscreen && <div className="fixed bottom-4 left-4 text-white/40 text-xs font-bold tracking-wider pointer-events-none">单击翻页 | 双击停止音乐 | F 全屏 | 双击文字修改</div>}
    </div>
  );
};

export default App;
