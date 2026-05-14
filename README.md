# ADOFAI Mod Manager

基于 Electron + Vue 3 的 MelonLoader Mod 管理器，专为游戏 **A Dance of Fire and Ice** 设计。

## 功能

- **游戏路径配置** — 选择 ADOFAI 游戏目录，自动验证
- **MelonLoader 管理** — 一键下载安装/卸载 MelonLoader
- **Mod 管理** — 本地 .dll 文件安装、卸载、启用/禁用开关、搜索
- **在线 Mod 源** — 预留扩展接口，后续可接入在线 Mod 源

## 截图

<!-- TODO: add screenshots -->

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 打包为 exe 安装包（先运行 npm run build）
npx electron-builder
```

## 项目结构

```
src/
├── main/                # Electron 主进程
│   ├── index.ts         # 入口 + IPC 处理
│   └── services/        # 核心服务层
│       ├── GameService.ts
│       ├── MelonLoaderService.ts
│       ├── ModService.ts
│       └── sources/     # 在线源扩展接口
├── preload/             # preload 脚本
└── renderer/            # Vue 3 前端
    ├── stores/          # Pinia 状态管理
    ├── components/      # 公共组件
    └── views/           # 页面视图
```

## 技术栈

- Electron + electron-vite
- Vue 3 + TypeScript
- Pinia
- electron-builder

## License

MIT
