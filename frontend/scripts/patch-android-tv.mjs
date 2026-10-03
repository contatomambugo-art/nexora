// Ajusta o projeto Android gerado pelo Capacitor para Android TV (idempotente).
import fs from 'node:fs';
const manifest = 'android/app/src/main/AndroidManifest.xml';
if (!fs.existsSync(manifest)) { console.error('Rode antes: npm run android:add'); process.exit(1); }
let m = fs.readFileSync(manifest, 'utf8');
if (!m.includes('LEANBACK_LAUNCHER'))
  m = m.replace(/(<category android:name="android.intent.category.LAUNCHER"\s*\/>)/, '$1\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />');
if (!m.includes('android.software.leanback'))
  m = m.replace('<application', '<uses-feature android:name="android.software.leanback" android:required="false" />\n    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />\n    <application');
if (!m.includes('usesCleartextTraffic'))
  m = m.replace('<application', '<application android:usesCleartextTraffic="true" android:banner="@drawable/banner"');
fs.writeFileSync(manifest, m);
fs.mkdirSync('android/app/src/main/res/drawable', { recursive: true });
fs.copyFileSync('android-assets/banner.png', 'android/app/src/main/res/drawable/banner.png');
console.log('Android TV: manifest e banner configurados.');
