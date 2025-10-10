// src/store.ts
import { proxy } from "valtio";
import { Doc } from "../convex/_generated/dataModel"; // Adjust path if needed

type DbCanvasObject = Doc<"canvases">;

// The client-side type by extending Convex's generated type
export type ClientCanvasObject = DbCanvasObject & {
  isSelected?: boolean;
  isDragging?: boolean;
  // any other state that exists ONLY on the client and is not persisted
};

// Valtio store using the extended client-side type.
export const canvasState = proxy<{
  objects: ClientCanvasObject[];
  isLoading: boolean;
}>({
  objects: [],
  isLoading: true,
});
