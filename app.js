// ============================================
// SRT Translator - App Logic (OpenAI Compatible Edition)
// ============================================

const DEFAULT_MODEL_GEMINI = 'gemini-3.1-flash-lite';
const DEFAULT_MODEL_OPENROUTER = 'google/gemini-3.1-flash-lite';
const DEFAULT_MODEL_OPENAI = 'gpt-4-turbo';
const DEFAULT_MODEL_CUSTOM = 'gpt-3.5-turbo'; // Generic fallback
const DEFAULT_PARALLEL = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

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

// Custom API Error class
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
    
    // Show custom endpoint input for custom provider
    if (provider === 'custom') {
        elements.customApiEndpointRow.classList.remove('hidden');
    } else {
        elements.customApiEndpointRow.classList.add('hidden');
        elements.customApiEndpoint.value = preset.endpoint;
    }
    
    // Update provider info
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
    // File upload
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    elements.dropZone.addEventListener('dragover', handleDragOver);
    elements.dropZone.addEventListener('dragleave', handleDragLeave);
    elements.dropZone.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);

    // Settings changes
    elements.apiKey.addEventListener('input', () => {
        saveSettings();
        updateTranslateButton();
    });
    elements.apiProvider.addEventListener('change', () => {
        saveSettings();
        updateProviderUI();
        updateTranslateButton();
    });
    elements.customApiEndpoint.addEventListener('change', saveSettings);
    elements.customModel.addEventListener('change', saveSettings);
    elements.targetLanguage.addEventListener('change', () => {
        saveSettings();
        updateTranslateButtonText();
    });
    elements.chunkSize.addEventListener('change', saveSettings);
    elements.parallelRequests.addEventListener('change', saveSettings);
    elements.customInstructions.addEventListener('change', saveSettings);
    elements.optimizeTimings.addEventListener('change', () => {
        saveSettings();
        reprocessLoadedFile();
    });
    elements.mergeSubtitles.addEventListener('change', () => {
        saveSettings();
        reprocessLoadedFile();
    });

    // Actions
    elements.translateBtn.addEventListener('click', startTranslation);
    elements.downloadBtn.addEventListener('click', downloadResult);

    // Initial UI state
    updateTranslateButton();
    updateTranslateButtonText();
}

function handleDragOver(e) {
    e.preventDefault();
    elements.dropZone.classList.add('dragover');
}

function handleDragLeave() {
    elements.dropZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.srt')) {
        processFile(file);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) processFile(file);
}

// ============================================
// File Processing
// ============================================

function reprocessLoadedFile() {
    if (srtContent) {
        srtBlocks = parseSRT(srtContent);
        if (elements.mergeSubtitles.checked) {
            mergeShortSubtitles(srtBlocks);
        }
        if (elements.optimizeTimings.checked) {
            optimizeTimings(srtBlocks);
        }
        elements.dropText.textContent = `Loaded: ${srtBlocks.length} subtitle blocks`;
    }
}

function processFile(file) {
    originalFileName = file.name;
    const reader = new FileReader();
    
    reader.onload = (e) => {
        srtContent = e.target.result;
        srtBlocks = parseSRT(srtContent);
        
        if (elements.mergeSubtitles.checked) {
            mergeShortSubtitles(srtBlocks);
        }
        if (elements.optimizeTimings.checked) {
            optimizeTimings(srtBlocks);
        }
        
        elements.fileName.textContent = `✓ ${file.name}`;
        elements.fileName.classList.remove('hidden');
        elements.dropText.classList.add('hidden');
        updateTranslateButton();
        log(`Loaded ${srtBlocks.length} subtitle blocks from ${file.name}`, 'success');
    };
    
    reader.readAsText(file);
}

function parseSRT(content) {
    const blocks = content.split('\n\n').filter(b => b.trim());
    const result = [];
    
    for (const block of blocks) {
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length < 3) continue;
        
        const index = parseInt(lines[0], 10);
        if (isNaN(index)) continue;
        
        const timestamp = lines[1];
        if (!timestamp.includes('-->')) continue;
        
        const text = lines.slice(2);
        
        result.push({
            index: index,
            timestamp: timestamp,
            text: text
        });
    }
    
    return result;
}

// ============================================
// UI Updates
// ============================================

function updateTranslateButton() {
    const hasApiKey = elements.apiKey.value.trim().length > 0;
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
    const percentage = Math.round((completed / total) * 100);
    elements.progressFill.style.width = percentage + '%';
    elements.progressPercent.textContent = percentage + '%';
    elements.completedChunks.textContent = completed;
    elements.failedChunks.textContent = failed;
    elements.totalChunks.textContent = total;
}

