import type { Id, Doc } from "../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { component_map } from "../PresentifyComponents/index";
import { useDrag } from "@use-gesture/react";
import type { ReactDOMAttributes } from "@use-gesture/react/dist/declarations/src/types";

// Grid background component
function GridBackground({ size }: { size: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none bg-gray-100"
      style={{
        backgroundImage: `radial-gradient(circle, #d1d5db 1.5px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

export function HyperCanvas({ canvasId }: { canvasId: string }) {
  const convexCanvasId = canvasId as Id<"canvases">;
  const canvas = useQuery(api.canvases.getCanvas, { canvasId: convexCanvasId });
  const gridSize = canvas?.gridSize ?? 20;

  // Selection
  const selectCanvasItem = useMutation(api.canvases.selectCanvasItem);

  const handleMouseDown = (itemId: string) => {
    selectCanvasItem({
      canvasId: convexCanvasId,
      canvasItemId: itemId,
    });
  };

  // We update the item position in the db
  const moveCanvasItem = useMutation(api.canvases.moveCanvasItem)
    // Update the local state through optimistic update, for better responsiveness
    .withOptimisticUpdate((localStore, args) => {
      const { canvasId, canvasItemId, x, y } = args;
      const currentLocalCanvas = localStore.getQuery(api.canvases.getCanvas, {
        canvasId,
      });
      if (currentLocalCanvas !== undefined && currentLocalCanvas !== null) {
        const updatedCanvasItems = currentLocalCanvas.canvasItems.map(
          (item) => {
            if (item.id === canvasItemId) {
              return { ...item, x, y };
            }
            return item;
          },
        );

        const updatedCanvas = {
          ...currentLocalCanvas,
          canvasItems: updatedCanvasItems,
        } as Doc<"canvases">;

        localStore.setQuery(
          api.canvases.getCanvas,
          { canvasId },
          updatedCanvas,
        );
      }
    });

  const dragBindings = useDrag((state) => {
    const { args, down, memo, movement } = state;
    // if (!down) return memo;
    if (!down) return;

    const [id] = args as [string];

    // On the first frame of a drag, capture the starting position
    const item = canvas?.canvasItems.find((i) => i.id === id);
    const startPosition = (memo as [number, number] | undefined) ?? [
      item?.x ?? 0,
      item?.y ?? 0,
    ];

    const [mx, my] = movement;

    // Calculate new position
    let x = startPosition[0] + mx;
    let y = startPosition[1] + my;

    // Apply snap to grid if enabled
    if (canvas?.snapToGridEnabled) {
      const gridSize = canvas.gridSize;
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    moveCanvasItem({
      canvasId: convexCanvasId,
      canvasItemId: id,
      x,
      y,
    });

    return startPosition;
  }) as (itemId: string) => ReactDOMAttributes;

  // console.log("canvas", canvas);

  return (
    <div className="h-full w-full relative bg-white overflow-hidden">
      <GridBackground size={gridSize} />
      <div className="absolute inset-0">
        {canvas?.canvasItems.map((item) => {
          const Component = component_map[item.type].Component;
          return (
            <div
              key={item.id}
              {...dragBindings(item.id)}
              onMouseDown={() => handleMouseDown(item.id)}
              className={`absolute cursor-pointer`}
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
