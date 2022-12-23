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
impl Fretboard {
    #[wasm_bindgen(constructor)]
    pub fn new(width: f64, height: f64) -> Self {
        let mut inner = fretboard::Fretboard::builder().build(width, height);
        inner.push(Fret::new(0, 3..3)).unwrap();
        inner.push(Fret::new(2, 0..1)).unwrap();
        inner.push(Fret::new(1, 0..3)).unwrap();
        Self { inner }
    }

    pub fn push(&mut self, fret: &Fret) {
        self.inner.push(fret.clone()).ok();
    }

    pub fn render_fretted(&self, fret: &Fret) -> Fretted {
        let mut fretted = None;
        self.inner
            .render_single_fretted(0., 0., 2., fret, |f| fretted = Some(f));
        fretted.unwrap().into()
    }

    pub fn fretted(&self) -> Box<[JsValue]> {
        let mut vec = Vec::new();
        self.inner.render_fretted(0., 0., 2., |fretted| {
            let fretted = match fretted {
                fretboard::Fretted::Cross { lines } => Fretted {
                    rectangle: None,
                    lines: Some(
                        lines
                            .iter()
                            .map(|line| line.clone().into())
                            .collect::<Vec<_>>()
                            .into_boxed_slice(),
                    ),
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

    pub fn pos(&self, x: f64, y: f64) -> Option<Fret> {
        self.inner
            .pos(x, y)
            .map(|(string, fret)| Fret::new(fret, string..string + 1))
    }

    pub fn extend_pos(&self, fret: &Fret, x: f64, y: f64) -> Option<Fret> {
        self.inner
            .pos(x, y)
            .map(|(string, pos)| Fret::new(pos, fret.strings.start..string + 1))
    }

    pub fn grid(&self) -> Box<[JsValue]> {
        let mut lines = Vec::new();
        self.inner.render_grid(|line| lines.push(line.into()));
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

impl From<fretboard::Fretted> for Fretted {
    fn from(fretted: fretboard::Fretted) -> Self {
        match fretted {
            fretboard::Fretted::Cross { lines } => Fretted {
                rectangle: None,
                lines: Some(Box::new([])),
            },
            fretboard::Fretted::Rectangle(rectangle) => Fretted {
                rectangle: Some(rectangle),
                lines: None,
            },
        }
    }
}
