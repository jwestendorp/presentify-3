import { Layout, Model, TabNode, IJsonModel } from "flexlayout-react";
import "flexlayout-react/style/light.css";
import { component_map } from "../PresentifyComponents/index";
import { HyperCanvas } from "./hyper-canvas";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { setSnapToGridEnabled } from "../../convex/canvases";
// import "./App.css";

const workspaceLayoutConfig: IJsonModel = {
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
                component: "layers",
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

const model = Model.fromJson(workspaceLayoutConfig);

function ToolsMenu({ canvasId }: { canvasId: Id<"canvases"> }) {
  const addCanvasItem = useMutation(api.canvases.addCanvasItem);
  const handleAddCanvasItem = (key: string) => {
    addCanvasItem({
      canvasId,
      canvasItem: {
        x: Math.random() * 250,
        y: Math.random() * 250,
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

function LayersMenu({ canvasId }: { canvasId: Id<"canvases"> }) {
  const canvas = useQuery(api.canvases.getCanvas, { canvasId: canvasId });
  const layers = canvas?.canvasItems;
  const selectedItemIds = useQuery(api.canvases.getCurrentUserSelections, {
    canvasId: canvasId,
  });
  const removeCanvasItem = useMutation(api.canvases.removeCanvasItem);

  const handleDeleteLayer = (layerId: string) => {
    removeCanvasItem({
      canvasId: canvasId,
      canvasItemId: layerId,
    });
  };

  return (
    <div className="h-full w-full relative">
      <ul>
        {layers?.map((layer) => {
          const isSelected = selectedItemIds?.includes(layer.id);
          return (
            <li
              key={layer.id}
              className={`flex flex-row justify-between items-center px-2 py-1 ${
                isSelected ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {layer.type}{" "}
              <button onClick={() => handleDeleteLayer(layer.id)}>x</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ConfigMenu({ canvasId }: { canvasId: Id<"canvases"> }) {
  const canvas = useQuery(api.canvases.getCanvas, { canvasId: canvasId });
  const setGridSize = useMutation(api.canvases.setGridSize);
  const setSnapToGridEnabled = useMutation(api.canvases.setSnapToGridEnabled);
  const selectedIds = useQuery(api.canvases.getCurrentUserSelections, {
    canvasId: canvasId,
  });
  const selectedItems = canvas?.canvasItems.filter((item) =>
    selectedIds?.includes(item.id),
  );

  console.log("selections", selectedItems);

  const handleGridSizeChange = (value: string) => {
    setGridSize({
      canvasId: canvasId,
      gridSize: parseInt(value),
    });
  };

  const handleSnapToGridChange = (value: boolean) => {
    setSnapToGridEnabled({
      canvasId: canvasId,
      snapToGridEnabled: value,
    });
  };

  return (
    <div className="h-full w-full bg-white flex flex-col gap-6">
      <ul className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Canvas Config</h3>
        <li className="flex flex-row gap-2">
          <label>Snap to Grid</label>
          <input
            type="checkbox"
            checked={canvas?.snapToGridEnabled}
            onChange={(e) => handleSnapToGridChange(e.target.checked)}
          />
        </li>
        <li className="flex flex-row gap-2">
          <label>Grid Size</label>
          <input
            type="number"
            className="border-2 border-slate-200 rounded-md px-2 box-border max-w-16"
            value={canvas?.gridSize}
            onChange={(e) => handleGridSizeChange(e.target.value)}
            step={5}
          />
        </li>
      </ul>
      {selectedItems?.length && selectedItems.length > 0 && (
        <>
          <hr />

          <ul>
            {selectedItems?.map((selection) => (
              <li
                key={selection.id}
                className="px-2 py-1 border-b border-slate-200"
              >
                <h3 className="text-sm font-semibold">{selection.type}</h3>
                <ul>
                  {Object.entries(selection).map(([key, value]) => (
                    <li
                      key={key}
                      className="grid grid-cols-[minmax(auto,_50px)_minmax(0,_1fr)] gap-2 border-t border-slate-200"
                    >
                      <span className="col-span-1 overflow-hidden text-ellipsis w-full">
                        {key}:
                      </span>
                      <span className="col-span-1 overflow-hidden text-ellipsis w-full">
                        {value}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Workspace({ canvasId }: { canvasId: Id<"canvases"> }) {
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
      case "layers":
        return <LayersMenu canvasId={canvasId} />;
      case "hyper-canvas":
        return <HyperCanvas canvasId={canvasId} />;
      case "config":
        return <ConfigMenu canvasId={canvasId} />;

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
