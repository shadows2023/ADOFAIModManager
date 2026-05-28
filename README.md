# ADOFAI Mod Manager

[中文](README.zh-CN.md)

An Electron + Vue 3 based MelonLoader mod manager for **A Dance of Fire and Ice**.

### Features

- **Game path setup** - Select and validate the ADOFAI directory
- **MelonLoader management** - Install or uninstall MelonLoader with one click
- **Mod management** - Install local .dll mods, uninstall, enable/disable, and search
- **Online sources (planned)** - Extensible adapter for future online mod sources

### Screenshots

<!-- TODO: add screenshots -->

### Usage


### Development

```bash
# Install dependencies
npm install

# Dev mode
npm run dev

# Build production bundles
npm run build

# Package exe (run npm run build first)
npx electron-builder
```

### Project Structure

```
src/
├── main/                # Electron main process
│   ├── index.ts         # Entry + IPC handlers
│   └── services/        # Core services
│       ├── GameService.ts
│       ├── MelonLoaderService.ts
│       ├── ModService.ts
│       └── sources/     # Online source adapters
├── preload/             # Preload scripts
└── renderer/            # Vue 3 frontend
    ├── stores/          # Pinia stores
    ├── components/      # Shared components
    └── views/           # Pages
```