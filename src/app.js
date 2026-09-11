// ============================================
// SRT Translator - App Logic (Optimized Edition)
// ============================================

const DEFAULT_MODEL_GEMINI = 'gemini-1.5-flash';
const DEFAULT_MODEL_OPENROUTER = 'google/gemini-1.5-flash';
const DEFAULT_MODEL_OPENAI = 'gpt-4-turbo';
const DEFAULT_MODEL_CUSTOM = 'gpt-3.5-turbo';
const DEFAULT_PARALLEL = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 45000;

// ============================================
// PRESET API CONFIGURATIONS
// ============================================
const API_PRESETS = {
    'gemini': {
        name: 'Google AI Studio (Gemini)',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        type: 'gemini',
        defaultModel: DEFAULT_MODEL_GEMINI,
        keyPlaceholder: 'Enter your Gemini API key...',
        docs: 'https://ai.google.dev'
    },
    'openrouter': {
        name: 'OpenRouter',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        type: 'openai-compatible',
        defaultModel: DEFAULT_MODEL_OPENROUTER,
        keyPlaceholder: 'Enter your OpenRouter API key...',
        docs: 'https://openrouter.ai'
    },
    'openai': {
        name: 'OpenAI (ChatGPT)',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        type: 'openai-compatible',
        defaultModel: DEFAULT_MODEL_OPENAI,
        keyPlaceholder: 'Enter your OpenAI API key...',
        docs: 'https://openai.com/api'
    },
    'groq': {
        name: 'Groq (Fast Inference)',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        type: 'openai-compatible',
        defaultModel: 'mixtral-8x7b-32768',
        keyPlaceholder: 'Enter your Groq API key...',
        docs: 'https://console.groq.com'
    },
    'ollama': {
        name: 'Ollama (Local)',
        endpoint: 'http://localhost:11434/v1/chat/completions',
        type: 'openai-compatible',
        defaultModel: 'mistral',
        keyPlaceholder: 'API key (leave empty for local)...',
        docs: 'https://ollama.ai'
    },
    'lm-studio': {
        name: 'LM Studio (Local)',
        endpoint: 'http://localhost:1234/v1/chat/completions',
        type: 'openai-compatible',
        defaultModel: 'local-model',
        keyPlaceholder: 'API key (leave empty for local)...',
        docs: 'https://lmstudio.ai'
    },
    'claude': {
        name: 'Anthropic Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        type: 'anthropic',
        defaultModel: 'claude-3-5-sonnet-20241022',
        keyPlaceholder: 'Enter your Anthropic API key...',
        docs: 'https://console.anthropic.com'
    },
    'custom': {
        name: 'Custom OpenAI Compatible',
        endpoint: '',
        type: 'openai-compatible',
        defaultModel: DEFAULT_MODEL_CUSTOM,
        keyPlaceholder: 'Enter your API key...',
        docs: ''
    }
};

class APIError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

// State
let srtContent = '';
let srtBlocks = [];
let translatedResult = '';
let originalFileName = '';

// DOM Elements
const elements = {
    dropZone: document.getElementById('dropZone'),
    fileInput: document.getElementById('fileInput'),
    dropText: document.getElementById('dropText'),
    fileName: document.getElementById('fileName'),
    translateBtn: document.getElementById('translateBtn'),
    translateBtnText: document.getElementById('translateBtnText'),
    progressCard: document.getElementById('progressCard'),
    downloadBtn: document.getElementById('downloadBtn'),
    apiKey: document.getElementById('apiKey'),
    customModel: document.getElementById('customModel'),
    targetLanguage: document.getElementById('targetLanguage'),
    chunkSize: document.getElementById('chunkSize'),
    parallelRequests: document.getElementById('parallelRequests'),
    customInstructions: document.getElementById('customInstructions'),
    chunksGrid: document.getElementById('chunksGrid'),
    logContainer: document.getElementById('logContainer'),
    progressFill: document.getElementById('progressFill'),
    progressPercent: document.getElementById('progressPercent'),
    totalChunks: document.getElementById('totalChunks'),
    completedChunks: document.getElementById('completedChunks'),
    failedChunks: document.getElementById('failedChunks'),
    optimizeTimings: document.getElementById('optimizeTimings'),
    mergeSubtitles: document.getElementById('mergeSubtitles'),
    apiProvider: document.getElementById('apiProvider'),
    customApiEndpoint: document.getElementById('customApiEndpoint'),
    customApiEndpointRow: document.getElementById('customApiEndpointRow'),
    apiProviderInfo: document.getElementById('apiProviderInfo')
};