function createChunkCard(index, status = 'pending') {
    const card = document.createElement('div');
    card.id = `chunk-${index}`;
    card.className = `chunk-card chunk-${status}`;
    card.innerHTML = `<span>Chunk ${index + 1}</span>`;
    elements.chunksGrid.appendChild(card);
    return card;
}

function updateChunkStatus(index, status) {
    const card = document.getElementById(`chunk-${index}`);
    if (card) {
        card.className = `chunk-card chunk-${status}`;
    }
}

// ============================================
// Translation
// ============================================

function buildSystemPrompt(targetLanguage, customInstructions) {
    let prompt = `You are an expert translator. Your task is to translate the following subtitles accurately and naturally to ${targetLanguage}.\n\n`;
    prompt += `Important guidelines:\n`;
    prompt += `1. Maintain the original meaning and tone\n`;
    prompt += `2. Keep the text concise (subtitle length constraint)\n`;
    prompt += `3. Preserve any formatting or special characters\n`;
    prompt += `4. Each subtitle block is marked with [Bn] and [Bn+1] markers\n`;
    prompt += `5. Translate only the text between markers, keep markers untouched\n`;
    
    if (customInstructions.trim()) {
        prompt += `\n6. Additional instructions: ${customInstructions}\n`;
    }
    
    prompt += `\nProvide ONLY the translated text with the same markers.`;
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
            text: [blockText]
        });
    }

    return result;
}

