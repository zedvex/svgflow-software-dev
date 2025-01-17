import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { ChromePicker } from 'react-color';

export function PropertiesPanel() {
  const { selectedElement, updateSelectedElement } = useEditorStore();
  const [showColorPicker, setShowColorPicker] = React.useState<'fill' | 'stroke' | false>(false);
  const [currentColor, setCurrentColor] = React.useState<string>('#000000');
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 0, y: 0 });
  const [originalColors, setOriginalColors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedElement) {
      setOriginalColors({
        fill: getElementAttribute('fill') || 'none',
        stroke: getElementAttribute('stroke') || 'none',
        'stroke-width': getElementAttribute('stroke-width') || '1'
      });
    }
  }, [selectedElement]);

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

  const handleColorPickerOpen = (type: 'fill' | 'stroke', e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.x + rect.width + 10; // 10px offset from the color preview
    const y = rect.y;
    
    // Adjust if would go off screen
    const pickerWidth = 225; // Chrome picker width
    if (x + pickerWidth > window.innerWidth) {
      setColorPickerPosition({ 
        x: rect.x - pickerWidth - 10,
        y
      });
    } else {
      setColorPickerPosition({ x, y });
    }

    const color = getElementAttribute(type);
    setCurrentColor(color === 'none' ? '#000000' : color || '#000000');
    setShowColorPicker(type);
  };

  const handleColorChange = (color: { hex: string }) => {
    if (!showColorPicker) return;
    
    setCurrentColor(color.hex);
    updateSelectedElement({ [showColorPicker]: color.hex });
  };

  const handleColorPickerClose = () => {
    setShowColorPicker(false);
  };

  const handleResetColor = (type: 'fill' | 'stroke' | 'stroke-width') => {
    updateSelectedElement({ [type]: originalColors[type] });
  };

  return (
    <div className="h-full w-full text-slate-300 p-4">
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

          {/* Color Controls */}
          <div className="bg-slate-700 p-4 rounded">
            <h3 className="font-medium mb-2 text-sky-400">Colors</h3>
            <div className="space-y-4">
              {/* Fill Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300">Fill Color</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-slate-600 cursor-pointer"
                      style={{ 
                        backgroundColor: getElementAttribute('fill') || 'transparent',
                        backgroundImage: getElementAttribute('fill') === 'none' ? 
                          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                          'none',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                      }}
                      onClick={(e) => handleColorPickerOpen('fill', e)}
                    />
                    <button
                      onClick={() => updateSelectedElement({ fill: 'none' })}
                      className="px-2 py-1 text-xs bg-slate-600 rounded hover:bg-slate-500"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleResetColor('fill')}
                      className="px-2 py-1 text-xs bg-slate-600 rounded hover:bg-slate-500"
                      title="Reset to original color"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {showColorPicker === 'fill' && (
                  <div 
                    className="fixed z-50"
                    style={{ 
                      left: `${colorPickerPosition.x}px`, 
                      top: `${colorPickerPosition.y}px` 
                    }}
                  >
                    <div
                      className="fixed inset-0 z-40"
                      onClick={handleColorPickerClose}
                    />
                    <div className="relative z-50">
                      <ChromePicker
                        color={currentColor}
                        onChange={handleColorChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stroke Color */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300">Stroke Color</label>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-slate-600 cursor-pointer"
                      style={{ 
                        backgroundColor: getElementAttribute('stroke') || 'transparent',
                        backgroundImage: getElementAttribute('stroke') === 'none' ? 
                          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                          'none',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                      }}
                      onClick={(e) => handleColorPickerOpen('stroke', e)}
                    />
                    <button
                      onClick={() => updateSelectedElement({ stroke: 'none' })}
                      className="px-2 py-1 text-xs bg-slate-600 rounded hover:bg-slate-500"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleResetColor('stroke')}
                      className="px-2 py-1 text-xs bg-slate-600 rounded hover:bg-slate-500"
                      title="Reset to original color"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                {showColorPicker === 'stroke' && (
                  <div 
                    className="fixed z-50"
                    style={{ 
                      left: `${colorPickerPosition.x}px`, 
                      top: `${colorPickerPosition.y}px` 
                    }}
                  >
                    <div
                      className="fixed inset-0 z-40"
                      onClick={handleColorPickerClose}
                    />
                    <div className="relative z-50">
                      <ChromePicker
                        color={currentColor}
                        onChange={handleColorChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stroke Width */}
              <div className="flex items-center justify-between">
                <label className="text-slate-300">Stroke Width</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={getElementAttribute('stroke-width') || '1'}
                    onChange={(e) => updateSelectedElement({ 'stroke-width': e.target.value })}
                    className="w-20 rounded bg-slate-600 px-2 py-1 text-slate-300"
                  />
                  <button
                    onClick={() => handleResetColor('stroke-width')}
                    className="px-2 py-1 text-xs bg-slate-600 rounded hover:bg-slate-500"
                    title="Reset to original width"
                  >
                    Reset
                  </button>
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
