// Tanda tangan "ad-hoc" gratis untuk macOS.
// Tanpa ini, Mac dengan chip Apple (M1–M4) menolak membuka aplikasi dan menyebutnya "rusak".
// Tidak butuh sertifikat berbayar; macOS tetap menampilkan peringatan "pengembang tidak dikenal" sekali.
const { execFileSync } = require('child_process');
const path = require('path');

exports.default = async function adhocSign(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  console.log(`  • ad-hoc signing ${appPath}`);
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' });
};
