
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { INITIAL_SLIDES } from './constants';
import { SlideData } from './types';
import Slide from './components/Slide';

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>(INITIAL_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [globalAudioSrc, setGlobalAudioSrc] = useState<string>('./bgm.mp3');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clickTimer = useRef<number | null>(null);

  const totalSlides = slides.length;
  const QUIZ_BOARD_INDEX = 17;
  const QUIZ_START_INDEX = 18;
  const QUIZ_END_INDEX = 42;
  const NEXT_AFTER_QUIZ = 43;
  const CREDITS_INDEX = 44; // 工作人员名单页索引

  const stopMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // 全局播放逻辑
  const playClosingMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const startPlay = () => {
      audio.currentTime = 25; // 从25秒开始
      audio.play().catch(e => {
        console.log("等待用户交互后播放");
        const resume = () => {
          if (audio.paused) {
            audio.currentTime = 25;
            audio.play();
          }
          window.removeEventListener('click', resume);
        };
        window.addEventListener('click', resume);
      });
    };

    if (audio.readyState >= 1) {
      startPlay();
    } else {
      audio.onloadedmetadata = startPlay;
    }
  }, []);

  // 监听索引变化，仅在到达名单页时触发播放
  useEffect(() => {
    if (currentIndex === CREDITS_INDEX) {
      playClosingMusic();
    }
  }, [currentIndex, playClosingMusic, CREDITS_INDEX]);

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
    if (currentIndex === QUIZ_BOARD_INDEX) {
      jumpToSlide(NEXT_AFTER_QUIZ);
    } else if (currentIndex >= QUIZ_START_INDEX && currentIndex <= QUIZ_END_INDEX) {
      jumpToSlide(QUIZ_BOARD_INDEX);
    } else {
      setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
    }
  }, [currentIndex, jumpToSlide, NEXT_AFTER_QUIZ, totalSlides]);

  const prevSlide = useCallback(() => {
    if (currentIndex === NEXT_AFTER_QUIZ) {
      jumpToSlide(QUIZ_BOARD_INDEX);
    } else {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }
  }, [currentIndex, jumpToSlide]);

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // 忽略控制面板、按钮和可编辑文字
    if (target.closest('.controls-panel') || target.closest('button') || target.closest('.music-settings-btn')) return;
    if (document.activeElement?.getAttribute('contenteditable') === 'true') return;

    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
      // 双击：停止播放
      stopMusic();
    } else {
      clickTimer.current = window.setTimeout(() => {
        // 单击：下一页
        nextSlide();
        clickTimer.current = null;
      }, 250);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.getAttribute('contenteditable') === 'true') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          nextSlide();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          prevSlide();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Home':
          setCurrentIndex(0);
          break;
        case 'End':
          setCurrentIndex(totalSlides - 1);
          break;
        case 'b':
        case 'B':
          jumpToSlide(QUIZ_BOARD_INDEX);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, totalSlides, jumpToSlide]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      const baseWidth = 1024;
      const baseHeight = 768;
      const availableWidth = window.innerWidth - 40;
      const availableHeight = window.innerHeight - 40;
      setScale(Math.min(availableWidth / baseWidth, availableHeight / baseHeight));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleUpdateSlide = (updatedSlide: SlideData) => {
    const newSlides = [...slides];
    newSlides[currentIndex] = updatedSlide;
    setSlides(newSlides);
  };

  return (
    <div 
      className={`min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center relative ${isFullscreen ? 'cursor-none' : ''}`}
      onClick={handleContainerClick}
    >
      {/* 全局音频元素 */}
      <audio ref={audioRef} src={globalAudioSrc} loop preload="auto" />

      <div className={`controls-panel fixed top-4 right-4 z-50 flex gap-2 transition-opacity ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg backdrop-blur-md border border-white/20 px-4 transition-all"
        >
          {isFullscreen ? '退出全屏' : '全屏播放'}
        </button>
      </div>

      <div className={`controls-panel fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-2 px-6 rounded-full transition-opacity ${isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button onClick={(e) => { e.stopPropagation(); prevSlide(); }} disabled={currentIndex === 0} className="p-2 text-white hover:bg-white/10 rounded-full disabled:opacity-20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        
        <div className="flex gap-1 overflow-x-auto max-w-md scrollbar-hide px-2">
            {slides.map((slide, idx) => {
                const isQuizQuestion = idx >= QUIZ_START_INDEX && idx <= QUIZ_END_INDEX;
                if (isQuizQuestion) return null;
                return (
                    <div 
                        key={idx}
                        className={`h-1.5 shrink-0 rounded-full transition-all cursor-pointer ${idx === currentIndex ? 'bg-yellow-400 w-8' : (slide.visited ? 'bg-white/10 w-3' : 'bg-white/30 hover:bg-white/50 w-3')}`}
                        onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                    />
                );
            })}
        </div>

        <button onClick={(e) => { e.stopPropagation(); nextSlide(); }} disabled={currentIndex === totalSlides - 1} className="p-2 text-white hover:bg-white/10 rounded-full disabled:opacity-20">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <span className="text-white/60 text-sm font-medium ml-4 border-l border-white/20 pl-4">
            {currentIndex + 1} / {totalSlides}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center w-full h-full p-4 overflow-hidden">
        <Slide 
          key={slides[currentIndex].id} 
          data={slides[currentIndex]} 
          allSlides={slides}
          scale={scale} 
          audioSrc={globalAudioSrc}
          onAudioSrcChange={setGlobalAudioSrc}
          onUpdate={handleUpdateSlide}
          onJump={jumpToSlide}
        />
      </div>

      {!isFullscreen && (
        <div className="fixed bottom-4 left-4 text-white/30 text-xs flex flex-col gap-1">
          <div>提示：单击背景翻页 | 双击背景停止音乐 | 方向键控制 | F 全屏</div>
          <div className="font-bold text-yellow-500/80">双击文字区域进行编辑修改</div>
        </div>
      )}
    </div>
  );
};

export default App;
