import React, { useRef, useState } from "react";
import {
  fretboard_new,
  fretboard_grid,
  fretboard_fretted,
  fretboard_pos,
  fretted_rectangle,
  fretboard_render_fretted,
  fretboard_extend_pos,
} from "../pkg/index.js";
import ReactDOM from "react-dom";

function App() {
  const width = 300;
  const height = 300;

  const [fretboard, setFretboard] = useState(fretboard_new(width, height));

  const [lines, setLines] = useState(fretboard_grid(fretboard));

  const [fretted, setFretted] = useState(fretboard_fretted(fretboard));

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentFret, setCurrentFret] = useState(null);
  const [marker, setMarker] = useState(null);

  const currentRef = useRef(null);

  return (
    <svg
      ref={currentRef}
      width={width}
      height={height}
      onMouseMove={(event) => {
        const boundingBox = currentRef.current.getBoundingClientRect();
        const x = event.clientX - boundingBox.left;
        const y = event.clientY - boundingBox.top;

        let fret;
        if (!isMouseDown) {
          fret = fretboard_pos(fretboard, x, y);
        } else {
          fret = fretboard_extend_pos(fretboard, currentFret, x, y);
        }

        setCurrentFret(fret);
        setMarker(fretboard_render_fretted(fretboard, fret));
      }}
      onMouseDown={(event) => {
        setIsMouseDown(true);
      }}
      onMouseUp={(event) => {
        setIsMouseDown(false);
      }}
    >
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
      {fretted.map((fretted) => (
        <Fretted fretted={fretted} className="" />
      ))}
      {marker != null && <Fretted fretted={marker} className="marker" />}
    </svg>
  );
}

function Fretted({ fretted, className }) {
  const rectangle = fretted_rectangle(fretted);

  if (rectangle != null) {
    return (
      <rect
        className={className}
        x={rectangle.x}
        y={rectangle.y}
        width={rectangle.width}
        height={rectangle.height}
        rx={rectangle.height / 2}
        fill="#000"
      />
    );
  }
  const lines = fretted.lines();
  if (lines != null) {
    return lines.map((line) => (
      <line
        x1={line.x1}
        y1={line.y1}
        x2={line.x2}
        y2={line.y2}
        strokeWidth={line.stroke_width}
        stroke={"#000"}
      />
    ));
  }
}

const domContainer = document.querySelector("#app");
const root = ReactDOM.createRoot(domContainer);

const e = React.createElement;
root.render(e(App));
