#!/bin/bash
# ============================================
# APK 编译脚本 - 将博客网页打包为 Android APK
# ============================================
# 用法: ./build-apk.sh
# 输出: build/blog.apk
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[BUILD]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Android SDK 路径检测
if [ -n "$ANDROID_HOME" ]; then
    SDK_DIR="$ANDROID_HOME"
elif [ -n "$ANDROID_SDK_ROOT" ]; then
    SDK_DIR="$ANDROID_SDK_ROOT"
elif [ -d "/usr/lib/android-sdk" ]; then
    SDK_DIR="/usr/lib/android-sdk"
elif [ -d "$HOME/Android/Sdk" ]; then
    SDK_DIR="$HOME/Android/Sdk"
else
    error "找不到 Android SDK! 请设置 ANDROID_HOME 环境变量"
fi

log "Android SDK: $SDK_DIR"

# 查找构建工具
find_tool() {
    local tool_name="$1"
    local found=""
    # 在 build-tools 目录中查找
    if [ -d "$SDK_DIR/build-tools" ]; then
        found=$(find "$SDK_DIR/build-tools" -name "$tool_name" -type f 2>/dev/null | sort -V | tail -1)
    fi
    # 在 SDK 根目录查找
    if [ -z "$found" ]; then
        found=$(find "$SDK_DIR" -name "$tool_name" -type f 2>/dev/null | head -1)
    fi
    # 在系统 PATH 中查找
    if [ -z "$found" ]; then
        found=$(which "$tool_name" 2>/dev/null || true)
    fi
    echo "$found"
}

AAPT=$(find_tool "aapt")
DX=$(find_tool "dx")
D8=$(find_tool "d8")
ZIPALIGN=$(find_tool "zipalign")
APKSIGNER=$(find_tool "apksigner")

# 查找 android.jar
ANDROID_JAR=""
if [ -d "$SDK_DIR/platforms" ]; then
    ANDROID_JAR=$(find -L "$SDK_DIR/platforms" -name "android.jar" 2>/dev/null | sort -V | tail -1)
fi
if [ -z "$ANDROID_JAR" ]; then
    error "找不到 android.jar! 请确保安装了 Android platform"
fi

[ -z "$AAPT" ] && error "找不到 aapt! 请安装 android-sdk-build-tools"
[ -z "$DX" ] && [ -z "$D8" ] && error "找不到 dx 或 d8! 请安装 android-sdk-build-tools"

log "aapt: $AAPT"
log "android.jar: $ANDROID_JAR"
[ -n "$DX" ] && log "dx: $DX"
[ -n "$D8" ] && log "d8: $D8"

# 构建目录
BUILD_DIR="$PROJECT_DIR/build"
GEN_DIR="$BUILD_DIR/gen"
CLASSES_DIR="$BUILD_DIR/classes"
DEX_DIR="$BUILD_DIR/dex"
APK_DIR="$BUILD_DIR/apk"

# 清理旧的构建
rm -rf "$BUILD_DIR"
mkdir -p "$GEN_DIR" "$CLASSES_DIR" "$DEX_DIR" "$APK_DIR"

# 源码和资源路径
SRC_DIR="$PROJECT_DIR/app/src/main/java"
RES_DIR="$PROJECT_DIR/app/src/main/res"
ASSETS_DIR="$PROJECT_DIR/app/src/main/assets"
MANIFEST="$PROJECT_DIR/app/src/main/AndroidManifest.xml"

# ===== 步骤 1: 同步网页资源到 assets 目录 =====
log "步骤 1/7: 同步网页资源..."
mkdir -p "$ASSETS_DIR"
cp -f "$PROJECT_DIR/index.html" "$ASSETS_DIR/" 2>/dev/null || true
cp -f "$PROJECT_DIR/style.css" "$ASSETS_DIR/" 2>/dev/null || true
cp -f "$PROJECT_DIR/script.js" "$ASSETS_DIR/" 2>/dev/null || true

# ===== 步骤 2: 生成 R.java =====
log "步骤 2/7: 生成 R.java..."
"$AAPT" package -f -m \
    -J "$GEN_DIR" \
    -M "$MANIFEST" \
    -S "$RES_DIR" \
    -I "$ANDROID_JAR"

