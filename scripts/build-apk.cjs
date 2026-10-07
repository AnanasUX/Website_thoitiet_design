const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 [1/4] Building web application assets for native app...');
execSync('npx vite build', {
  stdio: 'inherit',
  env: { ...process.env, BUILD_TARGET: 'app' }
});

console.log('🔄 [2/4] Syncing web assets into Android Capacitor project...');
execSync('npx cap sync android', { stdio: 'inherit' });

const androidDir = path.resolve(__dirname, '../android');
const capBuildGradle = path.resolve(androidDir, 'app/capacitor.build.gradle');
if (fs.existsSync(capBuildGradle)) {
  let gradleContent = fs.readFileSync(capBuildGradle, 'utf8');
  gradleContent = gradleContent.replace(/VERSION_21/g, 'VERSION_17');
  fs.writeFileSync(capBuildGradle, gradleContent, 'utf8');
}

console.log('🔨 [3/4] Compiling Android APK with Gradle...');
const isWindows = process.platform === 'win32';
const gradlewCmd = isWindows ? 'gradlew.bat' : './gradlew';

execSync(`${gradlewCmd} assembleDebug`, {
  cwd: androidDir,
  stdio: 'inherit'
});

console.log('📦 [4/4] Copying generated APK to release folder...');
const apkSource = path.resolve(androidDir, 'app/build/outputs/apk/debug/app-debug.apk');
const outDir = path.resolve(__dirname, '../release-apk');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const destApk = path.resolve(outDir, 'AnX-ThoiTiet.apk');
fs.copyFileSync(apkSource, destApk);

console.log('\n========================================');
console.log('🎉 THÀNH CÔNG! File APK đã được tạo tại:');
console.log('👉 ' + destApk);
console.log('========================================\n');
