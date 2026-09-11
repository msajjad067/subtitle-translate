# SRT Translator - نسخه OpenAI Compatible

## 🎉 خلاصه تغییرات

پروژه **Subtitle-Translator** کاملاً بهبود یافته است و اکنون از **OpenAI Compatible APIs** پشتیبانی می‌کند
### ✨ ویژگی های جدید:

```
✅ 8+ API Provider از قبل تنظیم شده
✅ پشتیبانی Custom Endpoints (OpenAI Compatible)
✅ محلی (Ollama, LM Studio) و Cloud (OpenAI, Claude, Groq, etc)
✅ بهتر Interface و Provider Information
✅ خودکار ذخیره تنظیمات
✅ بهتر Error Handling و Retry Logic
✅ RTL Language Support (Arabic, Persian)
```


---
شما می توانید از این آدرس استفاده کنید:
http://msajjad067.github.io/subtitle-translate
یا

## 🚀 شروع سریع (3 مرحله):

### **1️⃣ جایگزینی فایل ها:**

```bash
# پروژه قدیم خود را باز کنید
cd your-subtitle-translator

# فایل های جدید را قرار دهید:
cp app.js src/app.js
cp index.html index.html
cp styles.css src/styles.css
```

### **2️⃣ باز کردن در مرورگر:**

```
فایل index.html را با مرورگر باز کنید
یا Local Server استفاده کنید:
python -m http.server 8000
سپس http://localhost:8000 رو ببینید
```

### **3️⃣ انتخاب API:**

```
1. Dropdown "API Provider" رو ببینید
2. مورد موردنظرت انتخاب کن (مثال: Groq یا Ollama)
3. API Key وارد کن
4. Model تعیین کن
5. SRT فایل آپلود کن
6. Translate! ✨
```

---

## 🔌 API Providers دستیاب:

| Provider | بهترین برای | هزینه | نیاز |
|----------|----------|-------|------|
| **Groq** ⭐ | شروع سریع | رایگان | API Key |
| **Ollama** | محلی/خصوصی | رایگان | Local Install |
| **Claude** | کیفیت بالا | $ | API Key |
| **OpenAI** | GPT-4 | $$$ | API Key |
| **Gemini** | رایگان | رایگان | API Key |
| **LM Studio** | محلی GUI | رایگان | Local Install |
| **OpenRouter** | متنوع | Variable | API Key |
| **Custom** | هر API | Variable | Endpoint |

---

## 💡 توصیه ها:

### **برای شروع فوری:**
```
Provider: Groq (Fast Inference)
→ https://console.groq.com
→ API Key رو کپی کن
→ Done! ✅
```

### **برای خصوصی سازی:**
```
Provider: Ollama (Local)
→ https://ollama.ai دانلود کن
→ ollama pull mistral
→ ollama serve
→ Ready! 🎉
```

### **برای بهترین کیفیت:**
```
Provider: Anthropic Claude
→ https://console.anthropic.com
→ API Key رو کپی کن
→ Amazing! 🚀
```

---

## 🎯 Presets API:

### **Gemini (Google)**
- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models`
- Model: `gemini-1.5-flash`
- Docs: https://ai.google.dev

### **OpenAI (ChatGPT)**
- Endpoint: `https://api.openai.com/v1/chat/completions`
- Model: `gpt-4-turbo`
- Docs: https://platform.openai.com/docs

### **Groq**
- Endpoint: `https://api.groq.com/openai/v1/chat/completions`
- Model: `mixtral-8x7b-32768`
- Docs: https://console.groq.com

### **Ollama (Local)**
- Endpoint: `http://localhost:11434/v1/chat/completions`
- Model: `mistral`
- Docs: https://ollama.ai

### **LM Studio (Local)**
- Endpoint: `http://localhost:1234/v1/chat/completions`
- Model: `local-model`
- Docs: https://lmstudio.ai

