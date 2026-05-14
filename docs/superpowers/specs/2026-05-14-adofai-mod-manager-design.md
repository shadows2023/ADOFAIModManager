# ADOFAI Mod Manager — 设计文档

## 概述

基于 Electron + Vue 3 + TypeScript 的 MelonLoader Mod 管理器，专为游戏 **A Dance of Fire and Ice** 设计。提供游戏路径配置、MelonLoader 安装管理、Mod 安装/卸载功能，预留在线 Mod 源扩展接口。

## 技术栈

| 层 | 技术 |
|--|--|
| 应用壳 | Electron |
| 渲染进程 | Vue 3 + TypeScript + Vite (`electron-vite`) |
| 状态管理 | Pinia |
| 主进程-渲染通信 | Electron IPC (contextBridge) |
| 构建 | electron-vite |

## 项目结构

```
adofai-mod-manager/
├── electron.vite.config.ts
├── src/
│   ├── main/                    # 主进程
│   │   ├── index.ts             # Electron 入口
│   │   └── services/            # 核心服务层
│   │       ├── GameService.ts
│   │       ├── MelonLoaderService.ts
│   │       ├── ModService.ts
│   │       └── sources/
│   │           └── ModSourceAdapter.ts  # 在线源抽象接口
│   ├── preload/
│   │   └── index.ts             # contextBridge 暴露 API
│   └── renderer/                # Vue 3 渲染进程
│       ├── App.vue
│       ├── main.ts
│       ├── assets/
│       ├── stores/
│       │   ├── gameStore.ts
│       │   ├── mlStore.ts
│       │   └── modStore.ts
│       ├── components/
│       │   ├── Sidebar.vue
│       │   ├── SidebarItem.vue
│       │   ├── GameStatusBanner.vue
│       │   ├── InstallProgress.vue
│       │   ├── ModCard.vue
│       │   └── ModDetail.vue
│       └── views/
│           ├── GameSetupView.vue
│           ├── ModManagerView.vue
│           └── AboutView.vue
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── tsconfig.web.json
```

## UI 布局

三栏布局，适配 r2modman 风格：

```
┌─────────────────────────────────────────────────────┐
│  ADOFAI Mod Manager                       — ☐ ✕    │
├──────────┬──────────────────────┬───────────────────┤
│ 侧边栏    │  Mod 列表            │  Mod 详情/操作     │
│           │                      │                   │
│ ├ 游戏设置 │  ┌──────────────┐   │  名称、版本、      │
│ ├ Mod管理  │  │ Mod Name 1   │   │  作者、描述        │
│ └ 关于    │  │ Mod Name 2   │   │                   │
│           │  │ Mod Name 3   │   │  ├ 启用/禁用       │
│           │  └──────────────┘   │  ├ 卸载            │
│           │  [安装Mod] [刷新]   │  └ 在线源(预留)    │
│           │  [在线浏览(预留)]   │                   │
└──────────┴──────────────────────┴───────────────────┘
```

## 视图说明

### 1. 游戏设置页
- 游戏路径选择（原生文件夹对话框）
- 路径有效性验证（检测 ADOFAI 可执行文件）
- MelonLoader 信息卡片（版本号、安装状态）
- 安装/卸载 MelonLoader 按钮
- 下载进度条

### 2. Mod 管理页
- 三栏布局：
  - **左栏**：Mod 列表（名称+启用开关）
  - **右栏**：选中 Mod 的详细信息 + 操作按钮
- 顶部工具栏：搜索框、安装本地 Mod 按钮、刷新按钮、在线浏览按钮（预留）
- 右键或开关支持启用/禁用（`.dll` ↔ `.disabled`）

### 3. 关于页
- 应用版本、作者信息

## 服务层设计

### GameService
```typescript
class GameService {
  validateGamePath(path: string): GameInfo | null
  getGameInfo(path: string): GameInfo
  saveGamePath(path: string): void
  loadGamePath(): string | null
}
```

### MelonLoaderService
```typescript
class MelonLoaderService {
  download(gamePath: string): Promise<void>
  install(gamePath: string): Promise<void>
  uninstall(gamePath: string): Promise<void>
  isInstalled(gamePath: string): boolean
  getVersion(gamePath: string): string | null
}
```

### ModService
```typescript
class ModService {
  installFromFile(sourcePath: string, gamePath: string): Promise<string>
  uninstall(modId: string, gamePath: string): Promise<void>
  getInstalledMods(gamePath: string): InstalledMod[]
  toggle(modId: string, gamePath: string, enabled: boolean): void
  openModsFolder(gamePath: string): void
}
```

### ModSourceAdapter（在线源扩展接口，预留）
```typescript
abstract class ModSourceAdapter {
  abstract readonly name: string
  abstract fetchModList(): Promise<ModMetaData[]>
  abstract downloadMod(mod: ModMetaData, destPath: string): Promise<void>
}
```

## Pinia Stores

| Store | 状态 |
|--|--|
| gameStore | 游戏路径、游戏信息、路径是否有效 |
| mlStore | ML 版本、安装状态、下载进度、下载中标志 |
| modStore | Mod 列表、当前选中 Mod、搜索关键词、过滤条件 |

## IPC 频道

preload 通过 `contextBridge.exposeInMainWorld` 暴露 `window.electronAPI`，频道分组：

- `game:select-directory` — 打开文件夹对话框
- `game:validate` — 验证路径
- `game:get-path` / `game:save-path`
- `ml:status` — 检查 ML 安装状态
- `ml:install` / `ml:uninstall`
- `mod:install-from-file` — 弹出文件对话框并安装
- `mod:uninstall` / `mod:list` / `mod:toggle` / `mod:open-folder`
- `source:fetch-mods` / `source:download-mod`（预留，方法体为空）

## 错误处理

1. 服务层方法抛出异常
2. IPC handler catch 错误，序列化后返回 `{ error: string }`
3. 渲染进程检查返回值，有 error 则展示错误提示
4. 下载/安装等耗时操作通过 `ipcMain.on` + `event.sender.send` 推送进度事件
5. Pinia action 统一处理 loading / error 状态

## 后续扩展

- 在 `src/main/services/sources/` 下实现具体 `ModSourceAdapter`（如 ThunderstoreSource、GitHubSource）
- 在线 Mod 浏览页面集成到 ModManagerView
- Mod 配置界面（如果 Mod 提供配置文件）
