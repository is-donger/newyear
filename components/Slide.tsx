
import React, { useEffect, useRef, memo, useState } from 'react';
import { SlideData } from '../types';
import EditableText from './EditableText';
import { categories } from '../constants';

interface SlideProps {
  data: SlideData;
  allSlides: SlideData[];
  scale: number;
  audioSrc: string;
  onAudioSrcChange: (src: string) => void;
  onUpdate: (updatedData: SlideData) => void;
  onJump?: (index: number) => void;
}

const SlideBackground = memo(({ isFirst }: { isFirst?: boolean }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-700 overflow-hidden pointer-events-none transform-gpu">
    {/* 增大装饰球体以适应 1080p */}
    <div className="absolute -top-60 -left-60 w-[1000px] h-[1000px] bg-yellow-500/10 rounded-full blur-[180px]"></div>
    <div className="absolute -bottom-60 -right-60 w-[1200px] h-[1200px] bg-yellow-400/10 rounded-full blur-[200px]"></div>
    {isFirst && (
      <>
        <div className="bg-particle" style={{ top: '20%', left: '15%', animationDelay: '0s' }}></div>
        <div className="bg-particle" style={{ top: '60%', left: '80%', animationDelay: '1s' }}></div>
        <div className="bg-particle" style={{ top: '30%', left: '70%', animationDelay: '2s' }}></div>
        <div className="bg-particle" style={{ top: '10%', left: '50%', animationDelay: '1.5s' }}></div>
      </>
    )}
    <div className="absolute inset-10 border-[10px] border-yellow-500/15 rounded-sm"></div>
  </div>
));

