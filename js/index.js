import React, { useState } from "react";
import { notes, chord, from_name } from "../pkg/index.js";
import ReactDOM from "react-dom";

const e = React.createElement;

const Piano = () => {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");

  let keys = notes().map((note) => {
    const midi = note.midi();
    const isSelected =
      selected.find((selectedNote) => selectedNote.midi() == midi) != null;

    return (
      <li
        data-is-selected={isSelected}
        data-is-natural={note.is_natural()}
        onClick={() => {
          let array;
          if (!isSelected) {
            array = [note, ...selected];
          } else {
            array = selected.filter(
              (selectedNote) => selectedNote.midi() != midi
            );
          }
          setSelected(array);
          console.log(array.map((note) => note.midi()));
          setName(chord(array.map((note) => note.midi())));
        }}
      />
    );
  });

  return (
    <div id="chord">
      <form>
        <input
          id="name"
          type="text"
          placeholder="Chord name"
          value={name}
          onInput={(e) => {
            setName(e.target.value);
            const chord = from_name(e.target.value);
           window.history.replaceState({}, "", chord.url())
            setSelected(chord.midi_notes());
          }}
        />
        <input type="submit" value="Add" />
      </form>
      <ul>{keys}</ul>
    </div>
  );
};

const domContainer = document.querySelector("#piano");
const root = ReactDOM.createRoot(domContainer);
root.render(e(Piano));