// ============================================
// Initialization
// ============================================

function init() {
    populateApiProviders();
    loadSavedSettings();
    updateProviderUI();
    setupEventListeners();
}

function populateApiProviders() {
    const select = elements.apiProvider;
    select.innerHTML = '';
    
    Object.keys(API_PRESETS).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = API_PRESETS[key].name;
        select.appendChild(option);
    });
}

function updateProviderUI() {
    const provider = elements.apiProvider.value;
    const preset = API_PRESETS[provider];
    
    if (!preset) return;
    
    elements.apiKey.placeholder = preset.keyPlaceholder;
    elements.customModel.placeholder = `Custom model (default: ${preset.defaultModel})`;
    
    if (provider === 'custom') {
        elements.customApiEndpointRow.classList.remove('hidden');
    } else {
        elements.customApiEndpointRow.classList.add('hidden');
        elements.customApiEndpoint.value = preset.endpoint;
    }
    
    if (elements.apiProviderInfo) {
        elements.apiProviderInfo.innerHTML = `
            <strong>${preset.name}</strong><br>
            <small>Type: ${preset.type === 'openai-compatible' ? 'OpenAI Compatible' : preset.type.toUpperCase()}</small>
            ${preset.docs ? `<br><a href="${preset.docs}" target="_blank" style="color: var(--accent-primary); text-decoration: none;">Documentation ↗</a>` : ''}
        `;
    }
}

function loadSavedSettings() {
    const savedProvider = localStorage.getItem('srt_api_provider');
    const savedApiKey = localStorage.getItem('srt_api_key');
    const savedModel = localStorage.getItem('srt_custom_model');
    const savedLanguage = localStorage.getItem('srt_target_language');
    const savedChunkSize = localStorage.getItem('srt_chunk_size');
    const savedParallel = localStorage.getItem('srt_parallel_requests');
    const savedInstructions = localStorage.getItem('srt_custom_instructions');
    const savedOptimize = localStorage.getItem('srt_optimize_timings');
    const savedMerge = localStorage.getItem('srt_merge_subtitles');
    const savedCustomEndpoint = localStorage.getItem('srt_custom_api_endpoint');

    if (savedProvider) elements.apiProvider.value = savedProvider;
    else elements.apiProvider.value = 'openai';

    if (savedApiKey) elements.apiKey.value = savedApiKey.trim();
    if (savedModel) elements.customModel.value = savedModel.trim();
    if (savedLanguage) elements.targetLanguage.value = savedLanguage.trim();
    if (savedChunkSize) elements.chunkSize.value = savedChunkSize.trim();
    if (savedParallel) elements.parallelRequests.value = savedParallel.trim();
    else elements.parallelRequests.value = DEFAULT_PARALLEL;
    if (savedInstructions) elements.customInstructions.value = savedInstructions;
    if (savedCustomEndpoint) elements.customApiEndpoint.value = savedCustomEndpoint.trim();
    
    if (savedOptimize !== null) elements.optimizeTimings.checked = savedOptimize === 'true';
    else elements.optimizeTimings.checked = false;

    if (savedMerge !== null) elements.mergeSubtitles.checked = savedMerge === 'true';
    else elements.mergeSubtitles.checked = false;
}

