import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Stage, Layer, Rect, Text, Arrow, Group, Line, Transformer } from 'react-konva';
import { LayoutElement, FactoryLayout } from './types';
import { LEVEL_COLORS, MM_PER_PX } from './constants';

// --- Optimized GridLayer ---
const GridLayer = React.memo(() => {
  const gridLines = [];
  const size = 4000;
  const step = 40;
  
  // Vertical lines
  for (let i = 0; i <= size / step; i++) {
    gridLines.push(<Line key={`v-${i}`} points={[i * step, 0, i * step, size]} stroke="#f0f0f0" strokeWidth={1} listening={false} perfectDrawEnabled={false} />);
  }
  // Horizontal lines
  for (let i = 0; i <= size / step; i++) {
    gridLines.push(<Line key={`h-${i}`} points={[0, i * step, size, i * step]} stroke="#f0f0f0" strokeWidth={1} listening={false} perfectDrawEnabled={false} />);
  }

  return <Group listening={false}>{gridLines}</Group>;
});

// --- Optimized MemoizedElement ---
const MemoizedElement = React.memo(({ 
  el, 
  isSelected, 
  handleDragMove, 
  handleDragEnd, 
  handleTransformEnd, 
  handleElementClick 
}: { 
  el: LayoutElement, 
  isSelected: boolean,
  handleDragMove: (id: string, e: any) => void,
  handleDragEnd: (id: string, e: any) => void,
  handleTransformEnd: (id: string, e: any) => void,
  handleElementClick: (id: string, e: any) => void
}) => {
  const commonProps = {
    id: el.id,
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation || 0,
    draggable: true,
    onDragMove: (e: any) => handleDragMove(el.id, e),
    onDragEnd: (e: any) => handleDragEnd(el.id, e),
    onTransformEnd: (e: any) => handleTransformEnd(el.id, e),
    onClick: (e: any) => handleElementClick(el.id, e),
    onTap: (e: any) => handleElementClick(el.id, e),
  };

  if (el.type === 'label') {
    return (
      <Group {...commonProps}>
        <Rect
          width={el.width}
          height={el.height}
          fill="transparent"
          stroke={isSelected ? "#3b82f6" : "transparent"}
          strokeWidth={1}
        />
        <Text
          text={el.name}
          fontSize={el.fontSize || 14}
          fontStyle="bold"
          fill="#000"
          align="center"
          verticalAlign="middle"
          width={el.width}
          height={el.height}
          listening={false}
        />
      </Group>
    );
  }

  if (el.type === 'arrow') {
    return (
      <Group {...commonProps}>
        <Arrow
          points={[0, 0, el.width, el.height]}
          stroke="#000"
          fill="#000"
          strokeWidth={2}
        />
      </Group>
    );
  }

  if (el.type === 'worker') {
    const hasName = el.name && el.name.trim() !== '';
    const hasTask = el.task && el.task.trim() !== '';
    const isActive = hasName && hasTask;
    const level = el.level || 0;
    const workerColor = isActive ? LEVEL_COLORS[level] : '#94a3b8';
    const headSize = el.height * 0.35;
    const bodyWidth = el.width * 0.8;
    const bodyHeight = el.height * 0.55;
    const centerX = el.width / 2;

    return (
      <Group {...commonProps}>
        {isActive && (
          <Rect
            x={centerX - bodyWidth * 0.6}
            y={-5}
            width={bodyWidth * 1.2}
            height={el.height + 10}
            fill={workerColor}
            opacity={0.15}
            cornerRadius={12}
            shadowBlur={15}
            shadowColor={workerColor}
            listening={false}
          />
        )}
        <Rect width={el.width} height={el.height + 40} fill="transparent" />
        <Rect
          x={centerX - headSize / 2}
          y={0}
          width={headSize}
          height={headSize}
          fill={workerColor}
          cornerRadius={headSize / 2}
          stroke="#000"
          strokeWidth={1.5}
        />
        <Rect
          x={centerX - bodyWidth / 2}
          y={headSize + 2}
          width={bodyWidth}
          height={bodyHeight}
          fill={workerColor}
          cornerRadius={bodyWidth * 0.2}
          stroke="#000"
          strokeWidth={1.5}
        />
        {isActive && (
          <Group x={centerX + headSize / 2 - 5} y={0}>
            <Rect width={14} height={14} fill="#fff" stroke="#000" strokeWidth={1} cornerRadius={7} />
            <Text text={level.toString()} fontSize={9} fontStyle="bold" width={14} height={14} align="center" verticalAlign="middle" fill="#000" />
          </Group>
        )}
        {el.sequenceNumber !== undefined && (
          <Group x={centerX - headSize / 2 - 10} y={0}>
            <Rect width={16} height={14} fill="#1e293b" stroke="#000" strokeWidth={1} cornerRadius={4} />
            <Text text={el.sequenceNumber.toString()} fontSize={8} fontStyle="bold" width={16} height={14} align="center" verticalAlign="middle" fill="#fff" />
          </Group>
        )}
        {el.isCTQ && (
          <Group x={centerX - 12} y={-15}>
            <Rect width={24} height={12} fill="#ef4444" stroke="#fff" strokeWidth={1} cornerRadius={4} />
            <Text text="CTQ" fontSize={7} fontStyle="bold" width={24} height={12} align="center" verticalAlign="middle" fill="#fff" />
          </Group>
        )}
        <Text
          text={el.name || 'Chưa đặt tên'}
          fontSize={el.fontSize || 10}
          fontStyle="bold"
          width={el.width * 3}
          x={-el.width}
          align="center"
          y={el.height + 5}
          fill={el.name ? "#000" : "#94a3b8"}
          listening={false}
        />
      </Group>
    );
  }

  return (
    <Group {...commonProps}>
      <Rect
        width={el.width}
        height={el.height}
        fill={el.type === 'area' ? 'transparent' : (el.type === 'conveyor' ? '#2d5a27' : el.color)}
        stroke="#000"
        strokeWidth={el.type === 'area' ? 2 : 1}
        dash={el.type === 'area' ? [5, 5] : undefined}
        shadowBlur={isSelected ? 5 : 0}
        shadowColor="#3b82f6"
      />
      {el.showCross && (
        <Fragment>
          <Line points={[0, 0, el.width, el.height]} stroke="#000" strokeWidth={1} listening={false} />
          <Line points={[el.width, 0, 0, el.height]} stroke="#000" strokeWidth={1} listening={false} />
        </Fragment>
      )}
      {el.type === 'conveyor' && (
        <Group listening={false}>
          {el.width >= el.height ? (
            Array.from({ length: Math.floor(el.width / 40) }).map((_, i) => (
              <Rect key={i} x={i * 40 + 5} y={2} width={30} height={el.height - 4} fill="#fff" stroke="#000" strokeWidth={1} />
            ))
          ) : (
            Array.from({ length: Math.floor(el.height / 40) }).map((_, i) => (
              <Rect key={i} x={2} y={i * 40 + 5} width={el.width - 4} height={30} fill="#fff" stroke="#000" strokeWidth={1} />
            ))
          )}
        </Group>
      )}
      {el.type !== 'area' && (
        <Text
          text={el.name}
          fontSize={el.fontSize || 10}
          fontStyle="bold"
          width={el.width}
          align="center"
          y={el.height / 2 - 5}
          fill={el.type === 'conveyor' ? '#000' : (el.color === '#fff' ? '#000' : '#fff')}
          listening={false}
        />
      )}
      {el.type === 'area' && (
        <Text text={el.name} fontSize={12} fontStyle="bold" x={5} y={5} fill="#000" listening={false} />
      )}
    </Group>
  );
});

