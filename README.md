# Tauri + React + Typescript

This template should help get you started developing with Tauri, React and Typescript in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 开发笔记

```
隐藏标题栏
    "windows": [
      {
        "fullscreen": false,
        "height": 735,
        "resizable": true,
        "title": "System Tools",
        "width": 1150,
        "hiddenTitle": true,
        "titleBarStyle": "Overlay"
      }
    ]
```

### 设计

1、所有的状态存放本地 sqlite

#### 参考项目

```
1、https://github.com/rrkeji/rrai-desktop
2、https://github.com/rrkeji/rrai-desktop-sdk
```

## 致谢

1、ChatGpt

sqlite3 版本表结构迁移
https://blog.csdn.net/cdc8596/article/details/94732238
/Users/sysadmin/.system_tools/sqlite

https://crates.io/search?q=sqlite

https://github.com/launchbadge/sqlx