function saveSettings() {
    const provider = elements.apiProvider.value;
    localStorage.setItem('srt_api_provider', provider);
    localStorage.setItem('srt_api_key', elements.apiKey.value.trim());
    localStorage.setItem('srt_custom_model', elements.customModel.value.trim());
    localStorage.setItem('srt_target_language', elements.targetLanguage.value);
    localStorage.setItem('srt_chunk_size', elements.chunkSize.value);
    localStorage.setItem('srt_parallel_requests', elements.parallelRequests.value);
    localStorage.setItem('srt_custom_instructions', elements.customInstructions.value);
    localStorage.setItem('srt_optimize_timings', elements.optimizeTimings.checked);
    localStorage.setItem('srt_merge_subtitles', elements.mergeSubtitles.checked);
    
    if (provider === 'custom') {
        localStorage.setItem('srt_custom_api_endpoint', elements.customApiEndpoint.value.trim());
    }
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);

    elements.apiKey.addEventListener('input', () => { saveSettings(); updateTranslateButton(); });
    elements.apiProvider.addEventListener('change', () => { saveSettings(); updateProviderUI(); updateTranslateButton(); });
    elements.customApiEndpoint.addEventListener('change', saveSettings);
    elements.customModel.addEventListener('change', saveSettings);
    elements.targetLanguage.addEventListener('change', () => { saveSettings(); updateTranslateButtonText(); });
    elements.chunkSize.addEventListener('change', saveSettings);
    elements.parallelRequests.addEventListener('change', saveSettings);
    elements.customInstructions.addEventListener('change', saveSettings);
    elements.optimizeTimings.addEventListener('change', () => { saveSettings(); reprocessLoadedFile(); });
    elements.mergeSubtitles.addEventListener('change', () => { saveSettings(); reprocessLoadedFile(); });

    elements.translateBtn.addEventListener('click', startTranslation);
    elements.downloadBtn.addEventListener('click', downloadResult);

    updateTranslateButton();
    updateTranslateButtonText();
}

function handleDragOver(e) { e.preventDefault(); elements.dropZone.classList.add('dragover'); }
function handleDragLeave() { elements.dropZone.classList.remove('dragover'); }
function handleDrop(e) {
    e.preventDefault();
    elements.dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.srt')) processFile(file);
}
function handleFileSelect(e) { const file = e.target.files[0]; if (file) processFile(file); }

// ============================================
// File Processing & Parsing SRT
// ============================================

function reprocessLoadedFile() {
    if (srtContent) {
        srtBlocks = parseSRT(srtContent);
        if (elements.mergeSubtitles.checked) mergeShortSubtitles(srtBlocks);
        if (elements.optimizeTimings.checked) optimizeTimings(srtBlocks);
        elements.dropText.textContent = `Loaded: ${srtBlocks.length} subtitle blocks`;
    }
}

function processFile(file) {
    originalFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
        srtContent = e.target.result;
        srtBlocks = parseSRT(srtContent);
        
        if (elements.mergeSubtitles.checked) mergeShortSubtitles(srtBlocks);
        if (elements.optimizeTimings.checked) optimizeTimings(srtBlocks);
        
        elements.fileName.textContent = `✓ ${file.name}`;
        elements.fileName.classList.remove('hidden');
        elements.dropText.classList.add('hidden');
        updateTranslateButton();
        log(`Loaded ${srtBlocks.length} subtitle blocks from ${file.name}`, 'success');
    };
    reader.readAsText(file);
}

function parseSRT(content) {
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split(/\n\s*\n/).filter(b => b.trim());
    const result = [];
    
    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length < 2) continue;
        
        let timeLineIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('-->')) {
                timeLineIndex = i;
                break;
            }
        }
        
        if (timeLineIndex === -1) continue;
        
        const timestamp = lines[timeLineIndex];
        const textLines = lines.slice(timeLineIndex + 1);
        
        if (textLines.length === 0) continue;
        
        let index = result.length + 1;
        const potentialIndex = parseInt(lines[timeLineIndex - 1], 10);
        if (!isNaN(potentialIndex) && timeLineIndex > 0) {
            index = potentialIndex;
        }
        
        result.push({
            index: index,
            timestamp: timestamp.trim(),
            text: textLines
        });
    }
    
    return result;
}

