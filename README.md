## 项目说明
 - 1、Tauri + React + Typescript
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

由于国内开发环境的问题
以下仓库是从 https://github.com/tauri-apps/plugins-workspace 拉取的
- https://github.com/Johnhong9527/tauri-plugin-sql
- https://gitee.com/seamong/tauri-plugin-sql


- https://github.com/Johnhong9527/tauri-plugin-sql
- https://gitee.com/seamong/tauri-plugin-sql

## 1.1.0 更新说明
移除项目中的所有冗余代码

## 问题解答
- 问题1.macOS 无法使用本软件, 移除macOS系统对指定软件的安全验证
- 问题1解答: sudo xattr -dr com.apple.quarantine /Applications/<本软件名称>
