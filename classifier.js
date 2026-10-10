const $ = s => document.querySelector(s);
const input = $('#file'), img = $('#preview'), hint = $('#hint'), drop = $('#drop');
const status = $('#status'), guess = $('#guess'), results = $('#results');
let model, cfg;

async function init() {
  let step = 'starting';
  try {
    step = 'loading TensorFlow.js';
    if (typeof tf === 'undefined') throw new Error('the TensorFlow.js script did not load (offline or blocked?)');
    step = 'reading model/config.json';
    cfg = await (await fetch('model/config.json')).json();
    step = 'reading model/model.json';
    const meta = await (await fetch('model/model.json')).json();
    step = 'building the ' + (meta.format || 'layers-model') + ' and fetching its .bin files';
    model = meta.format === 'graph-model'
      ? await tf.loadGraphModel('model/model.json')
      : await tf.loadLayersModel('model/model.json');
    status.textContent = 'Model ready. Choose an image.';
    input.disabled = false;
  } catch (e) {
    console.error(e);
    status.textContent = 'Could not load the model while ' + step + ': ' + e.message;
  }
}

function predict() {
  const [h, w] = cfg.imageSize;
  const probs = tf.tidy(() => {
    const x = tf.browser.fromPixels(img, 3).resizeBilinear([h, w]).toFloat().div(cfg.scale).expandDims(0);
    let y = model.predict(x);
    if (Array.isArray(y)) y = y[0];
    y = y.squeeze();
    return Math.abs(y.sum().dataSync()[0] - 1) < 0.01 ? y : tf.softmax(y);
  });
  const p = Array.from(probs.dataSync());
  probs.dispose();
  const top = p.map((v, i) => [i, v]).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const name = i => (cfg.labels && cfg.labels[i]) || 'Class ' + i;

  status.textContent = 'My guess:';
  guess.textContent = name(top[0][0]) + ' (' + (top[0][1] * 100).toFixed(1) + '%)';
  results.replaceChildren(...top.map(([i, v]) => {
    const li = document.createElement('li');
    li.innerHTML = '<div class="row"><span></span><span></span></div><div class="track"><div class="fill"></div></div>';
    const [a, b] = li.querySelectorAll('.row span');
    a.textContent = name(i);
    b.textContent = (v * 100).toFixed(1) + '%';
    li.querySelector('.fill').style.width = (v * 100) + '%';
    return li;
  }));
}

function show(file) {
  if (!file || !file.type.startsWith('image/')) return;
  status.textContent = 'Thinking…';
  guess.textContent = '';
  results.replaceChildren();
  img.onload = () => { try { predict(); } catch (e) { console.error(e); status.textContent = 'Prediction failed. Check imageSize and scale in model/config.json.'; } };
  img.src = URL.createObjectURL(file);
  img.hidden = false;
  hint.hidden = true;
}

input.addEventListener('change', () => show(input.files[0]));
['dragenter', 'dragover'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => { if (!input.disabled) show(e.dataTransfer.files[0]); });
init();