// ============================================
// UI Updates & Logging
// ============================================

function updateTranslateButton() {
    const hasApiKey = elements.apiKey.value.trim().length > 0 || elements.apiProvider.value === 'ollama' || elements.apiProvider.value === 'lm-studio';
    const hasFile = srtBlocks.length > 0;
    elements.translateBtn.disabled = !(hasApiKey && hasFile);
}

function updateTranslateButtonText() {
    const lang = elements.targetLanguage.value;
    elements.translateBtnText.textContent = `Translate to ${lang}`;
}

function updateTranslateButtonState(disabled) {
    elements.translateBtn.disabled = disabled;
    elements.translateBtnText.textContent = disabled ? 'Translating...' : 'Translate';
}

function log(message, type = 'info') {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry log-${type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    elements.logContainer.appendChild(logEntry);
    elements.logContainer.scrollTop = elements.logContainer.scrollHeight;
}

function updateProgress(completed, failed, total) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    elements.progressFill.style.width = percentage + '%';
    elements.progressPercent.textContent = percentage + '%';
    elements.completedChunks.textContent = completed;
    elements.failedChunks.textContent = failed;
    elements.totalChunks.textContent = total;
}

function createChunkCard(index, status = 'pending') {
    let card = document.getElementById(`chunk-${index}`);
    if (!card) {
        card = document.createElement('div');
        card.id = `chunk-${index}`;
        card.className = `chunk-card chunk-${status}`;
        card.innerHTML = `<span>Chunk ${index + 1}</span>`;
        elements.chunksGrid.appendChild(card);
    } else {
        card.className = `chunk-card chunk-${status}`;
    }
    return card;
}

function updateChunkStatus(index, status) {
    const card = document.getElementById(`chunk-${index}`);
    if (card) {
        card.className = `chunk-card chunk-${status}`;
    }
}

// ============================================
// Translation & API Handlers
// ============================================

function buildSystemPrompt(targetLanguage, customInstructions) {
    let prompt = `You are an expert subtitle translator. Translate the given subtitle blocks accurately and naturally to ${targetLanguage}.\n\n`;
    prompt += `Rules:\n`;
    prompt += `1. Keep the exact meaning and tone.\n`;
    prompt += `2. Keep texts concise to fit screen limits.\n`;
    prompt += `3. Each block is wrapped with [B0], [B1], etc. Translate ONLY the text inside/between markers and DO NOT remove or alter the markers.\n`;
    
    if (customInstructions.trim()) {
        prompt += `4. Additional Instructions: ${customInstructions}\n`;
    }
    
    prompt += `\nReturn only the translated content with matching markers.`;
    return prompt;
}

function extractTextWithMarkers(blocks) {
    let text = '';
    for (let i = 0; i < blocks.length; i++) {
        text += `[B${i}]\n${blocks[i].text.join('\n')}\n`;
    }
    text += `[B${blocks.length}]`;
    return text;
}

function parseMarkedTranslation(blocks, translatedText) {
    const result = [];
    
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const markerStart = `[B${i}]`;
        const markerEnd = `[B${i + 1}]`;

        const startIdx = translatedText.indexOf(markerStart);
        if (startIdx === -1) {
            result.push({
                index: block.index,
                timestamp: block.timestamp,
                text: [block.text.join(' ')]
            });
            continue;
        }

        const textStart = startIdx + markerStart.length;
        let textEnd;

        if (i === blocks.length - 1) {
            textEnd = translatedText.length;
        } else {
            const endIdx = translatedText.indexOf(markerEnd);
            textEnd = endIdx !== -1 ? endIdx : translatedText.length;
        }

        const blockText = translatedText.substring(textStart, textEnd).trim();

        result.push({
            index: block.index,
            timestamp: block.timestamp,
            text: [blockText || block.text.join(' ')]
        });
    }

    return result;
}

