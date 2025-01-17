import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './components/layout/sidebar';
import { Canvas } from './components/editor/canvas';
import { CodePanel } from './components/editor/code-panel';
import { PropertiesPanel } from './components/editor/properties-panel';
import { SettingsPanel } from './components/editor/settings-panel';
import { formatDistanceToNow } from 'date-fns';
import { useEditorStore } from './store/editor-store';
import { Modal } from './components/ui/modal';

const APP_VERSION = "v0.1.3";

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { lastModified, selectedElement, settings } = useEditorStore();

  // Get system theme
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  // Calculate current theme
  const currentTheme = settings.theme === 'system' ? systemTheme : settings.theme;

  const getStatusMessage = () => {
    if (selectedElement) {
      return `Selected: ${selectedElement.tagName.toLowerCase()}${selectedElement.id ? ` #${selectedElement.id}` : ''}`;
    }
    return 'Ready';
  };

  const getModifiedTime = () => {
    if (!lastModified) return '';
    return `Modified: ${formatDistanceToNow(lastModified, { addSuffix: true })}`;
  };

  return (
    <div className={`relative flex h-screen overflow-hidden ${
      currentTheme === 'light' ? 'bg-white' : 'bg-slate-900'
    }`}>
      {/* Settings Panel */}
      <div className={`absolute inset-y-0 left-0 w-96 transform transition-transform duration-300 ease-in-out z-50 ${
        showSettings ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </div>

      {/* 1) SIDEBAR */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main content wrapper with border */}
      <div className="flex-1 flex flex-col">
        {/* Version info bar */}
        <div className="bg-slate-800 text-slate-300 px-4 py-1 text-sm flex justify-between items-center border-b border-slate-600">
          <span>SVGFlow Editor {APP_VERSION}</span>
          <span className="text-slate-400">Made with ❤️ by FlowStack</span>
        </div>

        {/* 2) MAIN PANELS */}
        <PanelGroup direction="horizontal" className="flex-1 border-b border-slate-600">
          <Panel defaultSize={60}>
            <Canvas />
          </Panel>
          <PanelResizeHandle className="w-1 bg-slate-600 hover:bg-blue-500 transition-colors" />
          <Panel>
            <PanelGroup direction="vertical">
              <Panel defaultSize={50} minSize={30}>
                <div className="h-full overflow-y-auto">
                  <CodePanel />
                </div>
              </Panel>
              <PanelResizeHandle className="h-1 bg-slate-600 hover:bg-blue-500 transition-colors" />
              <Panel defaultSize={50} minSize={30}>
                <div className="h-full overflow-y-auto">
                  <PropertiesPanel />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>

        {/* Status Bar */}
        <div className="h-6 bg-slate-800 text-slate-300 px-4 flex items-center justify-between text-sm border-t border-slate-600">
          <div className="flex items-center space-x-4">
            <span>{getStatusMessage()}</span>
            {selectedElement && (
              <>
                <span>•</span>
                <span>Position: {Math.round(selectedElement.bbox?.x || 0)}, {Math.round(selectedElement.bbox?.y || 0)}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">{getModifiedTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
