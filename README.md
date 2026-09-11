[🇬🇧 English](README.md) | [🇮🇷 فارسی](README.fa.md)

# SRT Translator - OpenAI Compatible Edition 

## 🎉 What's New

The **Subtitle-Translator** project has been significantly improved and now supports **OpenAI Compatible APIs**!

### ✨ New Features

- ✅ 8+ pre-configured API providers
- ✅ Custom endpoints for any OpenAI-compatible API
- ✅ Local providers (Ollama, LM Studio) and cloud providers (OpenAI, Claude, Groq, etc.)
- ✅ Improved interface and provider information
- ✅ Automatic settings persistence
- ✅ Better error handling and retry logic
- ✅ RTL language support (Arabic, Persian)

---

## 🚀 Quick Start (3 Steps)

### **1️⃣ Replace the Files**

```bash
# Open your existing subtitle translator project
cd your-subtitle-translator

# Replace the files with the new versions:
cp app-customizable-api.js src/app.js
cp index-customizable-api.html index.html
cp styles-updated.css src/styles.css
```

### **2️⃣ Open It in Your Browser**

You can open `index.html` directly in your browser.

Alternatively, use a local server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### **3️⃣ Select an API Provider**

1. Open the **API Provider** dropdown.
2. Select your preferred provider, such as Groq or Ollama.
3. Enter your API key if required.
4. Enter or select the model.
5. Upload your SRT file.
6. Click **Translate!** ✨

---

## 🔌 Available API Providers

| Provider | Best For | Cost | Requirement |
|---|---|---|---|
| **Groq** ⭐ | Fast start | Free | API Key |
| **Ollama** | Local / private use | Free | Local installation |
| **Claude** | High-quality translation | $ | API Key |
| **OpenAI** | GPT models | $$$ | API Key |
| **Gemini** | Free / low-cost usage | Free* | API Key |
| **LM Studio** | Local GUI-based models | Free | Local installation |
| **OpenRouter** | Access to many models | Variable | API Key |
| **Custom** | Any compatible API | Variable | Endpoint |

> **Note:** Provider pricing and free-tier availability can change over time.

---

## 💡 Recommendations

### **For a Quick Start**

```text
Provider: Groq (Fast Inference)

→ https://console.groq.com

→ Create/copy your API key

→ Done! ✅
```

### **For Private / Local Translation**

```text
Provider: Ollama (Local)

→ Install Ollama

→ ollama pull mistral

→ ollama serve

→ Ready! 🎉
```

### **For High-Quality Translation**

```text
Provider: Anthropic Claude

→ https://console.anthropic.com

→ Create/copy your API key

→ Start translating! 🚀
```

---

## 🎯 API Presets

### **Gemini (Google)**

- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models`
- **Model:** `gemini-1.5-flash`
- **Docs:** https://ai.google.dev

### **OpenAI**

- **Endpoint:** `https://api.openai.com/v1/chat/completions`
- **Model:** `gpt-4-turbo`
- **Docs:** https://platform.openai.com/docs

### **Groq**

- **Endpoint:** `https://api.groq.com/openai/v1/chat/completions`
- **Model:** `mixtral-8x7b-32768`
- **Docs:** https://console.groq.com

### **Ollama (Local)**

- **Endpoint:** `http://localhost:11434/v1/chat/completions`
- **Model:** `mistral`
- **Docs:** https://ollama.ai

### **LM Studio (Local)**

- **Endpoint:** `http://localhost:1234/v1/chat/completions`
- **Model:** `local-model`
- **Docs:** https://lmstudio.ai

### **Claude (Anthropic)**

- **Endpoint:** `https://api.anthropic.com/v1/messages`
- **Model:** `claude-3-5-sonnet-20241022`
- **Docs:** https://console.anthropic.com

### **OpenRouter**

- **Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
- **Model:** `google/gemini-pro`
- **Docs:** https://openrouter.ai

---

## 🔑 Where to Get an API Key

