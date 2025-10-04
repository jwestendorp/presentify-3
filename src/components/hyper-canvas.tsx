import { useEffect, useRef, useState } from "react";
import {
  Layout,
  Model,
  TabNode,
  IJsonModel,
  TabSetNode,
  BorderNode,
  ITabSetRenderValues,
  Actions,
  DockLocation,
  AddIcon,
  ITabRenderValues,
} from "flexlayout-react";
import "flexlayout-react/style/light.css";
// import "./App.css";

const json: IJsonModel = {
  global: {
    // tabEnablePopout: true,
    splitterEnableHandle: true,
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
            component: "placeholder",
          },
        ],
      },
    ],
  },
};

const model = Model.fromJson(json);

function HyperCanvas() {
  const nextAddIndex = useRef<number>(1);

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case "placeholder":
        return (
          <div className="font-sans h-full flex justify-center items-center bg-white box-border">
            {node.getName()}
          </div>
        );
      case "json":
        return <ModelJson model={model} />;
      default:
        return <div>{"unknown component " + component}</div>;
    }
  };

  const onRenderTabSet = (
    node: TabSetNode | BorderNode,
    renderValues: ITabSetRenderValues,
  ) => {
    // if (node instanceof TabSetNode) {
    //   renderValues.stickyButtons.push(
    //     <button
    //       key="Add"
    //       title="Add"
    //       className="flexlayout__tab_toolbar_button"
    //       onClick={() => {
    //         model.doAction(
    //           Actions.addNode(
    //             {
    //               component: "placeholder",
    //               name: "Added " + nextAddIndex.current++,
    //             },
    //             node.getId(),
    //             DockLocation.CENTER,
    //             -1,
    //             true,
    //           ),
    //         );
    //       }}
    //     >
    //       <AddIcon />
    //     </button>,
    //   );
    // }
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

// component to show the current model json
function ModelJson({ model }: { model: Model }) {
  const [json, setJson] = useState<string>(
    JSON.stringify(model.toJson(), null, "\t"),
  );
  const timerRef = useRef<number>(0);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setJson(JSON.stringify(model.toJson(), null, "\t"));
    }, 500);
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  return <pre>{json}</pre>;
}

export default HyperCanvas;
