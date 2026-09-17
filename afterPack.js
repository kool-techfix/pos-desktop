const fs = require('fs');
const path = require('path');

exports.default = async function (context) {
  const { appOutDir, packager } = context;

  // Find the Resources folder inside the packaged app
  const resourcesPath = packager.platform.nodeName === 'darwin'
    ? path.join(appOutDir, `${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources')
    : path.join(appOutDir, 'resources');

  const src = path.join(__dirname, '.next', 'standalone');
  const dest = path.join(resourcesPath, '.next', 'standalone');

  console.log('[afterPack] Copying standalone folder manually...');
  console.log('  from:', src);
  console.log('  to:  ', dest);

  fs.cpSync(src, dest, { recursive: true });

  console.log('[afterPack] Done. node_modules present:',
    fs.existsSync(path.join(dest, 'node_modules')));
};