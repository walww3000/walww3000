# 项目：Android & iOS Demo App

一个用于学习和演示的日历事件管理 Demo，同时包含 Android 和 iOS 两个版本。

## 技术栈

### Android
- Android（Kotlin），minSdk 24，targetSdk/compileSdk 34
- AGP 8.2.0 + Gradle 8.5 + Kotlin 1.9.22 + JDK 17
- 依赖：AndroidX AppCompat、Material Design、RecyclerView、ConstraintLayout

### iOS
- iOS（Swift 5），Deployment Target iOS 16.0
- UIKit + UICalendarView（纯代码 UI，无 Storyboard）
- Xcode 15+

## 项目结构

### Android
- `app/src/main/java/com/example/demo/` — 主代码（MainActivity、CalendarEvent、EventAdapter）
- `app/src/main/res/layout/` — activity_main、dialog_add_event、item_event
- `app/src/main/res/mipmap-*/` — 启动图标（各密度 PNG + anydpi-v26 adaptive icon）
- `.github/workflows/android-build.yml` — Android CI 流程

### iOS
- `ios-demo/CalendarDemo/CalendarDemo/` — 主代码
  - `CalendarEvent.swift` — 数据模型
  - `EventManager.swift` — 事件管理（内存存储）
  - `MainViewController.swift` — 主界面（日历 + 事件列表）
  - `AddEventViewController.swift` — 添加事件页面
  - `EventCell.swift` — 事件列表 Cell
  - `AppDelegate.swift` / `SceneDelegate.swift` — 应用入口
- `.github/workflows/ios-build.yml` — iOS CI 流程

## CI/CD 流程（GitHub Actions）

### Android CI
workflow 文件：`.github/workflows/android-build.yml`

**当前流程**：push 到 master 或 claude/** 分支时触发
1. Checkout → JDK 17 setup → Accept SDK licenses → Build Debug APK
2. 构建成功 → 自动创建 GitHub Release（tag: build-{run_number}）并上传 APK
3. Telegram 通知（成功发 APK 文件，失败发链接）

### iOS CI
workflow 文件：`.github/workflows/ios-build.yml`

**当前流程**：push 到 master 或 claude/** 分支时，且 ios-demo/ 有变更时触发
1. Checkout → Select Xcode → xcodebuild（模拟器 Debug 构建，无签名）
2. Telegram 通知（成功/失败）

**需要配置的 Secrets**：
- `TELEGRAM_BOT_TOKEN` — Telegram Bot Token
- `TELEGRAM_CHAT_ID` — 接收通知的 Chat ID

**需要的仓库权限**：
- Settings → Actions → General → Workflow permissions → 选 "Read and write permissions"
- 或在 workflow 中声明 `permissions: contents: write`（已配置）

## 踩坑记录（重要！）

### 1. GitHub Actions 不要用 `android-actions/setup-android@v3`
- GitHub 的 ubuntu-latest runner **自带 Android SDK**（$ANDROID_HOME 已设置）
- 第三方 setup-android action 可能干扰环境导致插件解析失败
- 正确做法：直接用 runner 自带的 SDK，加一步 `yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true`

### 2. 资源文件必须完整，尤其是启动图标
- AndroidManifest 引用 `@mipmap/ic_launcher`，必须有对应资源
- 需要所有密度的 PNG（mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi）
- API 26+ 需要 `mipmap-anydpi-v26/ic_launcher.xml`（adaptive icon）
- 缺少任何一个都会导致 AAPT 编译失败

### 3. CI workflow 要尽量精简
- Gradle cache、单元测试、日志上传等非核心步骤在调试阶段先去掉
- 流程跑通后再逐步加回来
- Release 和 Telegram 步骤加 `continue-on-error: true`，避免辅助功能失败拖垮整个 job

### 4. softprops/action-gh-release 需要写权限
- 必须在 workflow 顶层声明 `permissions: contents: write`
- 否则创建 tag/release 会 403 失败

## 开发注意事项

- 本仓库用于编写和测试 Android & iOS Demo App
- 根据具体需求逐步添加功能模块
- 修改 CI 配置后注意观察 Actions 运行结果
- Android 本地编译：`chmod +x gradlew && ./gradlew assembleDebug --stacktrace`
- iOS 本地编译：`cd ios-demo/CalendarDemo && xcodebuild build -project CalendarDemo.xcodeproj -scheme CalendarDemo -destination 'platform=iOS Simulator,name=iPhone 15' CODE_SIGN_IDENTITY="" CODE_SIGNING_REQUIRED=NO`
