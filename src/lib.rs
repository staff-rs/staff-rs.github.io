use staff::{
    midi::{MidiNote, Octave},
    Pitch,
};
use wasm_bindgen::prelude::*;
use web_sys::console;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Note {
    midi: MidiNote,
}

#[wasm_bindgen]
impl Note {
    pub fn name(&self) -> String {
        self.midi.to_string()
    }

    pub fn midi(&self) -> u8 {
        self.midi.into_byte()
    }
}

#[wasm_bindgen]
pub fn notes() -> Box<[JsValue]> {
    let start = MidiNote::new(Pitch::C, Octave::FOUR).into_byte();
    let end = MidiNote::new(Pitch::B, Octave::SIX).into_byte();
    (start..end)
        .map(|b| {
            let midi_note = MidiNote::from_byte(b);
            let note = Note { midi: midi_note };
            note.into()
        })
        .collect::<Vec<_>>()
        .into_boxed_slice()
}

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    Ok(())
}
