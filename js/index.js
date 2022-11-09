import React, { useState } from "react";
import { notes, chord } from "../pkg/index.js";
import ReactDOM from "react-dom";

const e = React.createElement;

const Piano = () => {
  const [selected, setSelected] = useState([]);

  let keys = notes().map((note) => {
    const midi = note.midi();
    const isSelected =
      selected.find((selectedNote) => selectedNote.midi() == midi) != null;
    
    return (
      <li
        data-is-selected={isSelected}
        data-is-natural={note.is_natural()}
        onClick={() => {
          if (!isSelected) {
            setSelected([note, ...selected]);
          } else {
            setSelected(selected.filter(selectedNote => selectedNote.midi() != midi))
          }
        }}
     />
    );
  });

  const chordName = chord(selected.map(note => note.midi()));
  
  return (
    <div id="chord">
        <h4>{chordName}</h4>
        <ul>{keys}</ul>
    </div>
  );
};

const domContainer = document.querySelector("#piano");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Piano));