| Service | Website | Steps |
|---|---|---|
| **Groq** | https://console.groq.com | Sign up → Create API Key |
| **OpenAI** | https://platform.openai.com/api-keys | Sign up → Create New Secret Key |
| **Claude** | https://console.anthropic.com | Sign up → API Keys |
| **Gemini** | https://ai.google.dev | Sign in → Get API Key |
| **OpenRouter** | https://openrouter.ai | Sign up → Create API Key |

---

## 📋 Recommended Settings

### **For Speed**

```text
Chunk Size: 30
Parallel Requests: 10
Temperature: 0.3
Timeout: 30s
```

### **For Quality**

```text
Chunk Size: 15
Parallel Requests: 2
Temperature: 0.3
Timeout: 30s
```

### **For Local Ollama**

```text
Chunk Size: 20
Parallel Requests: 5
Model: mistral
Memory: 8GB+ recommended
```

---

## 🔒 Security

- ✅ **API keys** are stored only in `localStorage` (client-side).
- ✅ **Your data** is not sent to any intermediary server; it is sent directly to the selected API provider.
- ✅ **HTTPS** is recommended for cloud API connections.
- ✅ **Open Source** — the code is transparent and inspectable.

> **Important:** Storing API keys in a browser-based application means anyone with access to the browser profile or the application's client-side environment may potentially access those keys. For production or shared environments, consider using a backend proxy or another secure secret-management solution.

---

## ❓ FAQ

### Q: Is my data sent to you?

**A:** No. The application communicates directly with the API provider you configure, such as OpenAI or Groq.

### Q: Do I need to enter my API key every time?

**A:** No. The application saves your settings locally in the browser.

### Q: Which providers are free?

**A:** Ollama and LM Studio are free for local use. Some cloud providers, such as Groq and Gemini, may offer free tiers or limited free usage depending on their current policies.

### Q: Can I translate locally?

**A:** Yes. You can use Ollama or LM Studio with a locally running model.

### Q: What happens if an API request fails?

**A:** The application automatically retries failed requests (up to 3 attempts) and provides detailed logs to help diagnose the problem.

---

## 🆘 Troubleshooting

### Problem: `Connection Refused`

```text
✓ Is Ollama or LM Studio running?
✓ Is the endpoint URL correct?
✓ Is your firewall blocking the connection?
```

### Problem: `Invalid API Key`

```text
✓ Copy the API key again
✓ Remove any extra spaces
✓ Check that the key is still valid
```

### Problem: `Rate Limited`

```text
✓ Reduce Parallel Requests (try 2–3)
✓ Reduce Chunk Size (try 10–15)
✓ Wait a little before trying again
```

---

## 📊 Credits & Resources

```text
✨ Original Project:
https://github.com/AmiraliNotFound/better-ai-srt-translation

🚀 Enhanced with OpenAI Compatible API support
📚 Multiple LLM provider integration
🔧 Customizable endpoints
🌐 Support for local and cloud models
```

---

## 🎓 Further Reading

- `INSTALLATION_GUIDE_FA.md` — Installation guide
- `SETUP_GUIDE_FA.md` — Detailed setup and configuration
- `API_EXAMPLES.md` — Practical examples for different APIs

---

## 🚀 Roadmap

```text
✨ Coming Soon:

- Batch Processing
- Multiple Languages
- Video Subtitle Support
- TTS Integration
- WebUI Dashboard
```

---

## 📝 Version

```text
Version: 2.0
Release: September 2026
Status: Stable ✅
License: [Original Project License]
```

---

## 🎉 Get Started!

```bash
# 1. Replace the files
cp app-customizable-api.js src/app.js
cp index-customizable-api.html index.html
cp styles-updated.css src/styles.css

# 2. Open the application
open index.html

# 3. Select an API provider
# Groq, Claude, OpenAI, Ollama, ...

# 4. Translate! ✨
```

---

**Happy Translating! 🚀**

For more information, see `SETUP_GUIDE_FA.md`.