const Slide: React.FC<SlideProps> = ({ data, allSlides, scale, audioSrc, onAudioSrcChange, onUpdate, onJump }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const finalTitleRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState(0); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMusicSettings, setShowMusicSettings] = useState(false);

  const isQuizSlide = data.id >= 19 && data.id <= 43;

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 字幕滚动高度计算逻辑：适应 1080p 基准
  useEffect(() => {
    if (data.type === 'credits' && scrollContainerRef.current && finalTitleRef.current) {
        const timer = setTimeout(() => {
            const container = scrollContainerRef.current;
            const finalTitle = finalTitleRef.current;
            if (container && finalTitle) {
                // 终点位置：让最终标题停在容器垂直居中的位置 (1080/2 = 540)
                const finalPos = 540 - (finalTitle.offsetTop + (finalTitle.offsetHeight / 2));
                container.style.setProperty('--scroll-final-pos', `${finalPos}px`);
            }
        }, 150);
        return () => clearTimeout(timer);
    }
  }, [data.type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onAudioSrcChange(reader.result as string);
        setShowMusicSettings(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTitle = (newTitle: string) => onUpdate({ ...data, title: newTitle });
  const updateContent = (idx: number, val: string) => {
    if (data.content) {
      const next = [...data.content];
      next[idx] = val;
      onUpdate({ ...data, content: next });
    }
  };

  // 基准分辨率提升为 1080p
  const BASE_WIDTH = 1920, BASE_HEIGHT = 1080;

  const renderContent = () => {
    if (data.type === 'title') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-24 z-10 animate-title-in">
          <div className="max-w-[85%] flex justify-center mb-16">
            {/* 针对 1080p 放大字号 */}
            <EditableText text={data.title} className="text-[180px] font-black text-shine-effect text-center leading-[1.1]" onChange={updateTitle} />
          </div>
          <div className="space-y-10">
            {data.content?.map((line, idx) => (
              <EditableText key={idx} text={line} className="text-6xl text-yellow-100/90 font-bold text-center" onChange={(v) => updateContent(idx, v)} />
            ))}
          </div>
        </div>
      );
    }

    if (data.type === 'credits') {
      const isMusicLoaded = audioSrc.startsWith('data:') || audioSrc.startsWith('blob:');
      return (
        <div className="flex flex-col h-full z-10 relative overflow-hidden" onDoubleClick={(e) => {
          if (!(e.target as HTMLElement).closest('[contenteditable="true"]')) setShowMusicSettings(!showMusicSettings);
        }}>
          {!isFullscreen && (showMusicSettings || !isMusicLoaded) && (
            <div className="absolute top-12 left-12 z-50 scale-125 origin-top-left">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/50 px-6 py-3 rounded-xl text-lg font-bold flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path></svg>
                {isMusicLoaded ? '已锁定音乐 (双击更换)' : '上传背景音乐 (30s)'}
              </button>
            </div>
          )}
          <div ref={scrollContainerRef} className="animate-credits-roll flex flex-col items-center w-full px-32 space-y-16 transform-gpu">
            <div className="mb-32 text-center mt-20 flex flex-col items-center">
              <EditableText text={data.title} className="text-8xl font-black text-yellow-400 mb-10" onChange={updateTitle} />
              <div className="w-48 h-2 bg-yellow-400/30 rounded-full"></div>
            </div>
            {data.content?.map((line, idx) => (
              <EditableText key={idx} text={line} className={`text-center transition-all ${line.includes('致谢') || line.includes('名单') ? 'text-6xl text-yellow-300 mt-24 mb-10 font-extrabold' : 'text-3xl text-white/80 font-medium'}`} onChange={(v) => updateContent(idx, v)} />
            ))}
            <div className="pt-[1100px] pb-[1200px] flex flex-col items-center">
              <div ref={finalTitleRef} className="big-gala-title">
                <EditableText text="高一1班元旦晚会" className="text-[160px] font-black text-shine-effect text-center" onChange={() => {}} />
              </div>
              <div className="mt-20 text-yellow-400/30 text-4xl tracking-[1.5em] font-light uppercase">Happy New Year 2026</div>
            </div>
          </div>
        </div>
      );
    }

    if (data.type === 'board') {
      return (
        <div className="flex flex-col h-full p-20 z-10 justify-center">
          <EditableText text={data.title} className="text-9xl font-black text-yellow-400 text-center mb-20" onChange={updateTitle} />
          <div className="grid grid-cols-5 gap-8">
            {categories.map((cat, catIdx) => (
              <div key={catIdx} className="flex flex-col gap-8">
                <div className="bg-yellow-500 text-red-900 font-bold rounded-2xl h-24 flex items-center justify-center text-3xl font-black shadow-lg">{cat}</div>
                {[100, 200, 300, 400, 500].map(v => {
                  const tidx = 18 + (catIdx * 5) + (v / 100 - 1);
                  return (
                    <button key={v} onClick={(e) => { e.stopPropagation(); onJump?.(tidx); }} className={`h-32 border-[3px] font-black text-6xl rounded-2xl transition-all ${allSlides[tidx]?.visited ? 'bg-neutral-800 border-neutral-700 text-neutral-500 shadow-none' : 'bg-red-900/40 hover:bg-yellow-400 hover:text-red-900 border-yellow-500/30 text-yellow-400 active:scale-95 shadow-xl'}`}>
                      {v}$
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }

    const isShowingAnswer = step >= 1;

    return (
      <div className="flex flex-col h-full p-24 z-10 relative justify-center items-center">
        <div className="mb-20 text-center w-full">
          <EditableText text={data.title} className="text-[100px] font-black text-yellow-400 text-center" onChange={updateTitle} />
          <div className="mt-6 w-64 h-2 bg-yellow-400/60 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-col gap-16 items-center text-center w-full max-w-7xl">
          <EditableText text={data.content?.[0] || ""} className="text-7xl text-white font-bold text-center leading-[1.4]" onChange={(v) => updateContent(0, v)} />
          
          {isShowingAnswer && (
            <div className="pt-24 w-full flex flex-col items-center animate-title-in border-t border-white/10 mt-10">
               <EditableText text={data.content?.[1] || ""} className="text-[120px] text-yellow-100 font-black text-center leading-tight" onChange={(v) => updateContent(1, v)} />
            </div>
          )}
        </div>

        {isQuizSlide && !isShowingAnswer && (
          <button onClick={(e) => { e.stopPropagation(); setStep(1); }} className="absolute bottom-24 right-24 bg-yellow-500 text-red-900 px-16 py-6 rounded-full font-black text-4xl shadow-2xl hover:bg-yellow-400 transition-all animate-pulse">
            显示答案
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative shadow-2xl overflow-hidden select-none rounded-lg bg-red-800 prompter-card transform-gpu" style={{ width: BASE_WIDTH, height: BASE_HEIGHT, transform: `scale(${scale})`, transformOrigin: 'center center' }}>
      <SlideBackground isFirst={data.id === 1} />
      <div className="relative h-full w-full">{renderContent()}</div>
    </div>
  );
};

export default memo(Slide);
