
export interface SlideData {
  id: number;
  title: string;
  subtitle?: string;
  content?: string[];
  type: 'title' | 'content' | 'list' | 'credits' | 'board';
  visited?: boolean;
}

export interface AppState {
  currentSlide: number;
  isFullscreen: boolean;
  slides: SlideData[];
}
