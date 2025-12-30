
import React, { useEffect, useRef, memo, useState } from 'react';
import { SlideData } from '../types';
import EditableText from './EditableText';
import { categories } from '../constants';

interface SlideProps {
  data: SlideData;
  allSlides: SlideData[];
  scale: number;
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
        <div className="bg-particle" style={{ top: '80%', left: '20%', animationDelay: '3s' }}></div>
      </>
    )}

    <div className="absolute inset-6 border-[6px] border-yellow-500/20 rounded-sm"></div>
    <div className="absolute inset-10 border-2 border-yellow-500/10 rounded-sm"></div>
  </div>
));

const Slide: React.FC<SlideProps> = ({ data, allSlides, scale, onUpdate, onJump }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const finalTitleRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // 0: Question, 1: Image (if exists), 2: Answer

  const isQuizSlide = data.id >= 19 && data.id <= 43;

  useEffect(() => {
    if (data.type === 'credits') {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.volume = 1.0;
        
        const playAudio = async () => {
          try {
            await audio.play();
          } catch (e) {
            const runOnce = () => {
              audio.play().catch(() => {});
              window.removeEventListener('click', runOnce);
              window.removeEventListener('keydown', runOnce);
            };
            window.addEventListener('click', runOnce);
            window.addEventListener('keydown', runOnce);
          }
        };
        playAudio();
      }

      if (scrollContainerRef.current && finalTitleRef.current) {
        const container = scrollContainerRef.current;
        const finalTitle = finalTitleRef.current;
        const titleTop = finalTitle.offsetTop;
        const titleHeight = finalTitle.offsetHeight;
        const titleCenterInContainer = titleTop + (titleHeight / 2);
        const finalPos = 384 - titleCenterInContainer;
        container.style.setProperty('--scroll-final-pos', `${finalPos}px`);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [data.type]);

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
          <div className="relative group">
            <EditableText 
              text={data.title} 
              className="text-9xl font-black text-shine-effect leading-tight mb-8 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)] text-center"
              onChange={updateTitle}
            />
          </div>
          <div className="space-y-4">
            {data.content?.map((line, idx) => (
              <EditableText
                key={idx}
                text={line}
                className="text-4xl text-yellow-100/90 font-bold drop-shadow-md text-center"
                onChange={(val) => updateContent(idx, val)}
              />
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
          
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-red-900 via-red-900/40 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-red-800 via-red-800/60 to-transparent z-20 pointer-events-none"></div>

          <div ref={scrollContainerRef} className="animate-credits-roll flex flex-col items-center w-full px-16 space-y-10 transform-gpu">
            <div className="mb-24 text-center mt-4 flex flex-col items-center">
              <EditableText 
                text={data.title} 
                className="text-6xl font-black text-yellow-400 drop-shadow-lg mb-6 text-center"
                onChange={updateTitle}
              />
              <div className="w-24 h-1 bg-yellow-400/30 mx-auto rounded-full"></div>
            </div>

            <div className="flex flex-col items-center w-full max-w-4xl space-y-8">
              {data.content?.map((line, idx) => {
                const isHeading = line === '致谢' || line.includes('名单');
                const isEmpty = line.trim() === '';
                if (isEmpty) return <div key={idx} className="h-6" />;

                return (
                  <div key={idx} className="w-full text-center flex flex-col items-center">
                    <EditableText
                      text={line}
                      className={`font-medium transition-all text-center ${
                        isHeading 
                        ? 'text-4xl text-yellow-300 mt-16 mb-6 border-t border-yellow-400/20 pt-16 font-extrabold' 
                        : 'text-2xl text-white/80'
                      }`}
                      onChange={(val) => updateContent(idx, val)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-[700px] pb-[1000px] w-full flex flex-col items-center">
              <div ref={finalTitleRef} className="big-gala-title text-center inline-block">
                <EditableText 
                  text="高一1班元旦晚会" 
                  className="text-[84px] font-black text-shine-effect leading-none tracking-[0.25em] text-center"
                  onChange={() => {}} 
                />
              </div>
              <div className="mt-10 text-yellow-400/40 text-2xl font-serif tracking-[1em] uppercase text-center">Happy New Year 2026</div>
              <div className="mt-16 w-20 h-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      );
    }

    if (data.type === 'board') {
      const values = [100, 200, 300, 400, 500];
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
                {values.map((val) => {
                  const targetIndex = 18 + (catIdx * 5) + (val / 100 - 1);
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

    // Default Content Slide (Includes Quiz Reveal Logic)
    const hasImage = !!data.image;
    const isShowingImage = hasImage && step >= 1;
    const isShowingAnswer = (hasImage && step >= 2) || (!hasImage && step >= 1);

    return (
      <div className="flex flex-col h-full p-16 z-10 relative justify-center items-center">
        {/* Centered Title Section */}
        <div className={`mb-12 text-center flex flex-col items-center w-full ${isQuizSlide ? 'mt-4' : ''}`}>
          <EditableText 
            text={data.title} 
            className="text-7xl font-black text-yellow-400 drop-shadow-lg leading-tight text-center" 
            onChange={updateTitle} 
          />
          <div className="mt-4 w-48 h-1.5 bg-yellow-400/60 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]"></div>
        </div>
        
        <div className="flex flex-col gap-10 items-center text-center w-full max-w-5xl">
          {/* Question / Main Content */}
          <div className="animate-title-in w-full flex justify-center">
             <EditableText 
                text={data.content?.[0] || ""} 
                className="text-5xl text-white font-bold leading-relaxed text-center" 
                onChange={(val) => updateContent(0, val)} 
             />
          </div>

          {/* Image Step (Full view for the hint) */}
          {hasImage && isShowingImage && (
            <div className="animate-title-in overflow-hidden rounded-xl border-4 border-yellow-500/30 bg-black/40 shadow-inner w-full max-w-[700px] aspect-video flex items-center justify-center">
              <img 
                src={data.image} 
                alt="Hint" 
                className="max-h-full max-w-full object-contain transform scale-105" 
              />
            </div>
          )}

          {/* Answer Step */}
          {isShowingAnswer && (
            <div className={`pt-8 border-t-2 border-white/10 animate-title-in w-full flex flex-col items-center ${hasImage ? 'bg-red-900/80 p-6 rounded-lg' : ''}`}>
               <div className="text-yellow-500 font-black text-2xl mb-2 uppercase tracking-[0.3em] text-center opacity-80">Answer</div>
               <EditableText 
                  text={data.content?.[1] || ""} 
                  className="text-6xl text-yellow-100 font-black text-center drop-shadow-lg" 
                  onChange={(val) => updateContent(1, val)} 
               />
            </div>
          )}
        </div>

        {/* Next Step Button for Quiz */}
        {isQuizSlide && ((hasImage && step < 2) || (!hasImage && step < 1)) && (
          <button 
            onClick={nextStep}
            className="absolute bottom-16 right-16 bg-yellow-500 text-red-900 px-10 py-4 rounded-full font-black text-2xl shadow-2xl hover:bg-yellow-400 active:scale-95 transition-all animate-pulse z-50"
          >
            {hasImage && step === 0 ? "显示提示图片" : "查看答案"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div 
      className="relative shadow-2xl overflow-hidden select-none rounded-lg bg-red-800 prompter-card transform-gpu"
      style={{
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <SlideBackground isFirst={data.id === 1} />
      <div className="relative h-full w-full">{renderContent()}</div>
    </div>
  );
};

export default memo(Slide);
