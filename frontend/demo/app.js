// Minimal demo client for /api/analyze/
// Uses fetch + multipart/form-data. No external dependencies.

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const fileNameEl = document.getElementById('file-name');
const analyzeBtn = document.getElementById('analyze-btn');
const statusEl = document.getElementById('status');
const resultsEl = document.getElementById('results');
const errorEl = document.getElementById('error');
const resultBodyEl = document.getElementById('result-body');
const resFileEl = document.getElementById('res-file');
const resTypeEl = document.getElementById('res-type');
const resSizeEl = document.getElementById('res-size');
const resDetectorsEl = document.getElementById('res-detectors');
const resRiskEl = document.getElementById('res-risk');
const resJsonEl = document.getElementById('res-json');
const sourceEl = document.getElementById('source');
const notesEl = document.getElementById('notes');

let currentFile = null;

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function setRiskPill(label) {
  const risk = (label || '').toUpperCase();
  resRiskEl.textContent = risk || 'LOW';
  resRiskEl.classList.remove('low', 'medium', 'high');
  if (risk === 'HIGH') resRiskEl.classList.add('high');
  else if (risk === 'MEDIUM') resRiskEl.classList.add('medium');
  else resRiskEl.classList.add('low');
}

function setStatus(message, withSpinner = false) {
  statusEl.innerHTML = '';
  if (withSpinner) {
    const spin = document.createElement('span');
    spin.className = 'spinner';
    statusEl.appendChild(spin);
  }
  if (message) {
    const text = document.createElement('span');
    text.textContent = message;
    statusEl.appendChild(text);
  }
}

function setError(message) {
  if (!message) {
    errorEl.classList.add('hidden');
    errorEl.textContent = '';
    return;
  }
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
  resultBodyEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');
}

function setResults(data) {
  if (!data) return;
  const meta = data.file_metadata || {};
  resFileEl.textContent = meta.name || '—';
  resTypeEl.textContent = meta.content_type || meta.file_type || '—';
  resSizeEl.textContent = formatBytes(meta.size_bytes);
  resDetectorsEl.textContent = (data.detectors_executed || []).join(', ') || '—';
  setRiskPill(data.risk_label);

  // Pretty-print JSON without storing raw text
  resJsonEl.textContent = JSON.stringify(data, null, 2);

  resultBodyEl.classList.remove('hidden');
  errorEl.classList.add('hidden');
  resultsEl.classList.remove('hidden');
}

function clearResults() {
  errorEl.classList.add('hidden');
  resultBodyEl.classList.add('hidden');
  resultsEl.classList.add('hidden');
}

function disableUI(disabled) {
  analyzeBtn.disabled = disabled;
  dropzone.setAttribute('aria-busy', String(disabled));
}

function pickFile(file) {
  currentFile = file;
  fileNameEl.textContent = file ? file.name : '';
}

// Drag & drop handlers
['dragenter', 'dragover'].forEach(evt => {
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.add('active');
  });
});

['dragleave', 'drop'].forEach(evt => {
  dropzone.addEventListener(evt, e => {
    e.preventDefault();
    dropzone.classList.remove('active');
  });
});

dropzone.addEventListener('drop', e => {
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    pickFile(file);
  }
});

dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

fileInput.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (file) pickFile(file);
});

async function analyze() {
  clearResults();
  if (!currentFile) {
    setError('Please select a file to analyze.');
    return;
  }

  const metadata = {};
  if (sourceEl.value.trim()) metadata.source = sourceEl.value.trim();
  if (notesEl.value.trim()) metadata.notes = notesEl.value.trim();

  const form = new FormData();
  form.append('file', currentFile);
  if (Object.keys(metadata).length) {
    form.append('metadata', JSON.stringify(metadata));
  }

  disableUI(true);
  setStatus('Analyzing file…', true);

  try {
    const response = await fetch('/api/analyze/', {
      method: 'POST',
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data?.error || 'Analysis failed.');
      return;
    }

    setStatus('Analysis complete.');
    setResults(data);
  } catch (err) {
    setError('Network or server error. Please try again.');
  } finally {
    disableUI(false);
    if (!statusEl.textContent) setStatus('');
  }
}

analyzeBtn.addEventListener('click', analyze);
