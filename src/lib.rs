use staff::render::fretboard::{self, Fretboard};
use wasm_bindgen::prelude::*;

// When the `wee_alloc` feature is enabled, this uses `wee_alloc` as the global
// allocator.
//
// If you don't want to use `wee_alloc`, you can safely delete this.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Line {
    pub x1: f64,
    pub y1: f64,
    pub x2: f64,
    pub y2: f64,
    pub stroke_width: f64,
}

impl Line {
    pub fn new(x1: f64, y1: f64, x2: f64, y2: f64, stroke_width: f64) -> Self {
        Self {
            x1,
            y1,
            x2,
            y2,
            stroke_width,
        }
    }
}

#[wasm_bindgen]
pub fn render(width: f64, height: f64) -> Box<[JsValue]> {
    let fretboard = Fretboard::builder().build(width, height);

    let x = 0.;
    let mut y = 0.;
    let stroke_width = 2.;
    let mut lines = Vec::new();

    for idx in 0..fretboard.builder.strings {
        let line_x = x + fretboard.fret_width * idx as f64;
        lines.push(
            Line::new(
                line_x,
                y + fretboard.fret_height,
                line_x,
                fretboard.height - fretboard.builder.padding,
                stroke_width,
            )
            .into(),
        );
    }

    let line_y = y + fretboard.fret_height;
    lines.push(
        Line::new(
            x - stroke_width / 2.,
            line_y,
            x + (fretboard.fret_width * (fretboard.builder.strings - 1) as f64) + stroke_width / 2.,
            line_y,
            stroke_width * 2.,
        )
        .into(),
    );
    y += stroke_width;

    for idx in 1..fretboard.builder.fret_count {
        let line_y = line_y + fretboard.fret_height * idx as f64;
        lines.push(
            Line::new(
                x - stroke_width / 2.,
                line_y,
                x + fretboard.fret_width * (fretboard.builder.strings - 1) as f64
                    + stroke_width / 2.,
                line_y,
                stroke_width,
            )
            .into(),
        );
    }

    lines.into_boxed_slice()
}
