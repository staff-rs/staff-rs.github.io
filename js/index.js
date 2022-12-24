import React, { useRef, useState } from "react";
import { Fretboard } from "../pkg/index.js";
import ReactDOM from "react-dom";

function App() {
  const width = 300;
  const height = 300;

  const [fretboard, setFretboard] = useState(new Fretboard(width, height));

  const [lines, setLines] = useState(fretboard.grid());

  const [fretted, setFretted] = useState(fretboard.fretted());

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
          fret = fretboard.pos(x, y);
        } else {
          fret = fretboard.extend_pos(currentFret, x, y);
        }

        setCurrentFret(fret);
        setMarker(fretboard.render_fretted(fret));
      }}
      onMouseDown={(event) => {
        setIsMouseDown(true);
      }}
      onMouseUp={(event) => {
        setIsMouseDown(false);

        fretboard.push_or_remove(currentFret);
        setFretted(fretboard.fretted());
        setCurrentFret(null);
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
      {fretted.map((fretted, idx) => (
        <Fretted key={idx} fretted={fretted} className="" />
      ))}
      {marker != null && <Fretted fretted={marker} className="marker" />}
    </svg>
  );
}

function Fretted({ fretted, className }) {
  const rectangle = fretted.rectangle;
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

  const lines = fretted.lines;
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
