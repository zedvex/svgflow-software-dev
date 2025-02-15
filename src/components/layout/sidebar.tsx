import React, { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, Settings, FolderOpen, ZoomIn, ZoomOut, MousePointer, Save, Download, Undo, Redo, HelpCircle, Info, Maximize2, DoorClosed, RefreshCcw, FileImage, Image, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
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

const releases = [
  {
    version: '0.1.5',
    date: '2025-01-17',
    type: 'patch',
    changes: [
      {
        type: 'new',
        description: 'Initial public MVP release',
      },
      {
        type: 'improved',
        description: 'Smooth zoom and pan for better SVG viewing experience',
      },
      {
        type: 'new',
        description: 'Element inspection with color values and dimensions',
      },
      {
        type: 'new',
        description: 'Enhanced export capabilities (SVG, PNG, JPG)',
      },
      {
        type: 'new',
        description: 'Added feedback system for user suggestions',
      },
      {
        type: 'improved',
        description: 'UI/UX improvements and bug fixes',
      },
    ],
  },
  {
    version: '0.1.4',
    date: '2025-12-17',
    type: 'patch',
    changes: [
      {
        type: 'new',
        description: 'Added grid system with customizable settings',
      },
      {
        type: 'new',
        description: 'Implemented rulers and guidelines',
      },
      {
        type: 'improved',
        description: 'Enhanced element property inspection',
      },
      {
        type: 'improved',
        description: 'Improved file handling and error messages',
      },
      {
        type: 'improved',
        description: 'Performance optimizations',
      },
    ],
  },
  {
    version: '0.1.3',
    date: '2025-11-03',
    type: 'patch',
    changes: [
      {
        type: 'new',
        description: 'Initial core functionality implementation',
      },
      {
        type: 'new',
        description: 'Basic SVG file loading and viewing',
      },
      {
        type: 'new',
        description: 'Simple zoom and pan controls',
      },
      {
        type: 'new',
        description: 'Basic element selection',
      },
      {
        type: 'new',
        description: 'Fundamental UI structure',
      },
    ],
  },
] as const;

export function Sidebar({ isCollapsed, onToggle, onOpenSettings, onCloseSettings }: SidebarProps) {
  const { setCurrentSvg, setSvgCode, currentSvg, svgCode } = useEditorStore();
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isQuickExportVisible, setIsQuickExportVisible] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);

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
    window.dispatchEvent(new CustomEvent('zoom', { detail: { type: 'in' }}));
  };

  const handleZoomOut = () => {
    window.dispatchEvent(new CustomEvent('zoom', { detail: { type: 'out' }}));
  };

  const handleResetView = () => {
    window.dispatchEvent(new CustomEvent('zoom', { detail: { type: 'reset' }}));
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

  const handleExport = async (format: 'svg' | 'png' | 'jpg') => {
    if (!currentSvg) {
      await dialog.message('No SVG file is currently open.', { type: 'error' });
      return;
    }

    try {
      const exported = await exportSvgFile(svgCode, format);
      if (exported) {
        await dialog.message(`File exported as ${format.toUpperCase()} successfully!`, { type: 'info' });
      }
    } catch (error) {
      console.error('Error exporting file:', error);
      await dialog.message(`Error exporting file as ${format.toUpperCase()}. Please try again.`, { type: 'error' });
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
              onClick={() => handleExport('svg')}
              className="flex w-full items-center gap-2 rounded p-2 hover:bg-gray-800"
            >
              <Download size={20} />
              {!isCollapsed && <span>Export</span>}
            </button>
          </div>

          {/* Edit Operations */}
          {/* <div className="border-t border-gray-800 pt-2">
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
          </div> */}

          {/* Canvas Controls */}
          <div className="border-t border-gray-800 pt-2">
            {!isCollapsed && <p className="px-2 text-sm text-gray-400 mb-2">View</p>}
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
                onClick={handleResetView}
              >
                <RefreshCcw size={20} />
                {!isCollapsed && <span>Reset View</span>}
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
                  onClick={() => handleExport('svg')}
                  className="p-2 hover:bg-gray-800 rounded flex flex-col items-center"
                  title="Export as SVG"
                >
                  <FileImage size={20} />
                  <span className="text-xs mt-1">SVG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('png')}
                  className="p-2 hover:bg-gray-800 rounded flex flex-col items-center"
                  title="Export as PNG"
                >
                  <Image size={20} />
                  <span className="text-xs mt-1">PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport('jpg')}
                  className="p-2 hover:bg-gray-800 rounded flex flex-col items-center"
                  title="Export as JPG"
                >
                  <Image size={20} />
                  <span className="text-xs mt-1">JPG</span>
                </button>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-xs text-gray-500 z-[5000] bg-[#1e1e1e]">
            FlowStack © {new Date().getFullYear()}
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
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Mouse Controls</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Middle mouse button or Alt + Left click to pan</li>
              <li>Mouse wheel to zoom in/out (speed adjustable in settings)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>SVG viewing and inspection</li>
              <li>Grid and ruler system</li>
              <li>Theme customization</li>
              <li>Export to SVG, PNG and JPG</li>
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
          <p className="text-slate-300 leading-relaxed">
            SVGFlow is a modern SVG viewer built with React and Tauri, designed to provide a seamless experience for working with SVG files.
          </p>

          <p className="text-slate-300 leading-relaxed">
            We're a 2 person designer-dev team who didn't find a decent lightweight local SVG viewer for Windows and Mac.
          </p>

          <p className="text-slate-300 leading-relaxed">
            We're working towards improving this viewer and adding editing capabilities so it's quick to both modify and export SVGs for both devs and designer workflows.
          </p>

          <p className="text-slate-300 leading-relaxed">
            Every month we improve the tool with your feedback.
          </p>

          <button
              onClick={() => {
                setShowAboutModal(false);
                setShowVersionHistoryModal(true);
              }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors"
            >
              Version History
            </button>

          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <a href="mailto:hello@svgflow.app" className="text-blue-500 hover:text-blue-600">hello@svgflow.app</a>
            </div>
            
            
          </div>

          <div>
            <h3 className="text-lg font-semibold text-sky-400 mb-2">Version</h3>
            <p>v0.1.5</p>
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

      {/* Add Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Send Feedback"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            We'd love to hear your thoughts on SVGFlow. Your feedback helps us improve the tool for everyone.
          </p>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 bg-slate-700 rounded-md border border-slate-600 text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-slate-300 mb-1">
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows={4}
                className="w-full px-3 py-2 bg-slate-700 rounded-md border border-slate-600 text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Share your thoughts, suggestions, or report issues..."
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-white transition-colors"
              >
                Send Feedback
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Add Version History Modal */}
      <Modal
        isOpen={showVersionHistoryModal}
        onClose={() => setShowVersionHistoryModal(false)}
        title="Version History"
      >
        <div className="space-y-6">
          {releases.map((release) => (
            <div key={release.version} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-sky-400">Version {release.version}</h3>
                <span className="text-sm text-slate-400">{release.date}</span>
              </div>
              <div className="space-y-2">
                {release.changes.map((change, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      change.type === 'new' ? "bg-green-900 text-green-200" : "bg-blue-900 text-blue-200"
                    )}>
                      {change.type}
                    </span>
                    <p className="text-slate-300">{change.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}