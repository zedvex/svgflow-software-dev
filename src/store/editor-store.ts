import { create } from 'zustand';

type Settings = {
  // Interface
  theme: 'dark' | 'light' | 'system';
  codeFontSize: number;
  showLineNumbers: boolean;
  
  // Display
  showGrid: boolean;
  gridSize: number;
  gridColor: string;
  gridOpacity: number;
  
  // Canvas
  backgroundColor: string;
  showRulers: boolean;
  showGuidelines: boolean;
  
  // Zoom
  zoomSpeed: number;
  defaultZoom: number;
};

interface EditorState {
  currentSvg: string | null;
  svgCode: string;
  selectedElement: any | null;
  settings: Settings;
  lastModified: Date | null;
  history: string[];
  currentHistoryIndex: number;
  setCurrentSvg: (svg: string | null) => void;
  setSvgCode: (code: string) => void;
  setSelectedElement: (element: any | null) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  setLastModified: (date: Date) => void;
  updateSelectedElement: (attributes: Record<string, string>) => void;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentSvg: null,
  svgCode: '',
  selectedElement: null,
  lastModified: null,
  history: [],
  currentHistoryIndex: -1,
  settings: {
    theme: 'dark',
    codeFontSize: 14,
    showLineNumbers: true,
    showGrid: true,
    gridSize: 30,
    gridColor: '#e5e7eb',
    gridOpacity: 100,
    backgroundColor: '#f7f7f7',
    showRulers: false,
    showGuidelines: false,
    zoomSpeed: 50,
    defaultZoom: 100,
  },
  setCurrentSvg: (svg) => set(state => {
    const newState = { 
      currentSvg: svg,
      lastModified: svg ? new Date() : null 
    };
    
    // Add to history
    const newHistory = [...state.history.slice(0, state.currentHistoryIndex + 1), svg];
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false
    };
  }),
  setSvgCode: (code) => set(state => {
    const newState = { 
      svgCode: code,
      lastModified: new Date()
    };
    
    // Add to history
    const newHistory = [...state.history.slice(0, state.currentHistoryIndex + 1), code];
    return {
      ...newState,
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false
    };
  }),
  setSelectedElement: (element) => set({ selectedElement: element }),
  updateSettings: (settings) => set((state) => ({
    settings: { ...state.settings, ...settings }
  })),
  setLastModified: (date) => set({ lastModified: date }),
  updateSelectedElement: (attributes) => set((state) => {
    if (!state.selectedElement?.element || !state.svgCode) return state;

    // Update the actual element
    Object.entries(attributes).forEach(([key, value]) => {
      state.selectedElement.element.setAttribute(key, value);
    });

    // Get the updated SVG content
    const svgElement = state.selectedElement.element.closest('svg');
    if (!svgElement) return state;

    const newSvgCode = svgElement.outerHTML;

    // Add to history
    const newHistory = [...state.history.slice(0, state.currentHistoryIndex + 1), newSvgCode];
    
    return {
      svgCode: newSvgCode,
      currentSvg: newSvgCode,
      lastModified: new Date(),
      history: newHistory,
      currentHistoryIndex: newHistory.length - 1,
      canUndo: newHistory.length > 1,
      canRedo: false
    };
  }),
  canUndo: false,
  canRedo: false,
  undo: () => set(state => {
    if (state.currentHistoryIndex <= 0) return state;
    
    const newIndex = state.currentHistoryIndex - 1;
    const previousState = state.history[newIndex];
    
    return {
      currentSvg: previousState,
      svgCode: previousState,
      currentHistoryIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      lastModified: new Date()
    };
  }),
  redo: () => set(state => {
    if (state.currentHistoryIndex >= state.history.length - 1) return state;
    
    const newIndex = state.currentHistoryIndex + 1;
    const nextState = state.history[newIndex];
    
    return {
      currentSvg: nextState,
      svgCode: nextState,
      currentHistoryIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < state.history.length - 1,
      lastModified: new Date()
    };
  }),
}));