async function translateChunk(chunk, index, apiKey, model, targetLanguage, customInstructions, provider) {
    const markedText = extractTextWithMarkers(chunk);
    const systemPrompt = buildSystemPrompt(targetLanguage, customInstructions);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const preset = API_PRESETS[provider];
        let response;

        if (preset.type === 'gemini') {
            const endpoint = `${preset.endpoint}/${model}:generateContent?key=${apiKey.trim()}`;
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [
                            { text: systemPrompt },
                            { text: markedText }
                        ]
                    }],
                    generationConfig: { temperature: 0.3 }
                }),
                signal: controller.signal
            });
        } else if (preset.type === 'anthropic') {
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey.trim(),
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 4096,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: markedText }]
                }),
                signal: controller.signal
            });
        } else if (preset.type === 'openai-compatible') {
            let endpoint = preset.endpoint;
            if (provider === 'custom') {
                endpoint = elements.customApiEndpoint.value.trim();
            }
            
            if (!endpoint) {
                throw new Error('API Endpoint is missing');
            }

            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey.trim()}`;
            }

            if (provider === 'openrouter') {
                headers['HTTP-Referer'] = window.location.origin || 'https://github.com';
                headers['X-Title'] = 'SRT Translator';
            }

            response = await fetch(endpoint, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: markedText }
                    ],
                    temperature: 0.3,
                    max_tokens: 4096
                }),
                signal: controller.signal
            });
        }

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            let message = errorText;
            try {
                const errorObj = JSON.parse(errorText);
                if (errorObj.error) message = errorObj.error.message || errorText;
            } catch (e) {}
            throw new APIError(response.status, message, null);
        }

        const data = await response.json();
        let translatedText = '';

        if (preset.type === 'gemini') {
            translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else if (preset.type === 'anthropic') {
            translatedText = data.content?.[0]?.text || '';
        } else if (preset.type === 'openai-compatible') {
            translatedText = data.choices?.[0]?.message?.content || '';
        }

        if (!translatedText) {
            throw new Error('Empty translation response from API model');
        }

        const translatedBlocks = parseMarkedTranslation(chunk, translatedText);
        const isRTL = ['Arabic', 'Persian'].includes(targetLanguage);

        return translatedBlocks.map(block => {
            let text = block.text.join('\n');
            if (isRTL) {
                const rle = '\u202B';
                const pdf = '\u202C';
                text = text.replace(/(?<!\d),|,(?!\d)/g, '،');
                text = text.replace(/\?(?![0-9])/g, '؟');
                text = text.split('\n').map(line => /[\u0600-\u06FF]/.test(line) ? rle + line + pdf : line).join('\n');
            }
            return { index: block.index, timestamp: block.timestamp, text: text };
        });

    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') throw new APIError(408, `Request timeout for chunk ${index + 1}`, null);
        if (error instanceof APIError) throw error;
        throw new APIError(0, error.message, null);
    }
}

async function startTranslation() {
    const apiKey = elements.apiKey.value.trim();
    const provider = elements.apiProvider.value;
    const model = elements.customModel.value.trim() || API_PRESETS[provider].defaultModel;
    const targetLanguage = elements.targetLanguage.value;
    const customInstructions = elements.customInstructions.value.trim();
    const chunkSize = parseInt(elements.chunkSize.value) || 20;
    const maxParallel = parseInt(elements.parallelRequests.value) || 3;

    if (!apiKey && provider !== 'ollama' && provider !== 'lm-studio') {
        log('Please enter your API key', 'error');
        return;
    }

    if (srtBlocks.length === 0) {
        log('Please load an SRT file first', 'error');
        return;
    }

    updateTranslateButtonState(true);
    elements.progressCard.classList.remove('hidden');
    elements.chunksGrid.innerHTML = '';
    elements.logContainer.innerHTML = '';

    log(`Starting translation to ${targetLanguage}...`, 'info');
    log(`Provider: ${API_PRESETS[provider].name} | Model: ${model}`, 'info');

    const chunks = [];
    for (let i = 0; i < srtBlocks.length; i += chunkSize) {
        chunks.push(srtBlocks.slice(i, i + chunkSize));
    }

    log(`Total blocks: ${srtBlocks.length} divided into ${chunks.length} chunks.`, 'info');
    updateProgress(0, 0, chunks.length);

    chunks.forEach((_, idx) => createChunkCard(idx, 'pending'));

    const results = [];
    let completed = 0;
    let failed = 0;

    async function processChunk(chunk, index) {
        updateChunkStatus(index, 'processing');

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const result = await translateChunk(chunk, index, apiKey, model, targetLanguage, customInstructions, provider);
                results[index] = result.map(b => `${b.index}\n${b.timestamp}\n${b.text}`).join('\n\n');
                
                log(`✓ Chunk ${index + 1} completed`, 'success');
                updateChunkStatus(index, 'success');
                completed++;
                updateProgress(completed, failed, chunks.length);
                return;
            } catch (error) {
                console.error(`Attempt ${attempt + 1} for chunk ${index + 1} failed:`, error);
                if (attempt < MAX_RETRIES - 1) {
                    log(`⚠ Chunk ${index + 1} attempt ${attempt + 1} failed, retrying...`, 'warning');
                    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                } else {
                    log(`✗ Chunk ${index + 1} failed: ${error.message}`, 'error');
                    updateChunkStatus(index, 'error');
                    failed++;
                    updateProgress(completed, failed, chunks.length);
                    results[index] = chunk.map(b => `${b.index}\n${b.timestamp}\n${b.text.join('\n')}`).join('\n\n');
                }
            }
        }
    }

    let nextIndex = 0;
    const executing = new Set();

    async function worker() {
        while (nextIndex < chunks.length) {
            const currentIndex = nextIndex++;
            const currentChunk = chunks[currentIndex];
            const promise = processChunk(currentChunk, currentIndex).finally(() => {
                executing.delete(promise);
            });
            executing.add(promise);
            if (executing.size >= maxParallel) {
                await Promise.race(executing);
            }
        }
    }

    const workers = [];
    for (let w = 0; w < Math.min(maxParallel, chunks.length); w++) {
        workers.push(worker());
    }
    await Promise.all(workers);

    translatedResult = results.filter(Boolean).join('\n\n');

    const status = completed === chunks.length ? 'success' : 'error';
    log(`Translation process finished! ${completed} successful, ${failed} failed.`, status);

    elements.translateBtn.disabled = false;
    elements.translateBtnText.textContent = 'Translate';
    elements.downloadBtn.classList.remove('hidden');
}

// ============================================
// Download & Helper Utilities
// ============================================

function downloadResult() {
    const lang = elements.targetLanguage.value;
    const langCode = getLanguageCode(lang);
    const blob = new Blob([translatedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFileName ? originalFileName.replace('.srt', `_${langCode}.srt`) : `translated_${langCode}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    log(`Downloaded file: ${a.download}`, 'success');
}

