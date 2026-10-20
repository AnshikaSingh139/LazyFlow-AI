# 🦥 LazyFlow AI — Do Less, Breathe More

### Your personal productivity assistant for slower days and lighter minds.

**LazyFlow AI** is a lightweight productivity web application designed to make everyday tasks easier. It helps users organize their to-do lists, break overwhelming tasks into smaller steps, summarize text, and create gentle evening routines.

Built with **HTML, CSS, and JavaScript**, LazyFlow AI can optionally connect to a locally running open-weight language model through Ollama, allowing users to experiment with AI-powered productivity without depending entirely on paid, hosted AI services.

> 🌿 **Our philosophy:** You don't have to do everything at once. Sometimes, making one small thing easier is enough.

---

## ✨ Features

### 📝 1. Smart To-Do Planner

Organize your thoughts and everyday responsibilities in one place.

* Add tasks with a simple input field.
* Mark tasks as completed.
* Delete tasks you no longer need.
* Track your task completion progress.
* Save tasks in browser local storage.

### ⚡ 2. Lazy Mode — Break It Down

Big tasks can feel overwhelming. Lazy Mode helps turn them into smaller, more manageable steps.

**Example:**

Instead of feeling overwhelmed by:

`Prepare for my physics examination`

You get a practical starting plan:

1. List the topics you need to revise.
2. Gather your notes and study materials.
3. Start with one manageable topic.
4. Review what you have learned.
5. Take a break and choose the next step.

When connected to a local AI model, the tool can generate task-specific steps. Otherwise, it uses a basic JavaScript fallback.

### 📄 3. Quick Text Summarizer

Make long text easier to process.

* Paste text into the summarizer.
* Generate a shorter version.
* Use the local AI integration for AI-generated summaries.
* Fall back to a basic sentence-selection algorithm when local AI is unavailable.

**Note:** The fallback is an extractive summarization method. It selects important-looking sentences rather than generating a genuinely AI-written summary.

### 🌙 4. Wind-Down Planner

Create a gentle evening routine based on how you feel.

Choose from four options:

* Tired and low-energy
* Stressed and overwhelmed
* Busy but doing okay
* Calm and relaxed

The application generates a simple routine intended to help you finish the day without unnecessary pressure.

A local AI model can personalize suggestions when available; predefined routines provide the fallback.

### 🤖 5. Optional Local AI Integration

LazyFlow AI supports local inference through [Ollama](https://ollama.com/) and a compatible open-weight language model.

The integration can provide:

* AI-generated task breakdowns.
* AI-generated text summaries.
* Personalized evening routine suggestions.

The website attempts to connect to the local model and falls back to browser-based functionality if the connection fails.

### 📱 6. Responsive Interface

The website includes:

* A clean, minimalist dashboard.
* A nature-inspired color palette.
* Rounded cards and simple navigation.
* Responsive layouts for desktop and mobile.
* Subtle animations and interactive elements.

---

## 🛠️ Tech Stack

| Technology            | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| HTML5                 | Website structure and content                      |
| CSS3                  | Styling, responsive layout, and animations         |
| JavaScript            | Interactivity, task management, and fallback logic |
| Ollama                | Optional local model runtime                       |
| Gemma 3 1B            | Example open-weight model for local AI features    |
| Browser Local Storage | Saving tasks locally in the browser                |

The frontend does not require a JavaScript framework or a separate application backend for its basic features.

---

## 🧠 How the Open-Weight AI Works

LazyFlow AI is designed around the idea that useful AI features should be adaptable to the user's needs.

Instead of requiring every task to be sent to a hosted AI service, the application can connect to a model running on the user's own computer.

### Architecture

```text
              USER
                |
                v
       +------------------+
       |  LazyFlow AI UI  |
       |   HTML + CSS     |
       +------------------+
                |
                v
       +------------------+
       |   JavaScript     |
       | Feature Logic    |
       +------------------+
                |
          +-----+------+
          |            |
          v            v
   Local AI Model   Fallback Logic
      (Ollama)       (JavaScript)
          |            |
          +-----+------+
                |
                v
       Display the Result
```

### AI-enabled workflow

1. The user enters a task, text, or preferred mood.
2. JavaScript creates a prompt for the selected feature.
3. The application attempts to send the prompt to the local Ollama API.
4. Ollama passes the request to the selected model.
5. The generated response appears in the interface.
6. If local AI is unavailable, the application uses its fallback logic.

The basic website remains useful without the model, but its fallback features should not be confused with generative AI.

---

## 🌍 Why Open Innovation Matters

The *Slow and Steady* challenge encourages developers to build useful experiences with open-source AI or open-weight models.

LazyFlow AI explores this idea through local inference and lightweight automation.

### 🔐 Privacy and user control

When the local model is connected and the request is processed locally, prompts can remain on the user's computer instead of being sent to a hosted AI provider.

This is especially useful when working with personal task descriptions or private notes.

Privacy depends on the actual setup. The website also loads Google Fonts externally in its current version, and browser requests, extensions, or other software may introduce additional network activity.

### 💰 Reduced dependence on paid APIs

The local AI integration does not require a paid, hosted AI API key.

However, local inference still uses computer resources, including memory, processing power, and electricity. Downloading models also requires storage and an internet connection unless the model is already available locally.

### 🔧 Customization

Developers can experiment with:

* Different compatible open-weight models.
* Custom prompts and instr
