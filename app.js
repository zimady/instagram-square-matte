const OUTPUT_SIZE = 1080;
const MARGIN = 10;
const IMAGE_MAX_EDGE = OUTPUT_SIZE - (MARGIN * 2);

const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const downloadBtn = document.getElementById('downloadBtn');
const shareBtn = document.getElementById('shareBtn');
const resetBtn = document.getElementById('resetBtn');
const statusEl = document.getElementById('status');
const qualityInput = document.getElementById('qualityInput');
const qualityValue = document.getElementById('qualityValue');

let currentBlob = null;
let currentFilename = 'instagram-square-matte.jpg';
let currentFile = null;

function setStatus(message) {
  statusEl.textContent = message || '';
}

function setButtons(enabled) {
  downloadBtn.disabled = !enabled;
  resetBtn.disabled = !enabled;
  shareBtn.disabled = !enabled || !navigator.canShare;
}

function resetCanvas() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
}

resetCanvas();
setButtons(false);

qualityInput.addEventListener('input', async () => {
  qualityValue.textContent = Number(qualityInput.value).toFixed(2);
  if (currentFile) await processFile(currentFile);
});

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (file) await processFile(file);
});

['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
  });
});

dropzone.addEventListener('drop', async (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (file) await processFile(file);
});

async function processFile(file) {
  if (!file.type.startsWith('image/')) {
    setStatus('Choose an image file.');
    return;
  }

  currentFile = file;
  setStatus('Processing…');
  setButtons(false);

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

    resetCanvas();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height);
    const drawWidth = Math.round(bitmap.width * scale);
    const drawHeight = Math.round(bitmap.height * scale);
    const x = Math.round((OUTPUT_SIZE - drawWidth) / 2);
    const y = Math.round((OUTPUT_SIZE - drawHeight) / 2);

    ctx.drawImage(bitmap, x, y, drawWidth, drawHeight);
    bitmap.close?.();

    currentBlob = await canvasToBlob(canvas, 'image/jpeg', Number(qualityInput.value));
    currentFilename = makeOutputFilename(file.name);

    setStatus(`${drawWidth}×${drawHeight} image on 1080×1080 white square. Margin: 10 px.`);
    setButtons(true);
  } catch (error) {
    console.error(error);
    setStatus('Could not process that image. Try a JPEG or PNG exported as sRGB.');
    setButtons(false);
  }
}

function canvasToBlob(canvasEl, type, quality) {
  return new Promise((resolve, reject) => {
    canvasEl.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas export failed'));
    }, type, quality);
  });
}

function makeOutputFilename(filename) {
  const base = filename.replace(/\.[^.]+$/, '') || 'image';
  return `${base}_ig_square_1080.jpg`;
}

downloadBtn.addEventListener('click', () => {
  if (!currentBlob) return;
  const url = URL.createObjectURL(currentBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = currentFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

shareBtn.addEventListener('click', async () => {
  if (!currentBlob) return;

  const file = new File([currentBlob], currentFilename, { type: 'image/jpeg' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Instagram square image' });
    } catch (error) {
      // User cancelled share; no action needed.
    }
  } else {
    setStatus('Sharing is not supported in this browser. Use Download JPEG.');
  }
});

resetBtn.addEventListener('click', () => {
  currentBlob = null;
  currentFile = null;
  currentFilename = 'instagram-square-matte.jpg';
  fileInput.value = '';
  resetCanvas();
  setButtons(false);
  setStatus('');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // App still works online if service worker registration fails.
    });
  });
}
