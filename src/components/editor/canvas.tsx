import React, { useEffect, useState, useRef } from 'react';
import { useEditorStore } from '../../store/editor-store';
import { readTextFile } from '@tauri-apps/api/fs';
import { dialog } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

// ----------------------------------------
// Ruler Constants & Helpers
// ----------------------------------------
const RULER_SIZE = 20;
const RULER_MARK_SIZE = 5;
const RULER_UNIT = 10; // pixels between each mark

const Ruler = ({
  orientation,
  scale,
  position,
  size,
}: {
  orientation: 'horizontal' | 'vertical';
  scale: number;
  position: { x: number; y: number };
  size: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mark style
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';

    const offset = orientation === 'horizontal' ? position.x : position.y;
    const start = Math.floor(-offset / (RULER_UNIT * scale));
    const end = start + Math.ceil(size / (RULER_UNIT * scale));

    for (let i = start; i <= end; i++) {
      const pos = i * RULER_UNIT * scale + offset;
      const value = i * RULER_UNIT;

      if (orientation === 'horizontal') {
        // Horizontal marks
        ctx.beginPath();
        ctx.moveTo(pos, RULER_SIZE);
        ctx.lineTo(pos, RULER_SIZE - RULER_MARK_SIZE);
        ctx.stroke();

        // Draw a numeric label every 100 pixels
        if (value % 100 === 0) {
          ctx.save();
          ctx.translate(pos, RULER_SIZE - 8);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(value.toString(), 0, 0);
          ctx.restore();
        }
      } else {
        // Vertical marks
        ctx.beginPath();
        ctx.moveTo(RULER_SIZE, pos);
        ctx.lineTo(RULER_SIZE - RULER_MARK_SIZE, pos);
        ctx.stroke();

        // Draw a numeric label every 100 pixels
        if (value % 100 === 0) {
          ctx.fillText(value.toString(), 2, pos + 4);
        }
      }
    }
  }, [orientation, scale, position, size]);

  return (
    <canvas
      ref={canvasRef}
      width={orientation === 'horizontal' ? size : RULER_SIZE}
      height={orientation === 'horizontal' ? RULER_SIZE : size}
      className="absolute bg-slate-800 border-slate-600"
      style={{
        top: orientation === 'horizontal' ? 0 : RULER_SIZE,
        left: orientation === 'horizontal' ? RULER_SIZE : 0,
        borderBottom: orientation === 'horizontal' ? '1px solid' : 'none',
        borderRight: orientation === 'vertical' ? '1px solid' : 'none',
      }}
    />
  );
};

// ----------------------------------------
// Guidelines
// ----------------------------------------
const Guidelines = ({
  guidelines,
}: {
  guidelines: Array<{ position: number; orientation: 'horizontal' | 'vertical' }>;
}) => {
  return (
    <>
      {guidelines.map((guide, index) => (
        <div
          key={index}
          className="absolute bg-blue-500/50 pointer-events-none"
          style={{
            left: guide.orientation === 'vertical' ? guide.position : 0,
            top: guide.orientation === 'horizontal' ? guide.position : 0,
            width: guide.orientation === 'vertical' ? '1px' : '100%',
            height: guide.orientation === 'horizontal' ? '1px' : '100%',
          }}
        />
      ))}
    </>
  );
};

