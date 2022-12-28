use staff::{
    fretboard::{render::Marker, Diagram, Range, Renderer, STANDARD},
    midi::{MidiNote, Octave},
    render::Rectangle,
    set::PitchSet,
    Chord,
};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Fretboard {
    renderer: Renderer,
}

#[wasm_bindgen]
impl Fretboard {
    #[wasm_bindgen(constructor)]
    pub fn new(width: f64, height: f64) -> Self {
        let renderer = Renderer::new(Diagram::new(6, 6, 3), width, height);
        Self { renderer }
    }

    #[wasm_bindgen(getter)]
    pub fn strings(&self) -> u8 {
        self.renderer.diagram.strings()
    }

    #[wasm_bindgen(getter)]
    pub fn frets(&self) -> u8 {
        self.renderer.diagram.frets()
    }

    #[wasm_bindgen(getter)]
    pub fn starting_fret(&self) -> u8 {
        self.renderer.diagram.starting_fret
    }

    #[wasm_bindgen(setter)]
    pub fn set_starting_fret(&mut self, starting_fret: u8) {
        self.renderer.diagram.starting_fret = starting_fret;
    }

    pub fn push(&mut self, range: &Range) {
        if let Some(index) = range
            .into_point()
            .and_then(|_| self.renderer.diagram.intersections(range).next())
        {
            self.renderer.diagram.remove(index);
        } else {
            self.renderer.diagram.insert(range.clone());
        }
    }

    pub fn set_strings(&mut self, strings: u8) {
        self.renderer.set_strings(strings);
    }

    pub fn set_frets(&mut self, frets: u8) {
        self.renderer.set_frets(frets);
    }

    pub fn render_fretted(&self, range: &Range) -> Fretted {
        let mut fretted = None;
        self.renderer
            .render_single_fretted(0., 0., 2., range, |f| fretted = Some(f));
        fretted.unwrap().into()
    }

    pub fn fretted(&self) -> Box<[JsValue]> {
        let mut vec = Vec::new();
        self.renderer.render_fretted(0., 0., 2., |fretted| {
            let fretted = match fretted {
                Marker::Cross { lines } => Fretted {
                    rectangle: None,
                    lines: Some(
                        lines
                            .iter()
                            .map(|line| line.clone().into())
                            .collect::<Vec<_>>()
                            .into_boxed_slice(),
                    ),
                },
                Marker::Rectangle(rectangle) => Fretted {
                    rectangle: Some(rectangle),
                    lines: None,
                },
            };
            vec.push(fretted.into())
        });

        vec.into_boxed_slice()
    }

    pub fn pos(&self, x: f64, y: f64) -> Range {
        let (fret, string) = self.renderer.pos(x, y);
        Range::point(fret, string)
    }

    pub fn grid(&self) -> Box<[JsValue]> {
        let mut lines = Vec::new();
        self.renderer
            .render_grid(0., |line| lines.push(line.into()));
        lines.into_boxed_slice()
    }

    pub fn chord(&self, root: &Pitch) -> Option<String> {
        let midi_notes = self.renderer.diagram.midi_notes(STANDARD);
        Chord::from_midi(MidiNote::new(root.inner, Octave::FOUR), midi_notes)
            .as_ref()
            .map(Chord::to_string)
    }
}

#[wasm_bindgen]
pub struct Fretted {
    rectangle: Option<Rectangle>,
    lines: Option<Box<[JsValue]>>,
}

#[wasm_bindgen]
impl Fretted {
    #[wasm_bindgen(getter)]
    pub fn lines(&self) -> Option<Box<[JsValue]>> {
        self.lines.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn rectangle(&self) -> Option<Rectangle> {
        self.rectangle.clone()
    }
}

impl From<Marker> for Fretted {
    fn from(marker: Marker) -> Self {
        match marker {
            Marker::Cross { lines } => Fretted {
                rectangle: None,
                lines: Some(Box::new([])),
            },
            Marker::Rectangle(rectangle) => Fretted {
                rectangle: Some(rectangle),
                lines: None,
            },
        }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Pitch {
    inner: staff::Pitch,
}

#[wasm_bindgen]
impl Pitch {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: staff::Pitch::C,
        }
    }

    pub fn to_string(&self) -> String {
        self.inner.to_string()
    }
}

#[wasm_bindgen]
pub fn roots() -> Box<[JsValue]> {
    PitchSet::all()
        .into_iter()
        .map(|inner| Pitch { inner }.into())
        .collect::<Vec<_>>()
        .into_boxed_slice()
}