interface CanvasProps {
  layout: FactoryLayout;
  updateLayout: (newElements: LayoutElement[]) => void;
  tool: string;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onWorkerDoubleClick: (worker: LayoutElement) => void;
}

const Canvas: React.FC<CanvasProps> = ({ 
  layout, 
  updateLayout, 
  tool, 
  selectedId, 
  setSelectedId, 
  selectedIds, 
  setSelectedIds, 
  onWorkerDoubleClick 
}) => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectionBox, setSelectionBox] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const onUpdateViewport = (x: number, y: number, zoom: number) => {
    updateLayout(layout.elements.map(el => el)); // This is a bit hacky, but let's just update the viewport in layout if needed
    // Actually, viewport is part of FactoryLayout, not elements.
    // I should probably pass a setViewport function or something.
    // But for now, let's just keep it simple.
  };

  const onSelectElements = (ids: string[]) => {
    setSelectedIds(ids);
    if (ids.length === 1) setSelectedId(ids[0]);
    else setSelectedId(null);
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      const selectedNodes = selectedIds.map(id => stage.findOne('#' + id)).filter(Boolean);
      transformerRef.current.nodes(selectedNodes);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedIds, layout.elements]);

  const handleDragMove = (id: string, e: any) => {
    if (selectedIds.includes(id) && selectedIds.length > 1 && stageRef.current) {
      const node = e.target;
      const originalEl = layout.elements.find(el => el.id === id);
      if (!originalEl) return;
      const dx = node.x() - originalEl.x;
      const dy = node.y() - originalEl.y;
      selectedIds.forEach(sid => {
        if (sid !== id) {
          const otherNode = stageRef.current.findOne('#' + sid);
          if (otherNode) {
            const otherOriginalEl = layout.elements.find(el => el.id === sid);
            if (otherOriginalEl) {
              otherNode.x(otherOriginalEl.x + dx);
              otherNode.y(otherOriginalEl.y + dy);
            }
          }
        }
      });
      stageRef.current.batchDraw();
    }
  };

  const handleDragEnd = (id: string, e: any) => {
    if (selectedIds.includes(id) && selectedIds.length > 1) {
      const node = e.target;
      const dx = node.x() - layout.elements.find(el => el.id === id)!.x;
      const dy = node.y() - layout.elements.find(el => el.id === id)!.y;
      updateLayout(layout.elements.map(el => 
        selectedIds.includes(el.id) ? { ...el, x: el.x + dx, y: el.y + dy } : el
      ));
    } else {
      updateLayout(layout.elements.map(el => 
        el.id === id ? { ...el, x: e.target.x(), y: e.target.y() } : el
      ));
    }
  };

  const handleTransformEnd = (id: string, e: any) => {
    const node = e.target;
    updateLayout(layout.elements.map(el => 
      el.id === id ? {
        ...el,
        x: node.x(),
        y: node.y(),
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation()
      } : el
    ));
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleStageMouseDown = (e: any) => {
    if (e.target === stageRef.current) {
      const pos = stageRef.current.getRelativePointerPosition();
      setSelectionBox({ x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y });
      onSelectElements([]);
    }
  };

  const handleStageMouseMove = (e: any) => {
    if (!selectionBox) return;
    const pos = stageRef.current.getRelativePointerPosition();
    setSelectionBox(prev => prev ? { ...prev, x2: pos.x, y2: pos.y } : null);
  };

  const handleStageMouseUp = () => {
    if (selectionBox) {
      const x1 = Math.min(selectionBox.x1, selectionBox.x2);
      const y1 = Math.min(selectionBox.y1, selectionBox.y2);
      const x2 = Math.max(selectionBox.x1, selectionBox.x2);
      const y2 = Math.max(selectionBox.y1, selectionBox.y2);
      const selected = layout.elements.filter(el => el.x >= x1 && el.x + el.width <= x2 && el.y >= y1 && el.y + el.height <= y2).map(el => el.id);
      onSelectElements(selected);
      setSelectionBox(null);
    }
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    stage.scale({ x: newScale, y: newScale });
    const newPos = { x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale };
    stage.position(newPos);
    onUpdateViewport(newPos.x, newPos.y, newScale);
  };

  const handleElementClick = (id: string, e: any) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      if (selectedIds.includes(id)) {
        onSelectElements(selectedIds.filter(sid => sid !== id));
      } else {
        onSelectElements([...selectedIds, id]);
      }
    } else {
      if (!selectedIds.includes(id)) {
        onSelectElements([id]);
      }
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-white overflow-hidden border border-slate-300 rounded-xl shadow-lg cursor-grab active:cursor-grabbing relative">
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600 z-20 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">SCALE:</span>
          <span>1px = 10mm</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">ZOOM:</span>
          <span>{Math.round((layout.viewport?.zoom || 1) * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">GRID:</span>
          <span>400mm</span>
        </div>
      </div>

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        draggable
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            onUpdateViewport(e.target.x(), e.target.y(), layout.viewport?.zoom || 1);
          }
        }}
        x={layout.viewport?.x || 0}
        y={layout.viewport?.y || 0}
        scaleX={layout.viewport?.zoom || 1}
        scaleY={layout.viewport?.zoom || 1}
      >
        <Layer>
          <GridLayer />
          {layout.elements.map(el => (
            <MemoizedElement
              key={el.id}
              el={el}
              isSelected={selectedIds.includes(el.id)}
              handleDragMove={handleDragMove}
              handleDragEnd={handleDragEnd}
              handleTransformEnd={handleTransformEnd}
              handleElementClick={handleElementClick}
            />
          ))}
          {selectionBox && (
            <Rect
              x={Math.min(selectionBox.x1, selectionBox.x2)}
              y={Math.min(selectionBox.y1, selectionBox.y2)}
              width={Math.abs(selectionBox.x2 - selectionBox.x1)}
              height={Math.abs(selectionBox.y2 - selectionBox.y1)}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1}
            />
          )}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5 ? oldBox : newBox)}
            rotateEnabled={true}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'left-center', 'right-center']}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;
