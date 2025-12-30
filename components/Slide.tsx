
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
    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px]"></div>
    <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-yellow-400/10 rounded-full blur-[140px]"></div>
    {isFirst && (
      <>
        <div className="bg-particle" style={{ top: '20%', left: '15%', animationDelay: '0s' }}></div>
        <div className="bg-particle" style={{ top: '60%', left: '80%', animationDelay: '1s' }}></div>
        <div className="bg-particle" style={{ top: '30%', left: '70%', animationDelay: '2s' }}></div>
      </>
    )}
    <div className="absolute inset-6 border-[6px] border-yellow-500/20 rounded-sm"></div>
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

  useEffect(() => {
    if (data.type === 'credits' && scrollContainerRef.current && finalTitleRef.current) {
        const container = scrollContainerRef.current;
        const finalTitle = finalTitleRef.current;
        const finalPos = 384 - (finalTitle.offsetTop + (finalTitle.offsetHeight / 2));
        container.style.setProperty('--scroll-final-pos', `${finalPos}px`);
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

  const BASE_WIDTH = 1024, BASE_HEIGHT = 768;

  const renderContent = () => {
    if (data.type === 'title') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-20 z-10 animate-title-in">
          <EditableText text={data.title} className="text-9xl font-black text-shine-effect mb-8 text-center" onChange={updateTitle} />
          <div className="space-y-4">
            {data.content?.map((line, idx) => <EditableText key={idx} text={line} className="text-4xl text-yellow-100/90 font-bold text-center" onChange={(v) => updateContent(idx, v)} />)}
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
            <div className="absolute top-8 left-8 z-50">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
              <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path></svg>
                {isMusicLoaded ? '已锁定音乐' : '上传音乐 (30s)'}
              </button>
            </div>
          )}
          <div ref={scrollContainerRef} className="animate-credits-roll flex flex-col items-center w-full px-16 space-y-10 transform-gpu">
            <div className="mb-24 text-center mt-4 flex flex-col items-center">
              <EditableText text={data.title} className="text-6xl font-black text-yellow-400 mb-6" onChange={updateTitle} />
              <div className="w-24 h-1 bg-yellow-400/30 rounded-full"></div>
            </div>
            {data.content?.map((line, idx) => <EditableText key={idx} text={line} className={`text-center transition-all ${line.includes('致谢') || line.includes('名单') ? 'text-4xl text-yellow-300 mt-16 font-extrabold' : 'text-2xl text-white/80'}`} onChange={(v) => updateContent(idx, v)} />)}
            <div className="pt-[700px] pb-[1000px] flex flex-col items-center">
              <div ref={finalTitleRef} className="big-gala-title"><EditableText text="高一1班元旦晚会" className="text-[84px] font-black text-shine-effect text-center" onChange={() => {}} /></div>
              <div className="mt-10 text-yellow-400/40 text-2xl tracking-[1em] uppercase">Happy New Year 2026</div>
            </div>
          </div>
        </div>
      );
    }

    if (data.type === 'board') {
      return (
        <div className="flex flex-col h-full p-12 z-10 justify-center">
          <EditableText text={data.title} className="text-7xl font-black text-yellow-400 text-center mb-12" onChange={updateTitle} />
          <div className="grid grid-cols-5 gap-4">
            {categories.map((cat, catIdx) => (
              <div key={catIdx} className="flex flex-col gap-4">
                <div className="bg-yellow-500 text-red-900 font-bold rounded-lg h-16 flex items-center justify-center text-xl font-black">{cat}</div>
                {[100, 200, 300, 400, 500].map(v => {
                  const tidx = 18 + (catIdx * 5) + (v / 100 - 1);
                  return (
                    <button key={v} onClick={(e) => { e.stopPropagation(); onJump?.(tidx); }} className={`h-24 border-2 font-black text-4xl rounded-xl transition-all ${allSlides[tidx]?.visited ? 'bg-neutral-800 border-neutral-700 text-neutral-500' : 'bg-red-900/40 hover:bg-yellow-400 hover:text-red-900 border-yellow-500/30 text-yellow-400 active:scale-95'}`}>
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
      <div className="flex flex-col h-full p-16 z-10 relative justify-center items-center">
        <div className="mb-12 text-center w-full">
          <EditableText text={data.title} className="text-7xl font-black text-yellow-400 text-center" onChange={updateTitle} />
          <div className="mt-4 w-48 h-1.5 bg-yellow-400/60 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-col gap-10 items-center text-center w-full max-w-5xl">
          <EditableText text={data.content?.[0] || ""} className="text-5xl text-white font-bold text-center" onChange={(v) => updateContent(0, v)} />
          
          {isShowingAnswer && (
            <div className="pt-16 w-full flex flex-col items-center animate-title-in">
               <EditableText text={data.content?.[1] || ""} className="text-7xl text-yellow-100 font-black text-center" onChange={(v) => updateContent(1, v)} />
            </div>
          )}
        </div>

        {isQuizSlide && !isShowingAnswer && (
          <button onClick={(e) => { e.stopPropagation(); setStep(1); }} className="absolute bottom-16 right-16 bg-yellow-500 text-red-900 px-10 py-4 rounded-full font-black text-2xl shadow-2xl hover:bg-yellow-400 transition-all animate-pulse">
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
