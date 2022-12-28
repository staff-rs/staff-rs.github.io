import React, { useMemo, useRef, useState } from "react";
import { Fretboard, Pitch, roots } from "../pkg/index.js";
import ReactDOM from "react-dom";
const context = new AudioContext();

// Signal dampening amount
let dampening = 0.99;

// Returns a AudioNode object that will produce a plucking sound
function pluck(frequency) {
  // We create a script processor that will enable
  // low-level signal sample access
  const pluck = context.createScriptProcessor(4096, 0, 1);

  // N is the period of our signal in samples
  const N = Math.round(context.sampleRate / frequency);

  // y is the signal presently
  const y = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    // We fill this with gaussian noise between [-1, 1]
    y[i] = Math.random() * 2 - 1;
  }

  // This callback produces the sound signal
  let n = 0;
  pluck.onaudioprocess = function (e) {
    // We get a reference to the outputBuffer
    const output = e.outputBuffer.getChannelData(0);

    // We fill the outputBuffer with our generated signal
    for (let i = 0; i < e.outputBuffer.length; i++) {
      // This averages the current sample with the next one
      // Effectively, this is a lowpass filter with a
      // frequency exactly half of sampling rate
      y[n] = (y[n] + y[(n + 1) % N]) / 2;

      // Put the actual sample into the buffer
      output[i] = y[n];

      // Hasten the signal decay by applying dampening.
      y[n] *= dampening;

      // Counting constiables to help us read our current
      // signal y
      n++;
      if (n >= N) n = 0;
    }
  };

  // The resulting signal is not as clean as it should be.
  // In lower frequencies, aliasing is producing sharp sounding
  // noise, making the signal sound like a harpsichord. We
  // apply a bandpass centred on our target frequency to remove
  // these unwanted noise.
  const bandpass = context.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.value = frequency;
  bandpass.Q.value = 1;

  // We connect the ScriptProcessorNode to the BiquadFilterNode
  pluck.connect(bandpass);

  // Our signal would have died down by 2s, so we automatically
  // disconnect eventually to prevent leaking memory.
  setTimeout(() => {
    pluck.disconnect();
  }, 2000);
  setTimeout(() => {
    bandpass.disconnect();
  }, 2000);

  // The bandpass is last AudioNode in the chain, so we return
  // it as the "pluck"
  return bandpass;
}

// Fret is an array of finger positions
// e.g. [-1, 3, 5, 5, -1, -1];
// 0 is an open string
// >=1 are the finger positions above the neck
function strum(fretboard) {
  // Reset dampening to the natural state
  dampening = 0.99;

  // Connect our strings to the sink
  const dst = context.destination;
  const stagger = 25;
  fretboard.frequencies().forEach((frequency, index) => {
    setTimeout(() => {
      pluck(frequency).connect(dst);
    }, stagger * index);
  });
}

function mute() {
  dampening = 0.89;
}

function playChord(fretboard) {
  context.resume().then(strum(fretboard));
}

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
  const [root, setRoot] = useState(new Pitch());

  const currentRef = useRef(null);

  return (
    <div>
      <div className="app">
        <div className="sidebar">
          <ul className="chips">
            {roots().map((pitch) => (
              <li
                onClick={() => setRoot(pitch)}
                data-is-selected={pitch.into_byte() === root.into_byte()}
              >
                {pitch.to_string()}
              </li>
            ))}
          </ul>

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

          <Slider
            lable={"Frets"}
            value={fretboard.frets}
            setValue={(value) => {
              fretboard.set_frets(value);
              setFretboard(fretboard);
              setLines(fretboard.grid());
              setFretted(fretboard.fretted());
            }}
            min={3}
            max={8}
          />
          <Slider
            lable={"Starting Fret"}
            value={fretboard.starting_fret}
            setValue={(value) => {
              fretboard.starting_fret = value;
              setFretboard(fretboard);
              setLines(fretboard.grid());
              setFretted(fretboard.fretted());
            }}
            min={0}
            max={24}
          />

          <div
            className="button filled play"
            onClick={() => {
              playChord(fretboard);
            }}
          >
            Play
          </div>
        </div>

        <div className="content">
          <div className="header">
            <div className="button">Download</div>
            <div className="button">Share</div>
          </div>

          <div className="diagram">
            <div className="wrap">
              <div className="starting-fret">
                {fretboard.starting_fret != 0 && fretboard.starting_fret}
              </div>
              <svg
                ref={currentRef}
                width={width}
                height={height}
                onMouseMove={(event) => {
                  const boundingBox =
                    currentRef.current.getBoundingClientRect();
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
                {marker != null && (
                  <Fretted fretted={marker} className="marker" />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
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