function getLanguageCode(language) {
    const codes = {
        'Turkish': 'TR', 'Spanish': 'ES', 'French': 'FR', 'German': 'DE',
        'Italian': 'IT', 'Portuguese': 'PT', 'Russian': 'RU', 'Japanese': 'JA',
        'Korean': 'KO', 'Chinese (Simplified)': 'ZH-CN', 'Chinese (Traditional)': 'ZH-TW',
        'Arabic': 'AR', 'Persian': 'FA', 'Hindi': 'HI', 'Dutch': 'NL',
        'Polish': 'PL', 'Swedish': 'SV', 'Vietnamese': 'VI', 'Thai': 'TH',
        'Indonesian': 'ID', 'Greek': 'EL'
    };
    return codes[language] || 'TRANSLATED';
}

function optimizeTimings(blocks, minDurationMs = 1300) {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const times = parseTimestampRange(block.timestamp);
        if (!times) continue;
        const duration = times.end - times.start;
        if (duration < minDurationMs) {
            let nextStart = Infinity;
            if (i < blocks.length - 1) {
                const nextTimes = parseTimestampRange(blocks[i + 1].timestamp);
                if (nextTimes) nextStart = nextTimes.start;
            }
            const extendedEnd = times.start + minDurationMs;
            const maxAllowedEnd = nextStart - 50;
            const newEnd = Math.max(times.end, Math.min(extendedEnd, maxAllowedEnd));
            if (newEnd > times.end) {
                block.timestamp = `${formatMs(times.start)} --> ${formatMs(newEnd)}`;
            }
        }
    }
}

