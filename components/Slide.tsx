
import React, { useEffect, useRef, memo, useState, useLayoutEffect } from 'react';
import { SlideData } from '../types';
import EditableText from './EditableText';
import { categories, quizValues } from '../constants';

interface SlideProps {
  data: SlideData;
  allSlides: SlideData[];
  scale: number;
  onUpdate: (updatedData: SlideData) => void;
  onJump?: (index: number) => void;
}

const FireworkBurst = memo(({ x, y, color }: { x: string; y: string; color: string }) => {
  const particles = Array.from({ length: 30 }).map((_, i) => {
    const angle = (i * (360 / 30)) * (Math.PI / 180);
    const distance = 100 + Math.random() * 150;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;
    return (
      <div 
        key={i} 
        className="firework-particle" 
        style={{ 
          '--tw-x': `${tx}px`, 
          '--tw-y': `${ty}px`, 
          backgroundColor: color,
          color: color,
          animationDelay: `${Math.random() * 0.1}s`
        } as React.CSSProperties} 
      />
    );
  });

  return (
    <div className="firework-container" style={{ left: x, top: y }}>
      {particles}
    </div>
  );
});

const FireworkDisplay = () => {
  const [bursts, setBursts] = useState<{ id: number; x: string; y: string; color: string }[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    const colors = ['#fbbf24', '#ffffff', '#ffd700', '#ffaa00', '#ff4400'];
    const interval = setInterval(() => {
      const newBurst = {
        id: idCounter.current++,
        x: `${10 + Math.random() * 80}%`,
        y: `${15 + Math.random() * 50}%`,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setBursts(prev => [...prev.slice(-12), newBurst]);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {bursts.map(b => <FireworkBurst key={b.id} {...b} />)}
    </div>
  );
};

const SlideBackground = memo(() => (
  <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-700 overflow-hidden pointer-events-none transform-gpu">
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-yellow-500/15 rounded-full blur-[120px]"></div>
    <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-yellow-400/15 rounded-full blur-[140px]"></div>
    
    <div className="bg-particle" style={{ top: '20%', left: '15%', animationDelay: '0s' }}></div>
    <div className="bg-particle" style={{ top: '60%', left: '80%', animationDelay: '1.5s' }}></div>
    <div className="bg-particle" style={{ top: '30%', left: '70%', animationDelay: '3s' }}></div>
    <div className="bg-particle" style={{ top: '80%', left: '20%', animationDelay: '4.5s' }}></div>

    <div className="absolute inset-6 border-[6px] border-yellow-500/20 rounded-sm"></div>
    <div className="absolute inset-10 border-2 border-yellow-500/10 rounded-sm"></div>
  </div>
));

const Slide: React.FC<SlideProps> = ({ data, allSlides, scale, onUpdate, onJump }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const finalTitleRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); 
  const [showFireworks, setShowFireworks] = useState(false);
  const [soupState, setSoupState] = useState<'rules' | 'board'>('rules');
  const [isReady, setIsReady] = useState(false);

  // 使用 useLayoutEffect 在绘制前计算坐标，避免闪烁
  useLayoutEffect(() => {
    if (data.type === 'credits') {
      const calculate = () => {
        if (scrollContainerRef.current && finalTitleRef.current) {
          const container = scrollContainerRef.current;
          const finalTitle = finalTitleRef.current;
          
          // 获取相对容器顶部的偏移量
          const titleOffsetTop = finalTitle.offsetTop;
          const titleHeight = finalTitle.offsetHeight;
          
          // 目标：将 finalTitle 的垂直中心对齐幻灯片高度(768)的中心(384)
          // 最终 Y 偏移 = 384 - (标题在容器中的顶部位置 + 标题高度的一半)
          const targetY = 384 - (titleOffsetTop + titleHeight / 2);
          
          container.style.setProperty('--scroll-final-pos', `${targetY}px`);
          setIsReady(true);
        }
      };
      
      // 稍微给点时间让布局完成渲染计算
      const timer = setTimeout(calculate, 60);
      return () => clearTimeout(timer);
    }
  }, [data.id, data.type]);

  useEffect(() => {
    if (data.type === 'credits') {
      const audio = audioRef.current;
      if (audio) {
        audio.volume = 1.0;
        audio.play().catch(() => {});
      }

      const fwTimer = setTimeout(() => setShowFireworks(true), 4000);

      return () => {
        clearTimeout(fwTimer);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    }
  }, [data.id, data.type]);

  const updateTitle = (newTitle: string) => onUpdate({ ...data, title: newTitle });
  const updateContent = (index: number, newText: string) => {
    if (data.content) {
      const newContent = [...data.content];
      newContent[index] = newText;
      onUpdate({ ...data, content: newContent });
    }
  };

  const nextStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    const maxStep = data.image ? 2 : 1;
    if (step < maxStep) setStep(step + 1);
  };

  const BASE_WIDTH = 1024;
  const BASE_HEIGHT = 768;

  const renderContent = () => {
    if (data.type === 'title') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-20 z-10 animate-title-in">
          <div className="relative group max-w-full overflow-hidden px-4">
            <EditableText text={data.title} className="text-7xl font-black text-shine-effect leading-tight mb-8 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-center whitespace-nowrap" onChange={updateTitle} />
          </div>
          <div className="space-y-4">
            {data.content?.map((line, idx) => (
              <EditableText key={idx} text={line} className="text-4xl text-yellow-100/90 font-bold drop-shadow-md text-center" onChange={(val) => updateContent(idx, val)} />
            ))}
          </div>
          <div className="mt-16 w-64 h-1.5 bg-gradient-to-r from-transparent via-yellow-400/80 to-transparent rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"></div>
          <div className="mt-6 text-yellow-500/60 font-serif tracking-[0.5em] text-xl uppercase text-center">2026 Gala Night</div>
        </div>
      );
    }

    if (data.type === 'credits') {
      return (
        <div className="flex flex-col h-full z-10 relative overflow-hidden">
          <audio ref={audioRef} src="./bgm.mp3" preload="auto" loop />
          {showFireworks && <FireworkDisplay />}

          <div 
            ref={scrollContainerRef} 
            className={`flex flex-col items-center w-full px-16 transform-gpu relative z-30 transition-opacity duration-500 ${isReady ? 'opacity-100 animate-credits-roll' : 'opacity-0'}`}
            style={{ transform: isReady ? undefined : 'translate3d(0, 768px, 0)' }}
          >
            <div className="h-40 shrink-0" /> {/* 顶部缓冲 */}
            
            <div className="text-center flex flex-col items-center mb-16">
              <EditableText text={data.title} className="text-6xl font-black text-yellow-400 drop-shadow-lg mb-4 text-center" onChange={updateTitle} />
              <div className="w-24 h-1 bg-yellow-400/30 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col items-center w-full max-w-4xl space-y-8">
              {data.content?.map((line, idx) => {
                const isHeading = line === '致谢' || line.includes('名单');
                const isEmpty = line.trim() === '';
                if (isEmpty) return <div key={idx} className="h-8" />;

                return (
                  <div key={idx} className="w-full text-center flex flex-col items-center">
                    <EditableText
                      text={line}
                      className={`font-medium transition-all text-center leading-tight tracking-wide ${
                        isHeading 
                        ? 'text-4xl text-yellow-300 mt-16 mb-8 border-t border-yellow-400/20 pt-12 font-extrabold' 
                        : 'text-2xl text-white/95'
                      }`}
                      onChange={(val) => updateContent(idx, val)}
                    />
                  </div>
                );
              })}
            </div>

            {/* 关键：巨大的空白间隔（800px），确保上方的名字能滚出屏幕 */}
            <div className="h-[800px] w-full shrink-0" />

            {/* 结尾展示区：缩小文字字号至 64px 左右，更显精致 */}
            <div className="pb-[900px] w-full flex flex-col items-center">
              <div ref={finalTitleRef} className="big-gala-title text-center inline-block">
                <EditableText 
                  text="高一1班元旦晚会" 
                  className="text-6xl font-black text-shine-effect leading-none tracking-[0.4em] text-center"
                  onChange={() => {}} 
                />
              </div>
              <div className="mt-8 text-yellow-400/40 text-xl font-serif tracking-[1.4em] uppercase text-center ml-[1.4em]">Happy New Year 2026</div>
              <div className="mt-16 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    if (data.type === 'board') {
      return (
        <div className="flex flex-col h-full p-12 z-10 justify-center">
          <div className="text-center mb-12 flex flex-col items-center">
            <EditableText text={data.title} className="text-7xl font-black text-yellow-400 drop-shadow-lg text-center" onChange={updateTitle} />
            <div className="mt-4 w-32 h-1 bg-yellow-400/40 rounded-full"></div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {categories.map((cat, catIdx) => (
              <div key={catIdx} className="flex flex-col gap-4">
                <div className="bg-yellow-500 text-red-900 font-bold rounded-lg text-center shadow-lg h-20 flex items-center justify-center">
                   <div className="text-xl w-full text-center font-black px-2">{cat}</div>
                </div>
                {quizValues.map((val, valIdx) => {
                  const targetIndex = 19 + (catIdx * 5) + valIdx;
                  const isVisited = allSlides[targetIndex]?.visited;
                  return (
                    <button
                      key={val}
                      onClick={(e) => { e.stopPropagation(); onJump?.(targetIndex); }}
                      className={`h-24 border-2 font-black text-4xl rounded-xl transition-all ${
                        isVisited 
                        ? 'bg-neutral-800 border-neutral-700 text-neutral-500 cursor-default shadow-none' 
                        : 'bg-red-900/40 hover:bg-yellow-400 hover:text-red-900 border-yellow-500/30 text-yellow-400 active:scale-95 shadow-xl'
                      }`}
                    >
                      {val}$
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (data.type === 'soup') {
      const isBoard = soupState === 'board';
      return (
        <div className="flex flex-col h-full p-16 z-10 relative items-center justify-center transition-all duration-700">
          <div className={`absolute transition-all duration-1000 ease-in-out flex flex-col ${isBoard ? 'top-16 left-16 items-start scale-125' : 'top-1/2 -translate-y-[300px] items-center'}`}>
            <EditableText text={data.title} className={`font-black text-yellow-400 drop-shadow-lg leading-tight transition-all duration-1000 ${isBoard ? 'text-5xl' : 'text-7xl'}`} onChange={updateTitle} />
            <div className={`h-1.5 bg-yellow-400/60 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)] transition-all duration-1000 ${isBoard ? 'w-24 mt-2' : 'w-48 mt-4'}`}></div>
          </div>
          {!isBoard && (
            <div className="flex flex-col gap-4 w-full max-w-4xl bg-black/30 p-10 rounded-3xl border border-yellow-500/20 shadow-2xl backdrop-blur-md animate-title-in mt-32">
              {data.content?.map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-8 h-8 bg-yellow-500 text-red-900 rounded-full flex items-center justify-center shrink-0 font-black text-lg shadow-lg mt-1">{idx + 1}</div>
                  <EditableText text={item} className="text-xl text-white font-bold leading-relaxed flex-1" onChange={(val) => updateContent(idx, val)} />
                </div>
              ))}
              <button onClick={(e) => { e.stopPropagation(); setSoupState('board'); }} className="mt-6 self-center bg-yellow-500 text-red-900 w-14 h-14 rounded-full flex items-center justify-center font-black text-3xl hover:bg-yellow-400 transition-all shadow-2xl">→</button>
            </div>
          )}
          {isBoard && (
            <div className="w-full h-full pt-32 animate-title-in flex flex-col">
              <div className="flex-1"></div>
              <button onClick={(e) => { e.stopPropagation(); setSoupState('rules'); }} className="absolute bottom-12 right-12 text-yellow-500/30 hover:text-yellow-500 text-xl font-bold transition-all">返回规则</button>
            </div>
          )}
        </div>
      );
    }

    const hasImage = !!data.image;
    const isShowingImage = hasImage && step >= 1;
    const isShowingAnswer = (hasImage && step >= 2) || (!hasImage && step >= 1);
    const answerText = data.content?.[1] || "";
    const isQuizSlide = data.id >= 20 && data.id <= 44;
    const isPerformanceSlide = data.id >= 2 && data.id <= 18;

    return (
      <div className={`flex flex-col h-full z-10 relative px-16 py-12 items-center overflow-hidden ${isPerformanceSlide && !isShowingAnswer ? 'justify-center' : 'justify-start'}`}>
        <div className={`text-center flex flex-col items-center w-full shrink-0 transition-all ${isPerformanceSlide && !isShowingAnswer ? 'mb-10' : 'mb-8'}`}>
          <EditableText text={data.title} className="text-6xl font-black text-yellow-400 drop-shadow-lg leading-tight text-center" onChange={updateTitle} />
          <div className="mt-2 w-48 h-1.5 bg-yellow-400/60 rounded-full"></div>
        </div>
        <div className={`flex flex-col items-center text-center w-full gap-6 ${isPerformanceSlide && !isShowingAnswer ? '' : 'flex-1 justify-center'}`}>
          <div className="animate-title-in w-full flex justify-center shrink-0">
             <EditableText text={data.content?.[0] || ""} className="text-4xl text-white font-bold leading-relaxed text-center max-w-4xl" onChange={(val) => updateContent(0, val)} />
          </div>
          <div className={`w-full flex items-center justify-center gap-8 transition-all ${hasImage && isShowingAnswer ? 'flex-row' : 'flex-col'}`}>
            {hasImage && isShowingImage && (
              <div className={`animate-title-in overflow-hidden rounded-xl border-4 border-yellow-500/30 bg-black/40 shadow-2xl flex items-center justify-center shrink-0 transition-all ${isShowingAnswer ? 'w-1/2 max-h-[350px]' : 'max-w-[700px] aspect-video w-full'}`}>
                <img src={data.image} alt="Hint" className="max-h-full max-w-full object-contain" />
              </div>
            )}
            {isShowingAnswer && (
              <div className={`animate-title-in flex flex-col items-center justify-center transition-all ${hasImage ? 'w-1/2 bg-red-900/80 p-8 rounded-2xl border border-yellow-500/20' : 'w-full pt-10 border-t border-white/10'}`}>
                 <div className="text-yellow-500 font-black text-xl mb-3 uppercase tracking-[0.4em] opacity-80">Answer</div>
                 <div className="w-full">
                    <EditableText text={answerText} className={`${answerText.length > 30 ? 'text-2xl' : (answerText.length > 15 ? 'text-4xl' : 'text-6xl')} text-yellow-100 font-black text-center drop-shadow-lg w-full leading-tight`} onChange={(val) => updateContent(1, val)} />
                 </div>
              </div>
            )}
          </div>
        </div>
        {isQuizSlide && ((hasImage && step < 2) || (!hasImage && step < 1)) && (
          <button onClick={nextStep} className="absolute bottom-12 right-12 bg-yellow-500 text-red-900 px-10 py-4 rounded-full font-black text-2xl shadow-2xl hover:bg-yellow-400 active:scale-95 transition-all animate-pulse z-50">
            {hasImage && step === 0 ? "显示提示图片" : "查看答案"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative shadow-2xl overflow-hidden select-none rounded-lg bg-red-800 prompter-card transform-gpu"
      style={{ width: BASE_WIDTH, height: BASE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'center center' }}
    >
      <SlideBackground />
      <div className="relative h-full w-full">{renderContent()}</div>
    </div>
  );
};

export default memo(Slide);
