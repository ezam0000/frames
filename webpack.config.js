const CopyPlugin = require('copy-webpack-plugin');
const PermissionsOutputPlugin = require('webpack-permissions-plugin');

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'node_modules/ffprobe-static/bin', to: 'bin/' },
        { from: 'node_modules/ffmpeg-static/bin', to: 'bin/' },
      ],
    }),
    new PermissionsOutputPlugin({
      buildFiles: [
        './bin/darwin/x64/ffprobe',
        './bin/darwin/x64/ffmpeg',
        './bin/linux/x64/ffprobe',
        './bin/linux/x64/ffmpeg',
        './bin/win32/x64/ffprobe.exe',
        './bin/win32/x64/ffmpeg.exe',
      ],
    }),
  ],
};
