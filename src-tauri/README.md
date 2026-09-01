# Research Affiliations — Desktop App (Tauri)

This project is configured as a native desktop app using **Tauri v2**. It wraps the existing web app into a native Mac window with its own dock icon.

## Prerequisites (one-time setup on your Mac)

1. **Install Rust** — Tauri compiles a native binary, which requires Rust:
   ```sh
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```
   Then restart your terminal so `cargo` is on your PATH.

2. **Install Xcode Command Line Tools** (if not already installed):
   ```sh
   xcode-select --install
   ```

3. **Install npm dependencies** (includes the Tauri CLI):
   ```sh
   npm install
   ```

## Run the desktop app (development mode)

```sh
npm run tauri:dev
```
This starts the Vite dev server and opens the app in a native window. Hot-reload works just like in the browser.

## Build the production Mac app

```sh
npm run tauri:build
```
This produces:
- a `.app` bundle you can drag into your **Applications** folder
- a `.dmg` installer for sharing

The output is in `src-tauri/target/release/bundle/`.

## Generate proper app icons (optional)

The placeholder icon was auto-generated. To create a polished icon from your own image:

```sh
npm run tauri icon path/to/your-icon.png
```
This generates all required sizes and the `.icns` file automatically.
