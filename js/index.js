import React, { useState } from "react";
import {
  fretboard_new,
  fretboard_grid,
  fretboard_fretted,
  fretted_rectangle,
} from "../pkg/index.js";
import ReactDOM from "react-dom";

function App() {
  const width = 500;
  const height = 300;

  const [fretboard, setFretboard] = useState(fretboard_new(width, height));

  const [lines, setLines] = useState(fretboard_grid(fretboard));

  const [fretted, setFretted] = useState(fretboard_fretted(fretboard));

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
      {fretted.map((fretted) => {
        const rectangle = fretted_rectangle(fretted);

        if (rectangle != null) {
          return (
            <rect
              x={rectangle.x}
              y={rectangle.y}
              width={rectangle.width}
              height={rectangle.height}
              rx={rectangle.height / 2}
              fill="#000"
            />
          );
        }
      })}
    </svg>
  );
}

const domContainer = document.querySelector("#app");
const root = ReactDOM.createRoot(domContainer);

const e = React.createElement;
root.render(e(App));
