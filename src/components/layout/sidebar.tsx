import React, { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, Settings, FolderOpen, ZoomIn, ZoomOut, MousePointer, Save, Download, Undo, Redo, HelpCircle, Info, Maximize2, DoorClosed, RefreshCcw, FileImage, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { openSvgFile, saveSvgFile, exportSvgFile } from '../../lib/file-system';
import { useEditorStore } from '../../store/editor-store';
import { Modal } from '../ui/modal';
import { dialog } from '@tauri-apps/api';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
}

export function Sidebar({ isCollapsed, onToggle, onOpenSettings, onCloseSettings }: SidebarProps) {
  const { setCurrentSvg, setSvgCode, currentSvg, svgCode } = useEditorStore();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isQuickExportVisible, setIsQuickExportVisible] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close modals on Escape
      if (event.key === 'Escape') {
        setShowHelpModal(false);
        setShowAboutModal(false);
        onCloseSettings();
      }

      // Handle keyboard shortcuts
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'o':
            event.preventDefault();
            handleOpenFile();
            break;
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'z':
            event.preventDefault();
            // TODO: Implement undo functionality
            break;
          case 'y':
            event.preventDefault();
            // TODO: Implement redo functionality
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCloseSettings]);

  const handleOpenFile = async () => {
    const result = await openSvgFile();
    if (result) {
      setCurrentSvg(result.content);
      setSvgCode(result.content);
    }
  };

  // Get zoom functions from canvas
  const handleZoomIn = () => {
    // Dispatch a custom event that Canvas will listen for
    window.dispatchEvent(new CustomEvent('canvas-zoom', { detail: 'in' }));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent('canvas-zoom', { detail: 'out' }));
  };

  const handleResetCanvas = () => {
    window.dispatchEvent(new CustomEvent('canvas-zoom', { detail: 'reset-all' }));
  };

  const handleResetZoom = () => {
    window.dispatchEvent(new CustomEvent('canvas-zoom', { detail: 'reset-zoom' }));
  };

  const handleSave = async () => {
    if (!currentSvg) {
      await dialog.message('No SVG file is currently open.', { type: 'error' });
      return;
    }

    try {
      const saved = await saveSvgFile(svgCode);
      if (saved) {
        await dialog.message('File saved successfully!', { type: 'info' });
      }
    } catch (error) {
      console.error('Error saving file:', error);
      await dialog.message('Error saving file. Please try again.', { type: 'error' });
    }
  };

  const handleExport = async () => {
    if (!currentSvg) {
      await dialog.message('No SVG file is currently open.', { type: 'error' });
      return;
    }

    try {
      const exported = await exportSvgFile(svgCode);
      if (exported) {
        await dialog.message('File exported successfully!', { type: 'info' });
      }
    } catch (error) {
      console.error('Error exporting file:', error);
      await dialog.message('Error exporting file. Please try again.', { type: 'error' });
    }
  };

  return (
    <>
      <div
        className={cn(
          'h-screen bg-[#1e1e1e] text-white transition-all duration-300 relative',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="bg-sky-900 flex h-16 items-center justify-between px-4">
          {!isCollapsed && <span className="text-xl font-bold">SVGFlow</span>}
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-2 hover:bg-gray-800"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        
        <nav className="bg-[#1e1e1e] space-y-2 p-2">
          {/* File Operations */}
          <div className="space-y-1">
            <button 
              type="button"
              onClick={handleOpenFile}
              className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
            >
              <FolderOpen size={20} />
              {!isCollapsed && <span>Open File</span>}
            </button>
            
            <button 
              type="button"
              onClick={handleSave}
              className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
            >
              <Save size={20} />
              {!isCollapsed && <span>Save</span>}
            </button>

            <button 
              type="button"
              onClick={handleExport}
              className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
            >
              <Download size={20} />
              {!isCollapsed && <span>Export</span>}
            </button>
          </div>

          {/* Edit Operations */}
          <div className="border-t border-gray-800 pt-2">
            {!isCollapsed && <p className="px-2 text-sm text-gray-400 mb-2">Edit</p>}
            <div className="space-y-1">
              <button 
                type="button"
                onClick={() => {
                  const editorStore = useEditorStore.getState();
                  if (editorStore.canUndo) {
                    editorStore.undo();
                  }
                }}
                disabled={!useEditorStore((state) => state.canUndo)}
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Undo size={20} />
                {!isCollapsed && <span>Undo</span>}
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  const editorStore = useEditorStore.getState();
                  if (editorStore.canRedo) {
                    editorStore.redo();
                  }
                }}
                disabled={!useEditorStore((state) => state.canRedo)}
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Redo size={20} />
                {!isCollapsed && <span>Redo</span>}
              </button>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="border-t border-gray-800 pt-2">
            {!isCollapsed && <p className="px-2 text-sm text-gray-400 mb-2">Canvas</p>}
            <div className="space-y-1">
              <button
                type="button" 
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
                onClick={handleZoomIn}
              >
                <ZoomIn size={20} />
                {!isCollapsed && <span>Zoom In</span>}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
                onClick={handleZoomOut}
              >
                <ZoomOut size={20} />
                {!isCollapsed && <span>Zoom Out</span>}
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
                onClick={handleResetCanvas}
              >
                <RefreshCcw size={20} />
                {!isCollapsed && <span>Clear Canvas</span>}
              </button>
            </div>
          </div>

          {/* Help & Settings */}
          <div className="border-t border-gray-800 pt-2">
            {!isCollapsed && <p className="px-2 text-sm text-gray-400 mb-2">Help & Settings</p>}
            <div className="space-y-1">
              <button 
                type="button"
                onClick={onOpenSettings}
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
              >
                <Settings size={20} />
                {!isCollapsed && <span>Settings</span>}
              </button>

              <button 
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
              >
                <HelpCircle size={20} />
                {!isCollapsed && <span>Help</span>}
              </button>

              <button 
                type="button"
                onClick={() => setShowAboutModal(true)}
                className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
              >
                <Info size={20} />
                {!isCollapsed && <span>About</span>}
              </button>
            </div>
          </div>

          {/* Quick Export */}
          {!isCollapsed && !isQuickExportVisible && (
            <button
              type="button"
              onClick={() => setIsQuickExportVisible(true)}
              className="absolute bottom-8 left-0 right-0 p-2 hover:bg-gray-800 flex items-center justify-center gap-2 border-t border-gray-800"
            >
              <ChevronUp size={16} />
              <span className="text-sm">Quick Export</span>
            </button>
          )}
          {!isCollapsed && (
            <div className={cn(
              "absolute left-0 right-0 bg-[#1e1e1e] border-t border-gray-800 pt-2",
              "transform transition-transform duration-200",
              isQuickExportVisible ? "translate-y-0" : "translate-y-full",
              isQuickExportVisible ? "bottom-8" : "bottom-0"
            )}>
              <div className="flex items-center justify-between px-2 mb-2">
                <p className="text-sm text-gray-400">Quick Export</p>
                <button
                  type="button"
                  onClick={() => setIsQuickExportVisible(false)}
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
              <div className="flex justify-around px-2">
                <button
                  type="button"
                  onClick={() => handleExport()}
                  className="p-2 hover:bg-gray-800 rounded flex flex-col items-center"
                  title="Export as SVG"
                >
                  <FileImage size={20} />
                  <span className="text-xs mt-1">SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport()}
                  className="p-2 hover:bg-gray-800 rounded flex flex-col items-center"
                  title="Export as PNG"
                >
                  <Image size={20} />
                  <span className="text-xs mt-1">PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport()}
                  className="p-2 hover:bg-gray-800 rounded flex flex-col items-center"
                  title="Export as JPG"
                >
                  <Image size={20} />
                  <span className="text-xs mt-1">JPG</span>
                </button>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-xs text-gray-500 z-[9999] bg-[#1e1e1e]">
            Created by FlowStack © {new Date().getFullYear()}
          </div>
        </nav>
      </div>

      {/* Help Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Help"
      >
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + O</span>
                <span className="ml-2">Open File</span>
              </div>
              <div>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + S</span>
                <span className="ml-2">Save File</span>
              </div>
              <div>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + Z</span>
                <span className="ml-2">Undo</span>
              </div>
              <div>
                <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm">Ctrl + Y</span>
                <span className="ml-2">Redo</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Mouse Controls</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Middle mouse button or Space + Left click to pan</li>
              <li>Mouse wheel to zoom in/out</li>
              <li>Double click on rulers to add guidelines</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Real-time SVG code editing</li>
              <li>Grid and ruler system</li>
              <li>Theme customization</li>
              <li>Element properties inspection</li>
            </ul>
          </section>
        </div>
      </Modal>

      {/* About Modal */}
      <Modal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        title="About SVGFlow"
      >
        <div className="space-y-4">
          <p>
            SVGFlow is a modern SVG editor built with React and Tauri, designed to provide a seamless experience for working with SVG files.
          </p>
          
          <div>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Version</h3>
            <p>v0.1.3</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Created By</h3>
            <p>FlowStack</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Technologies</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>React</li>
              <li>Tauri</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
            </ul>
          </div>

          <div className="mt-6 text-sm text-slate-400">
            <p>© {new Date().getFullYear()} FlowStack. All rights reserved.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}