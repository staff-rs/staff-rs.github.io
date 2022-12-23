use staff::render::fretboard::{self, Fret, Line, Rectangle};
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
    inner: fretboard::Fretboard,
}

#[wasm_bindgen]
pub fn fretboard_new(width: f64, height: f64) -> Fretboard {
    let mut inner = fretboard::Fretboard::builder().build(width, height);
    inner.push(Fret::new(0, 3..3)).unwrap();
    inner.push(Fret::new(2, 0..1)).unwrap();
    inner.push(Fret::new(1, 0..3)).unwrap();
    Fretboard { inner: inner }
}

#[wasm_bindgen]
pub fn fretboard_grid(fretboard: &Fretboard) -> Box<[JsValue]> {
    let mut lines = Vec::new();
    fretboard.inner.render_grid(|line| lines.push(line.into()));
    lines.into_boxed_slice()
}

#[wasm_bindgen]
pub struct Fretted {
    rectangle: Option<Rectangle>,
    lines: Option<Box<[JsValue]>>,
}

#[wasm_bindgen]
pub fn fretted_rectangle(fretted: &Fretted) -> Option<Rectangle> {
    fretted.rectangle.clone()
}

#[wasm_bindgen]
pub fn fretboard_fretted(fretboard: &Fretboard) -> Box<[JsValue]> {
    let mut vec = Vec::new();
    fretboard.inner.render_fretted(0., 0., 2., |fretted| {
        let fretted = match fretted {
            fretboard::Fretted::Cross { lines } => Fretted {
                rectangle: None,
                lines: Some(Box::new([])),
            },
            fretboard::Fretted::Rectangle(rectangle) => Fretted {
                rectangle: Some(rectangle),
                lines: None,
            },
        };
        vec.push(fretted.into())
    });

    vec.into_boxed_slice()
}
