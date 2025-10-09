import React, { useMemo, useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import type { Modifier, DragEndEvent } from "@dnd-kit/core";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { component_map } from "../PresentifyComponents/index";

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

export function HyperCanvas({
  gridSize,
  canvasId,
}: {
  gridSize: number;
  canvasId: string;
}) {
  const canvas = useQuery(api.canvases.getCanvas, { canvasId });

  console.log("canvas", canvas);

  return (
    <div className="h-full w-full relative bg-white overflow-hidden">
      <GridBackground size={gridSize} />
      <div className="absolute inset-0">
        {canvas?.canvasItems.map((item) => {
          const Component = component_map[item.type].Component;
          return (
            <div
              key={item.id}
              className={`absolute `}
              style={{
                top: `${item.y}px`,
                left: `${item.x}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
              }}
            >
              <Component
                key={item.id}
                options={{ backgroundColor: item.color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