### **Claude (Anthropic)**
- Endpoint: `https://api.anthropic.com/v1/messages`
- Model: `claude-3-5-sonnet-20241022`
- Docs: https://console.anthropic.com

### **OpenRouter**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `google/gemini-pro`
- Docs: https://openrouter.ai

---

## 🔑 API Key کجا دریافت کنیم؟

| سرویس | لینک | مراحل |
|------|------|-------|
| **Groq** | https://console.groq.com | Sign up → Create API Key |
| **OpenAI** | https://platform.openai.com/api-keys | Sign up → Create New Secret Key |
| **Claude** | https://console.anthropic.com | Sign up → API Keys |
| **Gemini** | https://ai.google.dev | Sign in → Get API Key |
| **OpenRouter** | https://openrouter.ai | Sign up → Create API Key |

---

## 📋 تنظیمات پیشنهادی:

### **برای سرعت:**
```
Chunk Size: 30
Parallel Requests: 10
Temperature: 0.3
Timeout: 30s
```

### **برای کیفیت:**
```
Chunk Size: 15
Parallel Requests: 2
Temperature: 0.3
Timeout: 30s
```

### **برای محلی (Ollama):**
```
Chunk Size: 20
Parallel Requests: 5
Model: mistral
Memory: 8GB+ (بهتر)
```

---

## 🔒 امنیت:

- ✅ **API Keys** فقط در localStorage ذخیره می شوند (client-side)
- ✅ **داده** به سرور منتقل نمی شود (جز خود API)
- ✅ **HTTPS** برای تمام ارتباطات
- ✅ **Open Source** - کد شفاف است

---

## ❓ سوالات رایج:

### Q: آیا داده ای به شما فرستاده می شود؟
**A:** نه! تمام ارتباطات مستقیماً با API Provider (مثل OpenAI، Groq) است.

### Q: آیا باید API Key تغییر دهم؟
**A:** نه! تنظیمات خودکار ذخیره می شوند. یک بار تنظیم کن، برای همیشه.

### Q: کدام Provider رایگان است؟
**A:** Groq، Gemini (محدودی)، Ollama (local) رایگان هستند.

### Q: آیا می‌تونم محلی کار کنم؟
**A:** بله! Ollama یا LM Studio استفاده کن.

### Q: اگر API fail شد چه؟
**A:** خودکار retry می‌شود (تا 3 بار) و لاگ دقیق می‌بینی.

---

## 🆘 مشکل گیری:

### مشکل: "Connection Refused"
```
✓ Ollama/LM Studio شروع شده؟
✓ URL صحیح است؟
✓ Firewall مانع نمی شود؟
```

### مشکل: "Invalid API Key"
```
✓ API Key را دوباره کپی کن
✓ فاصله های اضافی حذف کن
✓ Key منقضی نشده است؟
```

### مشکل: "Rate Limited"
```
✓ Parallel Requests کم کن (2-3)
✓ Chunk Size کم کن (10-15)
✓ کمی صبر کن
```

---

## 📊 کردیت و منابع:

```
✨ Original Project: https://github.com/AmiraliNotFound/better-ai-srt-translation
🚀 Enhanced with OpenAI Compatible APIs Support
📚 Multiple LLM Provider Integration
🔧 Customizable Endpoints
🌐 Support for Local & Cloud Models
```

```
✨ به‌زودی:
  - Batch Processing
  - Multiple Languages
  - Video Subtitle Support
  - TTS Integration
  - WebUI Dashboard
```

---

## 📝 نسخه:

```
Version: 2.0
Release: September 2026
Status: Stable ✅
License: [Original Project License]
```

---

## 🎉 شروع کن!

```bash
# 1. فایل ها جایگزین کن
cp app.js src/app.js
cp index.html index.html
cp styles.css src/styles.css

# 2. مرورگر باز کن
open index.html

# 3. API انتخاب کن
# Groq, Claude, OpenAI, Ollama, ...

# 4. ترجمه کن! ✨
```

---

**Happy Translating! 🚀**