async function translateChunk(chunk, index, apiKey, model, targetLanguage, customInstructions, provider) {
    const markedText = extractTextWithMarkers(chunk);
    const systemPrompt = buildSystemPrompt(targetLanguage, customInstructions);

    console.log(`[Chunk ${index + 1}] Sending API request...`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        console.log(`[Chunk ${index + 1}] TIMEOUT - aborting request`);
        controller.abort();
    }, REQUEST_TIMEOUT_MS);

    try {
        const preset = API_PRESETS[provider];
        let response;

        if (preset.type === 'gemini') {
            // Gemini API
            const endpoint = preset.endpoint.endsWith(':generateContent') 
                ? preset.endpoint 
                : `${preset.endpoint}/${model}:generateContent?key=${apiKey.trim()}`;
            
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: markedText }]
                    }],
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.3
                    }
                }),
                signal: controller.signal
            });
        } else if (preset.type === 'anthropic') {
            // Anthropic Claude API
            const endpoint = 'https://api.anthropic.com/v1/messages';
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey.trim(),
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: 2048,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: markedText }
                    ]
                }),
                signal: controller.signal
            });
        } else if (preset.type === 'openai-compatible') {
            // OpenAI Compatible API
            const endpoint = provider === 'custom' 
                ? elements.customApiEndpoint.value.trim() 
                : preset.endpoint;
            
            if (!endpoint) {
                throw new Error('Custom API endpoint is required');
            }

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`
            };

            // Optional headers for OpenRouter
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
                    max_tokens: 2048
                }),
                signal: controller.signal
            });
        }

        console.log(`[Chunk ${index + 1}] Response received, status: ${response.status}`);
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            let details = null;
            let message = errorText;
            try {
                const errorObj = JSON.parse(errorText);
                if (errorObj.error) {
                    message = errorObj.error.message || errorText;
                    details = errorObj.error.details || null;
                }
            } catch (e) {
                // not JSON
            }
            throw new APIError(response.status, message, details);
        }

        const data = await response.json();
        console.log(`[Chunk ${index + 1}] Parsed response...`);

        let translatedText;
        
        if (preset.type === 'gemini') {
            if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                throw new Error('Invalid or empty response structure from Gemini API');
            }
            translatedText = data.candidates[0].content.parts[0].text;
        } else if (preset.type === 'anthropic') {
            if (!data.content || data.content.length === 0 || !data.content[0].text) {
                throw new Error('Invalid or empty response structure from Anthropic API');
            }
            translatedText = data.content[0].text;
        } else if (preset.type === 'openai-compatible') {
            if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('Invalid or empty response structure from API');
            }
            translatedText = data.choices[0].message.content;
        }

        const translatedBlocks = parseMarkedTranslation(chunk, translatedText);

        const isRTL = ['Arabic', 'Persian'].includes(targetLanguage);
        return translatedBlocks.map(block => {
            let text = block.text.join('\n');
            if (isRTL) {
                const rlm = '\u200F';
                const rle = '\u202B';
                const pdf = '\u202C';

                text = text.replace(/(?<!\d),|,(?!\d)/g, '،');
                text = text.replace(/\?(?![0-9])/g, '؟');

                const lines = text.split('\n');
                text = lines.map(line => {
                    if (/[\u0600-\u06FF]/.test(line)) {
                        return rle + line + pdf;
                    }
                    return line;
                }).join('\n');
            }

            return {
                index: block.index,
                timestamp: block.timestamp,
                text: text
            };
        });

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new APIError(408, `Request timeout for chunk ${index + 1}`, null);
        }
        
        if (error instanceof APIError) {
            throw error;
        }
        
        throw new APIError(0, error.message, null);
    }
}

async function startTranslation() {
    const apiKey = elements.apiKey.value.trim();
    const model = elements.customModel.value.trim() || API_PRESETS[elements.apiProvider.value].defaultModel;
    const targetLanguage = elements.targetLanguage.value;
    const customInstructions = elements.customInstructions.value.trim();
    const chunkSize = parseInt(elements.chunkSize.value);
    const maxParallel = parseInt(elements.parallelRequests.value);
    const provider = elements.apiProvider.value;

    if (!apiKey) {
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
    log(`Provider: ${API_PRESETS[provider].name}`, 'info');
    log(`Model: ${model}`, 'info');
    log(`Chunk size: ${chunkSize}, Parallel requests: ${maxParallel}`, 'info');

    const chunks = [];
    for (let i = 0; i < srtBlocks.length; i += chunkSize) {
        chunks.push(srtBlocks.slice(i, i + chunkSize));
    }

    log(`Processing ${chunks.length} chunks`, 'info');
    updateProgress(0, 0, chunks.length);

    const results = [];
    let completed = 0;
    let failed = 0;

    async function processChunk(chunk, index) {
        createChunkCard(index, 'processing');
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
                console.error(`Attempt ${attempt + 1} failed:`, error);
                
                if (attempt < MAX_RETRIES - 1) {
                    log(`⚠ Chunk ${index + 1} failed, retrying... (${error.message})`, 'warning');
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                } else {
                    log(`✗ Chunk ${index + 1} failed after ${MAX_RETRIES} attempts: ${error.message}`, 'error');
                    updateChunkStatus(index, 'error');
                    failed++;
                    updateProgress(completed, failed, chunks.length);
                    results[index] = chunk.map(b => `${b.index}\n${b.timestamp}\n${b.text.join('\n')}`).join('\n\n');
                }
            }
        }
    }

    const processing = new Set();
    let nextIndex = 0;

    async function processNext() {
        while (nextIndex < chunks.length) {
            const index = nextIndex++;
            const chunk = chunks[index];

            const promise = processChunk(chunk, index).finally(() => {
                processing.delete(promise);
            });
            processing.add(promise);

            if (processing.size >= maxParallel) {
                await Promise.race(processing);
            }
        }
        await Promise.all(processing);
    }

    await processNext();

    translatedResult = results.join('\n\n');

    const status = completed === chunks.length ? 'success' : 'error';
    log(`Translation complete! ${completed} successful, ${failed} failed`, status);

    elements.translateBtn.disabled = false;
    elements.translateBtnText.textContent = 'Translate';
    elements.downloadBtn.classList.remove('hidden');
}

// ============================================
// Download
// ============================================

function downloadResult() {
    const lang = elements.targetLanguage.value;
    const langCode = getLanguageCode(lang);

    const blob = new Blob([translatedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFileName.replace('.srt', `_${langCode}.srt`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    log(`Downloaded: ${a.download}`, 'success');
}

function getLanguageCode(language) {
    const codes = {
        'Turkish': 'TR',
        'Spanish': 'ES',
        'French': 'FR',
        'German': 'DE',
        'Italian': 'IT',
        'Portuguese': 'PT',
        'Russian': 'RU',
        'Japanese': 'JA',
        'Korean': 'KO',
        'Chinese (Simplified)': 'ZH-CN',
        'Chinese (Traditional)': 'ZH-TW',
        'Arabic': 'AR',
        'Persian': 'FA',
        'Hindi': 'HI',
        'Dutch': 'NL',
        'Polish': 'PL',
        'Swedish': 'SV',
        'Vietnamese': 'VI',
        'Thai': 'TH',
        'Indonesian': 'ID',
        'Greek': 'EL'
    };
    return codes[language] || 'TRANSLATED';
}

// ============================================
// Timing Optimization
// ============================================

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
                if (nextTimes) {
                    nextStart = nextTimes.start;
                }
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
        
        if (!currentTimes || !nextTimes) {
            i++;
            continue;
        }
        
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
                const joinedText = currentBlock.text.join(' ') + ' ' + nextBlock.text.join(' ');
                currentBlock.text = [joinedText];
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
    
    return {
        start: parseTime(parts[0]),
        end: parseTime(parts[1])
    };
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
