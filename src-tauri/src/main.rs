#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    oxygenation_guest_lib::run();
}
