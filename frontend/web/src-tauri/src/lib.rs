mod commands;

use commands::AppState;
use couture_core::db::Database;
use std::sync::Mutex;
use tauri::Manager;

/// Initializes and runs the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Resolve DB path in the app data directory
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("failed to resolve app data dir");
            std::fs::create_dir_all(&app_data_dir).ok();
            let db_path = app_data_dir.join("couture.db");

            let db = Database::open(db_path.to_str().unwrap())
                .expect("failed to open database");

            app.manage(AppState {
                db: Mutex::new(db),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::fetch_sizes,
            commands::fetch_default_measurements,
            commands::fetch_presets,
            commands::fetch_preset_measurements,
            commands::get_measurements,
            commands::save_measurements,
            commands::fetch_garments,
            commands::fetch_pieces,
            commands::get_selections,
            commands::add_selection,
            commands::remove_selection,
            commands::save_adjustments,
            commands::fetch_pattern_types,
            commands::generate_pattern,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
