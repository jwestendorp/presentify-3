import React, { useMemo, useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { Modifier, DragEndEvent } from "@dnd-kit/core";

// Snap to grid modifier
function createSnapModifier(gridSize: number): Modifier {
  return ({ transform }) => {
    return {
      ...transform,
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  };
}

// Grid background component
function GridBackground({ size }: { size: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none "
      style={{
        backgroundImage: `radial-gradient(circle, #d1d5db 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

// Draggable component
function Draggable({
  children,
  position,
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable",
  });

  const inlineStyles: React.CSSProperties = {
    left: position.x,
    top: position.y,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      className="absolute touch-none cursor-grab"
      style={inlineStyles}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

export function HyperCanvas({ gridSize }: { gridSize: number }) {
  const [position, setPosition] = useState({ x: 30, y: 30 });
  const snapToGrid = useMemo(() => createSnapModifier(gridSize), [gridSize]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { delta } = event;
    setPosition((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  };

  return (
    <div className="h-full w-full relative bg-white overflow-hidden">
      <GridBackground size={gridSize} />

      <DndContext modifiers={[snapToGrid]} onDragEnd={handleDragEnd}>
        <Draggable position={position}>
          <div className="w-60 h-16 border-2 border-blue-500 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-800">
            Drag me (snaps to {gridSize}px grid)
          </div>
        </Draggable>
      </DndContext>
    </div>
  );
}