// ----------------------------------------
// Main Canvas Component
// ----------------------------------------
export function Canvas() {
  const {
    currentSvg,
    setSelectedElement,
    settings,
    setCurrentSvg,
    setSvgCode,
    canUndo,
    canRedo,
  } = useEditorStore();

  // Zoom & Pan states
  const initialScale = settings?.defaultZoom ? settings.defaultZoom / 100 : 1;
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  // Guidelines & Drag states
  const [guidelines, setGuidelines] = useState<
    Array<{ position: number; orientation: 'horizontal' | 'vertical' }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Path editing: track a single selected path
  const [selectedPath, setSelectedPath] = useState<SVGGraphicsElement | null>(null);

  // Selection overlay ref
  const overlayRef = useRef<HTMLDivElement>(null);

  // ----------------------------------------
  // 1. Fit SVG to Container (Dynamic Zoom)
  // ----------------------------------------
  const calculateDynamicZoom = () => {
    if (!currentSvg || !containerRef.current) return 1;
    const temp = document.createElement('div');
    temp.innerHTML = currentSvg;
    const svgEl = temp.querySelector('svg');
    if (!svgEl) return 1;

    const svgWidth = svgEl.width.baseVal.value;
    const svgHeight = svgEl.height.baseVal.value;

    const containerWidth =
      containerRef.current.clientWidth - (settings.showRulers ? RULER_SIZE : 0);
    const containerHeight =
      containerRef.current.clientHeight - (settings.showRulers ? RULER_SIZE : 0);

    const horizontalZoom = (containerWidth / svgWidth) * 0.9;
    const verticalZoom = (containerHeight / svgHeight) * 0.9;
    return Math.min(horizontalZoom, verticalZoom);
  };

  const centerSvg = () => {
    if (!containerRef.current || !currentSvg) return;

    const containerWidth =
      containerRef.current.clientWidth - (settings.showRulers ? RULER_SIZE : 0);
    const containerHeight =
      containerRef.current.clientHeight - (settings.showRulers ? RULER_SIZE : 0);

    const temp = document.createElement('div');
    temp.innerHTML = currentSvg;
    const svgEl = temp.querySelector('svg');
    if (!svgEl) return;

    const svgWidth = svgEl.width.baseVal.value * scale;
    const svgHeight = svgEl.height.baseVal.value * scale;

    setPosition({
      x: (containerWidth - svgWidth) / 2 + (settings.showRulers ? RULER_SIZE : 0),
      y: (containerHeight - svgHeight) / 2 + (settings.showRulers ? RULER_SIZE : 0),
    });
  };

  useEffect(() => {
    if (currentSvg) {
      const dynamicZoom = calculateDynamicZoom();
      setScale(dynamicZoom);
    }
  }, [currentSvg]);

  useEffect(() => {
    if (currentSvg) {
      centerSvg();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, settings.showRulers]);

  // ----------------------------------------
  // 2. Primary Click / Selection
  // ----------------------------------------
  useEffect(() => {
    if (!currentSvg) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;

      // Clear previous selection
      if (selectedPath) {
        selectedPath.classList.remove('selected-shape');
      }

      // If background or root <svg>
      if (target.tagName === 'svg') {
        setSelectedElement(null);
        setSelectedPath(null);
        return;
      }

      // Otherwise, store essential element info
      const element = {
        tagName: target.tagName,
        id: target.id,
        className:
          target instanceof SVGElement && target.className.baseVal
            ? target.className.baseVal
            : target.className || '',
        getAttribute: (attr: string) => target.getAttribute(attr),
        setAttribute: (attr: string, value: string) => target.setAttribute(attr, value),
        style: window.getComputedStyle(target),
        element: target,
        bbox: target instanceof SVGGraphicsElement ? target.getBBox() : null,
      };

      // If user clicked any SVG shape element, store it for editing and add selection class
      if (target instanceof SVGGraphicsElement) {
        setSelectedPath(target);
        target.classList.add('selected-shape');
      } else {
        setSelectedPath(null);
      }

      setSelectedElement(element);
    };

    // Mouse wheel for zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = settings?.zoomSpeed || 10;
      const speedFactor = zoomSpeed / 10;

      setScale((prevScale) => {
        const delta = e.deltaY > 0 ? 1 - 0.1 * speedFactor : 1 + 0.1 * speedFactor;
        return Math.min(Math.max(0.1, prevScale * delta), 10);
      });
    };

    // Middle or left mouse for panning
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        setIsPanning(true);
        setStartPanPos({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        const newX = e.clientX - startPanPos.x;
        const newY = e.clientY - startPanPos.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsPanning(false);
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('click', handleClick);
      containerEl.addEventListener('wheel', handleWheel, { passive: false });
      containerEl.addEventListener('mousedown', handleMouseDown);
      containerEl.addEventListener('mousemove', handleMouseMove);
      containerEl.addEventListener('mouseup', handleMouseUp);
      containerEl.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      if (containerEl) {
        containerEl.removeEventListener('click', handleClick);
        containerEl.removeEventListener('wheel', handleWheel);
        containerEl.removeEventListener('mousedown', handleMouseDown);
        containerEl.removeEventListener('mousemove', handleMouseMove);
        containerEl.removeEventListener('mouseup', handleMouseUp);
        containerEl.removeEventListener('mouseleave', handleMouseUp);
      }
    };
  }, [
    currentSvg,
    setSelectedElement,
    settings?.zoomSpeed,
    position,
    isPanning,
    startPanPos,
    selectedPath,
  ]);

  // ----------------------------------------
  // 3. File Drop (Tauri or Web)
  // ----------------------------------------
  useEffect(() => {
    const unlistenFileDrop = listen('tauri://file-drop', async (event: any) => {
      const filePaths: string[] = event.payload as string[];
      const svgFile = filePaths.find((path) => path.toLowerCase().endsWith('.svg'));

      if (!svgFile) {
        await dialog.message('Please drop an SVG file.', { type: 'error' });
        return;
      }

      try {
        const content = await readTextFile(svgFile);
        setCurrentSvg(content);
        setSvgCode(content);
      } catch (error) {
        console.error('❌ Error reading file:', error);
        await dialog.message(`Error reading file: ${error}. Please try again.`, {
          type: 'error',
        });
      }
    });

    return () => {
      unlistenFileDrop.then((unlisten) => unlisten());
    };
  }, [setCurrentSvg, setSvgCode]);

  // ----------------------------------------
  // 4. Drag and Drop over the Canvas
  // ----------------------------------------
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    // If the mouse leaves the container entirely
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // ----------------------------------------
  // 5. Guidelines (Double-click near Rulers)
  // ----------------------------------------
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!settings.showGuidelines) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // If near top horizontal ruler
    if (y < RULER_SIZE) {
      setGuidelines((prev) => [...prev, { position: x, orientation: 'vertical' }]);
    }
    // If near left vertical ruler
    else if (x < RULER_SIZE) {
      setGuidelines((prev) => [...prev, { position: y, orientation: 'horizontal' }]);
    }
  };

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${
        isDragging ? 'bg-slate-700/50' : ''
      }`}
      style={{
        backgroundColor: settings?.backgroundColor || '#ffffff',
        cursor: isPanning ? 'grabbing' : 'grab',
        paddingTop: settings.showRulers ? RULER_SIZE : 0,
        paddingLeft: settings.showRulers ? RULER_SIZE : 0,
      }}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDoubleClick={handleDoubleClick}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-xl text-slate-300">
            <p>Drop SVG file here</p>
          </div>
        </div>
      )}

      {/* Rulers */}
      {settings.showRulers && (
        <>
          <Ruler
            orientation="horizontal"
            scale={scale}
            position={position}
            size={containerRef.current?.clientWidth || 0}
          />
          <Ruler
            orientation="vertical"
            scale={scale}
            position={position}
            size={containerRef.current?.clientHeight || 0}
          />
          {/* Ruler corner */}
          <div className="absolute top-0 left-0 w-5 h-5 bg-slate-800 border-r border-b border-slate-600" />
        </>
      )}

      {/* Guidelines */}
      {settings.showGuidelines && <Guidelines guidelines={guidelines} />}

      {/* Grid background (optional) */}
      {settings?.showGrid && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${
              settings.gridColor || '#e5e7eb'
            } 1px, transparent 1px),
                             linear-gradient(to bottom, ${
                               settings.gridColor || '#e5e7eb'
                             } 1px, transparent 1px)`,
            backgroundSize: `${settings.gridSize}px ${settings.gridSize}px`,
            opacity: (settings.gridOpacity || 100) / 100,
            zIndex: 0,
          }}
        />
      )}

      {/* SVG Container */}
      <div
        ref={svgContainerRef}
        className="relative w-full h-full"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <style>
          {`
            .selected-shape {
              outline: 1px solid #3b82f6;
              outline-offset: 1px;
            }
          `}
        </style>
        {currentSvg ? (
          <div
            style={{
              width: 'fit-content',
              height: 'fit-content',
            }}
            dangerouslySetInnerHTML={{ __html: currentSvg }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-gray-500">Drop an SVG file here or open from sidebar</p>
          </div>
        )}
      </div>
    </div>
  );
}
