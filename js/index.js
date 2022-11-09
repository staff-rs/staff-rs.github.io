import React, { useState } from "react";
import { notes } from "../pkg/index.js";
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
        className={isSelected ? "selected" : ""}
        onClick={() => {
          if (!isSelected) {
            setSelected([note, ...selected]);
          }
        }}
      >
        {note.name()}
      </li>
    );
  });
  return <ul>{keys}</ul>;
};

const domContainer = document.querySelector("#piano");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Piano));
