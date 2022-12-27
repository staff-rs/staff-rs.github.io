import React, { useRef, useState } from "react";
import { Fretboard } from "../pkg/index.js";
import ReactDOM from "react-dom";

function Slider({ lable, value, setValue, min, max }) {
  const currentRef = useRef(null);
  const [isActive, setIsActive] = useState(false);

  const steps = max + 1 - min;
  const x = ((value - min) / steps) * 100;

  return (
    <div className="slider" data-is-active={isActive}>
      <div className="label">{lable}</div>

      <div
        className="handle"
        onMouseDown={() => setIsActive(true)}
        style={{ left: `calc(${x}% - 15px)` }}
      >
        <span className="label">{value}</span>
      </div>

      <div
        ref={currentRef}
        className={"bars"}
        onMouseMove={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (isActive) {
            const boundingBox = currentRef.current.getBoundingClientRect();
            const x = event.clientX - boundingBox.left;
            const stepWidth = boundingBox.width / steps;

            setValue(min + Math.round(x / stepWidth));
          }
        }}
        onMouseUp={() => setIsActive(false)}
        onMouseLeave={() => setIsActive(false)}
      >
        <div className="bar" />
        <div className="bar filled" style={{ width: x + "%" }} />
        <div
          className="point"
          onMouseDown={() => setIsActive(true)}
          style={{ left: `calc(${x}% - 10px)` }}
        />
      </div>
    </div>
  );
}

function App() {
  const width = 300;
  const height = 300;

  const [fretboard, setFretboard] = useState(new Fretboard(width, height));

  const [lines, setLines] = useState(fretboard.grid());

  const [fretted, setFretted] = useState(fretboard.fretted());

  const [isMouseDown, setIsMouseDown] = useState(false);
  const [currentRange, setCurrentRange] = useState(null);
  const [marker, setMarker] = useState(null);

  const currentRef = useRef(null);

  return (
    <div>
      <Slider
        lable={"Strings"}
        value={fretboard.strings}
        setValue={(value) => {
          fretboard.set_strings(value);
          setFretboard(fretboard);
          setLines(fretboard.grid());
          setFretted(fretboard.fretted());
        }}
        min={3}
        max={8}
      />

      <svg
        ref={currentRef}
        width={width}
        height={height}
        onMouseMove={(event) => {
          const boundingBox = currentRef.current.getBoundingClientRect();
          const x = event.clientX - boundingBox.left;
          const y = event.clientY - boundingBox.top;

          let range = fretboard.pos(x, y);
          if (currentRange != null && isMouseDown) {
            range.start = Math.min(range.start, currentRange.start);
            range.end = Math.max(range.end, currentRange.end);
          }

          setCurrentRange(range);
          setMarker(fretboard.render_fretted(range));
        }}
        onMouseDown={(event) => {
          setIsMouseDown(true);
        }}
        onMouseUp={(event) => {
          setIsMouseDown(false);

          fretboard.push(currentRange);
          setFretted(fretboard.fretted());
          setCurrentRange(null);
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
    </div>
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
