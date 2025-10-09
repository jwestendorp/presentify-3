import { useEffect, useRef, useState } from "react";
import { Layout, Model, TabNode, IJsonModel } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import { component_map } from "../PresentifyComponents/index";
import { HyperCanvas } from "./hyper-canvas";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
// import "./App.css";

const json: IJsonModel = {
  global: {
    // tabEnablePopout: true,
    // splitterEnableHandle: true,
    tabSetMinWidth: 130,
    tabSetMinHeight: 100,
    borderMinSize: 100,
    // tabSetEnableTabScrollbar: true,
    // borderEnableTabScrollbar: true,
  },
  //   borders: [
  //     {
  //       type: "border",
  //       location: "bottom",
  //       children: [
  //         {
  //           type: "tab",
  //           name: "JSON",
  //           component: "json",
  //           enableClose: false,
  //         },
  //       ],
  //     },
  //   ],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        type: "row",
        weight: 10,
        children: [
          {
            type: "tabset",
            enableMaximize: false,
            weight: 10,
            children: [
              {
                type: "tab",
                enableClose: false,
                enableMaximize: false,
                name: "components",
                component: "tools",
              },
            ],
          },
          {
            type: "tabset",
            enableMaximize: false,
            weight: 10,
            children: [
              {
                type: "tab",
                enableClose: false,
                enableMaximize: false,
                name: "layers",
                component: "placeholder",
              },
            ],
          },
        ],
      },

      {
        type: "tabset",
        enableMaximize: false,

        weight: 50,
        enableTabStrip: false,
        enableDrop: false,
        enableDrag: false,
        enableClose: false,

        children: [
          {
            type: "tab",
            enableClose: false,
            enableDrag: false,
            enableRename: false,
            name: "canvas",
            component: "hyper-canvas",
          },
        ],
      },
      {
        type: "tabset",
        enableMaximize: false,
        weight: 10,
        children: [
          {
            type: "tab",
            enableClose: false,
            enableMaximize: false,
            name: "config",
            component: "config",
          },
        ],
      },
    ],
  },
};

const model = Model.fromJson(json);

function ToolsMenu({ canvasId }: { canvasId: string }) {
  const addCanvasItem = useMutation(api.canvases.addCanvasItem);
  const handleAddCanvasItem = (key: string) => {
    addCanvasItem({
      canvasId,
      canvasItem: {
        x: Math.random() * 1080,
        y: Math.random() * 1920,
        width: 100,
        height: 100,
        color: "hsl(" + Math.random() * 360 + ", 100%, 50%)",
        type: key,
      },
    });
  };
  return (
    <div className="h-full w-full relative">
      <ul>
        {Object.keys(component_map).map((key) => (
          <li key={key}>
            <button onClick={() => handleAddCanvasItem(key)}>
              {component_map[key].name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Grid controls component
function GridControls({
  size,
  onSizeChange,
}: {
  size: number;
  onSizeChange: (size: number) => void;
}) {
  const gridSizes = [10, 20, 30, 40, 50];

  return (
    <div className="p-4">
      <div className="text-sm font-medium text-gray-700 mb-3">
        Grid Size: {size}px
      </div>
      <div className="flex flex-wrap gap-2">
        {gridSizes.map((gridSize) => (
          <button
            key={gridSize}
            onClick={() => onSizeChange(gridSize)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              size === gridSize
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {gridSize}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigPanel({
  gridSize,
  onGridSizeChange,
}: {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
}) {
  return (
    <div className="h-full w-full bg-white">
      <GridControls size={gridSize} onSizeChange={onGridSizeChange} />
    </div>
  );
}

function Workspace({ canvasId }: { canvasId: string }) {
  const [gridSize, setGridSize] = useState(30);

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "placeholder":
        return (
          <div className="font-sans h-full flex justify-center items-center bg-white box-border">
            {node.getName()}
          </div>
        );
      case "tools":
        return <ToolsMenu canvasId={canvasId} />;
      case "hyper-canvas":
        return <HyperCanvas gridSize={gridSize} canvasId={canvasId} />;
      case "config":
        return (
          <ConfigPanel gridSize={gridSize} onGridSizeChange={setGridSize} />
        );
      case "json":
        return <ModelJson model={model} />;
      default:
        return <div>{"unknown component " + component}</div>;
    }
  };

  const onRenderTabSet = () => {
    // Custom tab set rendering can be added here if needed
  };

  return (
    <div className="h-full w-full relative">
      <Layout
        model={model}
        factory={factory}
        onRenderTabSet={onRenderTabSet}
        realtimeResize={true}
      />
    </div>
  );
}

export default Workspace;
