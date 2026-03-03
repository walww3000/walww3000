# walww3000 Mobile App

使用 React Native + Expo 开发的跨平台移动应用，同时支持 Android 和 iOS。

## 环境准备

### 1. 安装 Node.js

下载并安装 Node.js (推荐 v18 或更高版本):
- 官网: https://nodejs.org/

验证安装:
```bash
node --version
npm --version
```

### 2. 安装 Expo CLI

```bash
npm install -g expo-cli
```

### 3. 安装项目依赖

```bash
cd mobile
npm install
```

### 4. 手机上安装 Expo Go

- **Android**: 在 Google Play 搜索 "Expo Go" 并安装
- **iOS**: 在 App Store 搜索 "Expo Go" 并安装

### 5. (可选) 模拟器/模拟器设置

#### Android Studio (Android 模拟器)
1. 下载安装 Android Studio: https://developer.android.com/studio
2. 打开 Android Studio → More Actions → Virtual Device Manager
3. 创建一个虚拟设备 (推荐 Pixel 系列)
4. 下载系统镜像并启动模拟器

#### Xcode (iOS 模拟器，仅限 macOS)
1. 从 Mac App Store 安装 Xcode
2. 打开 Xcode → Settings → Platforms → 下载 iOS 模拟器
3. 命令行安装工具: `xcode-select --install`

## 启动开发

```bash
cd mobile

# 启动开发服务器
npm start

# 或者直接指定平台
npm run android    # Android
npm run ios        # iOS (仅限 macOS)
npm run web        # 浏览器预览
```

启动后会显示一个二维码，用手机上的 Expo Go 扫码即可实时预览。

## 项目结构

```
mobile/
├── App.tsx                  # 应用入口
├── app.json                 # Expo 配置
├── package.json             # 依赖管理
├── tsconfig.json            # TypeScript 配置
├── babel.config.js          # Babel 配置
└── src/
    ├── screens/             # 页面/屏幕组件
    │   ├── HomeScreen.tsx   # 首页
    │   └── DetailScreen.tsx # 详情页
    ├── components/          # 可复用组件
    ├── navigation/          # 导航配置
    ├── hooks/               # 自定义 Hooks
    ├── services/            # API 服务
    ├── utils/               # 工具函数
    └── assets/              # 图片、字体等资源
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Expo 开发服务器 |
| `npm run android` | 在 Android 设备/模拟器上运行 |
| `npm run ios` | 在 iOS 模拟器上运行 (仅 macOS) |
| `npm run web` | 在浏览器中预览 |
| `npm test` | 运行测试 |
| `npm run lint` | 代码检查 |

## 下一步

- 在 `src/screens/` 中创建新页面
- 在 `src/components/` 中创建可复用组件
- 在 `src/services/` 中添加 API 调用
- 查看 [Expo 文档](https://docs.expo.dev/) 了解更多功能
- 查看 [React Native 文档](https://reactnative.dev/) 学习组件用法
