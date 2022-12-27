use staff::{
    fretboard::{self, render::Marker, Diagram, Range, Renderer},
    render::Rectangle,
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

    pub fn push_or_remove(&mut self, range: &Range) {
        self.renderer.diagram.insert(range.clone());
    }

    pub fn set_strings(&mut self, strings: u8) {
        self.renderer.set_strings(strings);
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
