import React, { useEffect } from 'react';
import { useEditorStore } from '../../store/editor-store';

interface SettingsPanelProps {
  onClose?: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { updateSettings, settings } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="h-full bg-slate-800 overflow-y-auto">
      {/* Add header with close button */}
      <div className="sticky top-0 z-10 bg-slate-800 border-b border-slate-600 p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-700 text-white font-bold rounded"
        >
          ✕
        </button>
      </div>

      {/* Wrap existing content in a padding container */}
      <div className="p-4">
        {/* Interface Options */}
        <div className="rounded bg-slate-700 p-6 mb-4">
          <h3 className="mb-4 font-semibold text-sky-400">Interface Options</h3>
          <div className="space-y-4">
            {/* Theme Selection */}
            <div className="flex items-center justify-between">
              <label htmlFor="theme" className="text-slate-300">
                Theme
              </label>
              <select
                id="theme"
                value={settings?.theme || 'dark'}
                className="rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' | 'system' })}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            {/* Code Panel Font Size */}
            <div className="flex items-center justify-between">
              <label htmlFor="codeFontSize" className="text-slate-300">
                Code Font Size
              </label>
              <input
                id="codeFontSize"
                type="number"
                value={settings?.codeFontSize || 14}
                min="8"
                max="32"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ codeFontSize: Number(e.target.value) })}
              />
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <label htmlFor="autoSave" className="text-slate-300">
                Auto Save (minutes)
              </label>
              <input
                id="autoSave"
                type="number"
                value={settings?.autoSaveInterval || 5}
                min="1"
                max="60"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ autoSaveInterval: Number(e.target.value) })}
              />
            </div>

            {/* Show Line Numbers */}
            <div className="flex items-center justify-between">
              <label htmlFor="showLineNumbers" className="text-slate-300">
                Show Line Numbers
              </label>
              <input
                id="showLineNumbers"
                type="checkbox"
                checked={settings?.showLineNumbers}
                className="h-4 w-4 accent-sky-500"
                onChange={(e) => updateSettings({ showLineNumbers: e.target.checked })}
              />
            </div>

            {/* Zoom Speed */}
            <div className="flex items-center justify-between">
              <label htmlFor="zoomSpeed" className="text-slate-300">
                Zoom Speed
              </label>
              <input
                id="zoomSpeed"
                type="range"
                min="1"
                max="20"
                value={settings?.zoomSpeed || 1}
                className="w-32 accent-sky-500"
                onChange={(e) => updateSettings({ zoomSpeed: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="rounded bg-slate-700 p-6 mb-4">
          <h3 className="mb-4 font-semibold text-sky-400">Display Options</h3>
          <div className="space-y-4">
            {/* Show Grid */}
            <div className="flex items-center justify-between">
              <label htmlFor="showGrid" className="text-slate-300">
                Show Grid
              </label>
              <input
                id="showGrid"
                type="checkbox"
                checked={settings?.showGrid}
                className="h-4 w-4 accent-sky-500"
                onChange={(e) => updateSettings({ showGrid: e.target.checked })}
              />
            </div>

            {/* Grid Settings */}
            <div className="flex items-center justify-between">
              <label htmlFor="gridSize" className="text-slate-300">
                Grid Size
              </label>
              <input
                id="gridSize"
                type="number"
                value={settings?.gridSize || 20}
                min="1"
                max="100"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ gridSize: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="gridColor" className="text-slate-300">
                Grid Color
              </label>
              <input
                id="gridColor"
                type="color"
                value={settings?.gridColor || '#e5e7eb'}
                className="h-8 w-20 rounded bg-slate-600"
                onChange={(e) => updateSettings({ gridColor: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="gridOpacity" className="text-slate-300">
                Grid Opacity
              </label>
              <input
                id="gridOpacity"
                type="range"
                min="0"
                max="100"
                value={settings?.gridOpacity || 100}
                className="w-20 accent-sky-500"
                onChange={(e) => updateSettings({ gridOpacity: Number(e.target.value) })}
              />
            </div>

            {/* Snap Settings */}
            {/* <div className="flex items-center justify-between">
              <label htmlFor="snapToGrid" className="text-slate-300">
                Snap to Grid
              </label>
              <input
                id="snapToGrid"
                type="checkbox"
                checked={settings?.snapToGrid}
                className="h-4 w-4 accent-sky-500"
                onChange={(e) => updateSettings({ snapToGrid: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="snapTolerance" className="text-slate-300">
                Snap Tolerance
              </label>
              <input
                id="snapTolerance"
                type="number"
                value={settings?.snapTolerance || 5}
                min="1"
                max="20"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ snapTolerance: Number(e.target.value) })}
              />
            </div> */}
          </div>
        </div>

        {/* Canvas Settings */}
        <div className="rounded bg-slate-700 p-6 mb-4">
          <h3 className="mb-4 font-semibold text-sky-400">Canvas Settings</h3>
          <div className="space-y-4">
            {/* Canvas Dimensions */}
            {/* <div className="flex items-center justify-between">
              <label htmlFor="canvasWidth" className="text-slate-300">
                Canvas Width
              </label>
              <input
                id="canvasWidth"
                type="number"
                value={settings?.canvasWidth || 800}
                min="100"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ canvasWidth: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="canvasHeight" className="text-slate-300">
                Canvas Height
              </label>
              <input
                id="canvasHeight"
                type="number"
                value={settings?.canvasHeight || 600}
                min="100"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ canvasHeight: Number(e.target.value) })}
              />
            </div> */}

            {/* Background Settings */}
            <div className="flex items-center justify-between">
              <label htmlFor="backgroundColor" className="text-slate-300">
                Background Color
              </label>
              <input
                id="backgroundColor"
                type="color"
                value={settings?.backgroundColor || '#ffffff'}
                className="h-8 w-20 rounded bg-slate-600"
                onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
              />
              <button
                  onClick={() => updateSettings({ backgroundColor: '#ffffff' })}
                  className="px-2 py-1 text-xs text-white bg-slate-600 rounded hover:bg-slate-500"
                >
                  Reset
                </button>
            </div>

            {/* Show Rulers */}
            <div className="flex items-center justify-between">
              <label htmlFor="showRulers" className="text-slate-300">
                Show Rulers
              </label>
              <input
                id="showRulers"
                type="checkbox"
                checked={settings?.showRulers}
                className="h-4 w-4 accent-sky-500"
                onChange={(e) => updateSettings({ showRulers: e.target.checked })}
              />
            </div>

            {/* Show Guidelines */}
            {/* <div className="flex items-center justify-between">
              <label htmlFor="showGuidelines" className="text-slate-300">
                Show Guidelines
              </label>
              <input
                id="showGuidelines"
                type="checkbox"
                checked={settings?.showGuidelines}
                className="h-4 w-4 accent-sky-500"
                onChange={(e) => updateSettings({ showGuidelines: e.target.checked })}
              />
            </div> */}
          </div>
        </div>

        {/* Export Settings */}
        <div className="rounded bg-slate-700 p-6 mb-4">
          <h3 className="mb-4 font-semibold text-sky-400">Export Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="exportFormat" className="text-slate-300">
                Default Format
              </label>
              <select
                id="exportFormat"
                value={settings?.defaultExportFormat || 'svg'}
                className="rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ defaultExportFormat: e.target.value })}
              >
                <option value="svg">SVG</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="exportQuality" className="text-slate-300">
                Export Quality
              </label>
              <input
                id="exportQuality"
                type="range"
                min="1"
                max="100"
                value={settings?.exportQuality || 90}
                className="w-20 accent-sky-500"
                onChange={(e) => updateSettings({ exportQuality: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <label htmlFor="exportScale" className="text-slate-300">
                Export Scale
              </label>
              <input
                id="exportScale"
                type="number"
                value={settings?.exportScale || 1}
                min="0.1"
                max="10"
                step="0.1"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ exportScale: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="rounded bg-slate-700 p-6">
          <h3 className="mb-4 font-semibold text-sky-400">Performance</h3>
          <div className="space-y-4">
            {/* <div className="flex items-center justify-between">
              <label htmlFor="enableSmoothZoom" className="text-slate-300">
                Smooth Zoom
              </label>
              <input
                id="enableSmoothZoom"
                type="checkbox"
                checked={settings?.enableSmoothZoom}
                className="h-4 w-4 accent-sky-500"
                onChange={(e) => updateSettings({ enableSmoothZoom: e.target.checked })}
              />
            </div> */}

            <div className="flex items-center justify-between">
              <label htmlFor="maxUndoHistory" className="text-slate-300">
                Max Undo History
              </label>
              <input
                id="maxUndoHistory"
                type="number"
                value={settings?.maxUndoHistory || 50}
                min="10"
                max="200"
                className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                onChange={(e) => updateSettings({ maxUndoHistory: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
