/// Couture Core — pure Rust library for sewing pattern drafting.
///
/// Contains domain logic (measurements, patterns, rendering, persistence)
/// without any Tauri dependency. Consumed by the Tauri app via IPC commands.

pub mod math;
pub mod measurements;
pub mod schemas;
pub mod renderers;
pub mod patterns;
pub mod db;
pub mod shop;
