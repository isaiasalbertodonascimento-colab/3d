// node render.js [quadroIni quadroFim saida.mp4] -> video_mudo.mp4 (1080x1920, 30 fps)
const open = require('./preview.js'); const { spawn } = require('child_process'); const path = require('path');
(async () => {
  const { b, p, info } = await open(); const A = process.argv.slice(2), N0 = +(A[0] || 0), N = A[1] ? +A[1] : Math.ceil(info.total * 30), OUT = A[2] || 'video_mudo.mp4';
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', path.join(__dirname, OUT)], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = N0; i < N; i++) {
    await p.evaluate(t => window.render(t), i / 30);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log('frame', i, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's');
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done');
})();
