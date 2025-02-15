import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { ChromePicker } from 'react-color';
import { Copy } from 'lucide-react';

export function PropertiesPanel() {
  const { selectedElement } = useEditorStore();

  const [showTooltip, setShowTooltip] = useState<{ show: boolean; position: string }>({ 
    show: false, 
    position: '' 
  });

  const getElementAttribute = (attribute: string): string => {
    if (!selectedElement) return '';
    return selectedElement.getAttribute(attribute) || '';
  };

  const getClassName = (): string => {
    if (!selectedElement) return '';
    if (typeof selectedElement.className === 'object') {
      return selectedElement.className.baseVal || '';
    }
    return selectedElement.className || '';
  };

  const copyToClipboard = async (text: string, position: 'fill' | 'stroke') => {
    try {
      await navigator.clipboard.writeText(text);
      setShowTooltip({ show: true, position });
      setTimeout(() => {
        setShowTooltip({ show: false, position: '' });
      }, 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-[#032234] h-full w-full text-slate-300 p-4">
      <h2 className="text-lg font-semibold mb-4 text-white border-b border-slate-600 pb-2">
        Element Properties
      </h2>
      
      {selectedElement ? (
        <div className="space-y-4">
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-medium mb-2 text-sky-400">Basic Info</h3>
            <div className="space-y-2">
              <p><span className="text-slate-300">Tag:</span> <span className="text-sky-300">{selectedElement.tagName.toLowerCase()}</span></p>
              <p><span className="text-slate-300">ID:</span> <span className="text-sky-300">{selectedElement.id || 'none'}</span></p>
              <p><span className="text-slate-300">Class:</span> <span className="text-sky-300">{getClassName() || 'none'}</span></p>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-medium mb-2 text-sky-400">Colors</h3>
            <div className="space-y-4">
              {/* Fill Color */}
              <div className="flex items-center justify-between">
                <label className="text-slate-300">Fill Color</label>
                <div className="flex items-center gap-2 min-w-40">
                  <div
                    className="w-6 h-6 rounded border border-slate-600 flex-shrink-0"
                    style={{ 
                      backgroundColor: selectedElement.properties.fill || 'transparent',
                      backgroundImage: selectedElement.properties.fill === 'none' ? 
                        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                        'none',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                    }}
                  />
                  <div className="flex items-center gap-1 flex-1">
                    <code className="px-2 py-1 bg-slate-800 rounded text-sm font-mono min-w-[120px] text-center">
                      {selectedElement.properties.fill || 'none'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedElement.properties.fill || 'none', 'fill')}
                      className="p-1 hover:bg-slate-600 rounded relative"
                      title="Copy to clipboard"
                    >
                      <Copy size={14} />
                      {showTooltip.show && showTooltip.position === 'fill' && (
                        <div className="absolute -top-10 -right-14 transform -translate-x-1/2 px-2 py-1 bg-slate-900 text-sm rounded shadow-lg whitespace-nowrap">
                          Copied to clipboard!
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stroke Color */}
              <div className="flex items-center justify-between">
                <label className="text-slate-300">Stroke Color</label>
                <div className="flex items-center gap-2 min-w-40">
                  <div
                    className="w-6 h-6 rounded border border-slate-600 flex-shrink-0"
                    style={{ 
                      backgroundColor: selectedElement.properties.stroke || 'transparent',
                      backgroundImage: selectedElement.properties.stroke === 'none' ? 
                        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                        'none',
                      backgroundSize: '8px 8px',
                      backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                    }}
                  />
                  <div className="flex items-center gap-1">
                    <code className="px-2 py-1 bg-slate-800 rounded text-sm font-mono min-w-[120px] text-center">
                      {selectedElement.properties.stroke || 'none'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedElement.properties.stroke || 'none', 'stroke')}
                      className="p-1 hover:bg-slate-600 rounded relative"
                      title="Copy to clipboard"
                    >
                      <Copy size={14} />
                      {showTooltip.show && showTooltip.position === 'stroke' && (
                        <div className="absolute -top-10 -right-14 transform -translate-x-1/2 px-2 py-1 bg-slate-900 text-sm rounded shadow-lg whitespace-nowrap">
                          Copied to clipboard!
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions */}
          {selectedElement.bbox && (
            <div className="bg-slate-700 p-4 rounded">
              <h3 className="font-medium mb-2 text-sky-400">Dimensions</h3>
              <div className="space-y-2">
                <p><span className="text-slate-300">Width:</span> <span className="text-sky-300">{selectedElement.bbox.width.toFixed(2)}px</span></p>
                <p><span className="text-slate-300">Height:</span> <span className="text-sky-300">{selectedElement.bbox.height.toFixed(2)}px</span></p>
                <p><span className="text-slate-300">X:</span> <span className="text-sky-300">{selectedElement.bbox.x.toFixed(2)}</span></p>
                <p><span className="text-slate-300">Y:</span> <span className="text-sky-300">{selectedElement.bbox.y.toFixed(2)}</span></p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400">No element selected</p>
      )}
    </div>
  );
}