function mergeShortSubtitles(blocks, maxCombinedWords = 15, maxCombinedChars = 80, shortBlockDurationMs = 1200, shortWordCount = 4) {
    let i = 0;
    while (i < blocks.length - 1) {
        const currentBlock = blocks[i];
        const nextBlock = blocks[i + 1];
        const currentTimes = parseTimestampRange(currentBlock.timestamp);
        const nextTimes = parseTimestampRange(nextBlock.timestamp);
        
        if (!currentTimes || !nextTimes) { i++; continue; }
        
        const nextDuration = nextTimes.end - nextTimes.start;
        const nextTextJoined = nextBlock.text.join(' ');
        const nextWords = nextTextJoined.split(/\s+/).filter(Boolean);
        const isNextShort = nextDuration < shortBlockDurationMs || nextWords.length <= shortWordCount;
        
        const currentTextJoined = currentBlock.text.join(' ');
        const endsWithPunctuation = /[.!?]['"]*$/.test(currentTextJoined.trim());
        const startsWithCapital = /^[A-Z]/.test(nextTextJoined.trim());
        const isContinuingSentence = !endsWithPunctuation && !startsWithCapital;
        
        if (isNextShort && isContinuingSentence) {
            const combinedText = currentBlock.text.concat(nextBlock.text);
            const combinedTextJoined = combinedText.join(' ');
            const combinedWords = combinedTextJoined.split(/\s+/).filter(Boolean);
            
            if (combinedWords.length <= maxCombinedWords && combinedTextJoined.length <= maxCombinedChars) {
                currentBlock.text = [currentBlock.text.join(' ') + ' ' + nextBlock.text.join(' ')];
                currentBlock.timestamp = `${formatMs(currentTimes.start)} --> ${formatMs(nextTimes.end)}`;
                blocks.splice(i + 1, 1);
                continue;
            }
        }
        i++;
    }
    for (let idx = 0; idx < blocks.length; idx++) {
        blocks[idx].index = idx + 1;
    }
}

function parseTimestampRange(timestampStr) {
    if (!timestampStr) return null;
    const parts = timestampStr.split('-->');
    if (parts.length !== 2) return null;
    
    function parseTime(t) {
        const clean = t.trim().replace('.', ',');
        const subparts = clean.split(',');
        if (subparts.length !== 2) return 0;
        const hms = subparts[0].split(':');
        if (hms.length !== 3) return 0;
        const h = parseInt(hms[0]) || 0;
        const m = parseInt(hms[1]) || 0;
        const s = parseInt(hms[2]) || 0;
        const ms = parseInt(subparts[1]) || 0;
        return (h * 3600 + m * 60 + s) * 1000 + ms;
    }
    
    return { start: parseTime(parts[0]), end: parseTime(parts[1]) };
}

function formatMs(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const msec = ms % 1000;
    const pad = (num, size) => num.toString().padStart(size, '0');
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(msec, 3)}`;
}

// ============================================
// Initialize App
// ============================================
init();
