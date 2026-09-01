// Prevents an extra console window on Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    research_affiliations_lib::run()
}
