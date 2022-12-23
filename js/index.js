import React, { useState } from "react";
import { render } from "../pkg/index.js";
import ReactDOM from "react-dom";

function App() {
  const width = 500;
  const height = 300;

  const [lines, setLines] = useState(render(width, height));

  return (
    <svg width={width} height={height}>
      {lines.map((line) => (
        <line
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          strokeWidth={line.stroke_width}
          stroke={"#000"}
        />
      ))}
    </svg>
  );
}

const domContainer = document.querySelector("#app");
const root = ReactDOM.createRoot(domContainer);

const e = React.createElement;
root.render(e(App));