# ===== 步骤 3: 编译 Java 源码 =====
log "步骤 3/7: 编译 Java 源码..."
JAVA_FILES=$(find "$SRC_DIR" "$GEN_DIR" -name "*.java" -type f)
javac -source 8 -target 8 \
    -classpath "$ANDROID_JAR" \
    -d "$CLASSES_DIR" \
    $JAVA_FILES

# ===== 步骤 4: 转换为 DEX 字节码 =====
log "步骤 4/7: 转换为 DEX..."
if [ -n "$D8" ]; then
    CLASS_FILES=$(find "$CLASSES_DIR" -name "*.class" -type f)
    "$D8" --lib "$ANDROID_JAR" --output "$DEX_DIR" $CLASS_FILES
elif [ -n "$DX" ]; then
    "$DX" --dex --output="$DEX_DIR/classes.dex" "$CLASSES_DIR"
fi

# ===== 步骤 5: 打包资源和 assets =====
log "步骤 5/7: 打包资源..."
"$AAPT" package -f \
    -M "$MANIFEST" \
    -S "$RES_DIR" \
    -A "$ASSETS_DIR" \
    -I "$ANDROID_JAR" \
    -F "$APK_DIR/blog-unsigned-unaligned.apk"

# 添加 dex 到 APK
cd "$DEX_DIR"
"$AAPT" add -f "$APK_DIR/blog-unsigned-unaligned.apk" classes.dex
cd "$PROJECT_DIR"

# ===== 步骤 6: 对齐 APK =====
log "步骤 6/7: 对齐 APK..."
if [ -n "$ZIPALIGN" ]; then
    "$ZIPALIGN" -f 4 "$APK_DIR/blog-unsigned-unaligned.apk" "$APK_DIR/blog-unsigned.apk"
else
    warn "zipalign 不可用，跳过对齐步骤"
    cp "$APK_DIR/blog-unsigned-unaligned.apk" "$APK_DIR/blog-unsigned.apk"
fi

# ===== 步骤 7: 签名 APK =====
log "步骤 7/7: 签名 APK..."

KEYSTORE="$BUILD_DIR/debug.keystore"
KEYSTORE_PASS="android"
KEY_ALIAS="androiddebugkey"

# 生成调试签名密钥
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair -v \
        -keystore "$KEYSTORE" \
        -alias "$KEY_ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass "$KEYSTORE_PASS" \
        -keypass "$KEYSTORE_PASS" \
        -dname "CN=Debug,OU=Debug,O=Debug,L=Debug,S=Debug,C=CN" \
        2>/dev/null
fi

if [ -n "$APKSIGNER" ]; then
    "$APKSIGNER" sign \
        --ks "$KEYSTORE" \
        --ks-key-alias "$KEY_ALIAS" \
        --ks-pass "pass:$KEYSTORE_PASS" \
        --key-pass "pass:$KEYSTORE_PASS" \
        --out "$BUILD_DIR/blog.apk" \
        "$APK_DIR/blog-unsigned.apk"
else
    # 使用 jarsigner 作为备选
    cp "$APK_DIR/blog-unsigned.apk" "$BUILD_DIR/blog.apk"
    jarsigner -verbose \
        -keystore "$KEYSTORE" \
        -storepass "$KEYSTORE_PASS" \
        -keypass "$KEYSTORE_PASS" \
        -signedjar "$BUILD_DIR/blog.apk" \
        "$APK_DIR/blog-unsigned.apk" \
        "$KEY_ALIAS" \
        2>/dev/null
fi

# 清理中间文件
rm -rf "$GEN_DIR" "$CLASSES_DIR" "$DEX_DIR" "$APK_DIR"

# 完成
APK_SIZE=$(du -h "$BUILD_DIR/blog.apk" | cut -f1)
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  APK 编译成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  输出文件: ${YELLOW}$BUILD_DIR/blog.apk${NC}"
echo -e "  文件大小: ${YELLOW}$APK_SIZE${NC}"
echo ""
echo -e "  安装到设备: adb install $BUILD_DIR/blog.apk"
echo -e "${GREEN}========================================${NC}"
