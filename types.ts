
export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  content?: string[];
  type: 'title' | 'content' | 'list' | 'credits' | 'board' | 'top-left' | 'soup';
  visited?: boolean;
  image?: string;
}

export interface AppState {
  currentSlide: number;
  isFullscreen: boolean;
  slides: SlideData[];
}