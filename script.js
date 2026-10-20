```javascript
/* ======================================
   LAZYFLOW AI
   Productivity tools and local AI
====================================== */

// Local AI settings.
// Ollama must be installed and running for this integration to work.
const AI_CONFIG = {
    enabled: true,
    endpoint: "http://localhost:11434/api/generate",
    model: "gemma3:1b"
};

const $ = (id) => document.getElementById(id);

const taskInput = $("taskInput");
const taskList = $("taskList");
const taskCount = $("taskCount");
const taskMessage = $("taskMessage");

const bigTaskInput = $("bigTaskInput");
const lazyOutput = $("lazyOutput");

const summaryInput = $("summaryInput");
const summaryOutput = $("summaryOutput");

const moodSelect = $("moodSelect");
const routineOutput = $("routineOutput");

let tasks = loadTasks();

/* ======================================
   SAFE HTML OUTPUT
====================================== */

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

/* ======================================
   TASK STORAGE
====================================== */

function loadTasks() {
    try {
        const saved = localStorage.getItem("lazyflow-tasks");
        const parsed = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((task) =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem("lazyflow-tasks", JSON.stringify(tasks));
        return true;
    } catch (error) {
        taskMessage.textContent =
            "Browser storage is unavailable. Your task may not be saved.";
        return false;
    }
}

function renderTasks() {
    taskList.replaceChildren();

    const completedCount = tasks.filter((task) => task.completed).length;

    taskCount.textContent =
        `${completedCount}/${tasks.length} completed`;

    if (tasks.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-task";
        empty.textContent = "No tasks yet. Add one small thing!";
        taskList.appendChild(empty);
        return;
    }

    tasks.forEach((task) => {
        const item = document.createElement("li");
        item.className = "task-item";

        if (task.completed) {
            item.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as ${task.completed ? "incomplete" : "complete"}`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "task-text";
        text.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-task";
        deleteButton.type = "button";
        deleteButton.textContent = "×";
        deleteButton.setAttribute("aria-label", `Delete ${task.text}`);

        deleteButton.addEventListener("click", () => {
            tasks = tasks.filter((current) => current.id !== task.id);
            saveTasks();
            renderTasks();
        });

        item.append(checkbox, text, deleteButton);
        taskList.appendChild(item);
    });
}

function addTask() {
    const text = taskInput.value.trim();

    if (!text) {
        taskMessage.textContent = "Enter a task first.";
        taskInput.focus();
        return;
    }

    if (text.length > 200) {
        taskMessage.textContent = "Please keep your task under 200 characters.";
        return;
    }

    tasks.push({
        id: createId(),
        text,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskMessage.textContent = "One more thing, out of your head! 🌿";
    taskInput.focus();
}

function createId() {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

$("addTaskButton").addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        addTask();
    }
});

/* ======================================
   OUTPUT HELPERS
====================================== */

function showMessage(element, message) {
    element.textContent = message;
}

function showList(element, heading, items, note = "") {
    const safeItems = items
        .map((item) => `<li>${escapeHTML(item)}</li>`)
        .join("");

    element.innerHTML = `
        <h4>${escapeHTML(heading)}</h4>
        <ol>${safeItems}</ol>
        ${note ? `<p class="result-note">${escapeHTML(note)}</p>` : ""}
    `;
}

function cleanAIResponse(text) {
    return String(text)
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();
}

/* ======================================
   LOCAL OPEN-WEIGHT AI
====================================== */

async function askLocalAI(prompt) {
    if (!AI_CONFIG.enabled) {
        throw new Error("Local AI is disabled.");
    }

    const response = await fetch(AI_CONFIG.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: AI_CONFIG.model,
            prompt,
            stream: false
        }),
        signal: AbortSignal.timeout(90000)
    });

    if (!response.ok) {
        throw new Error(`Local AI returned status ${response.status}.`);
    }

    const data = await response.json();

    if (!data.response || typeof data.response !== "string") {
        throw new Error("The local AI returned an empty response.");
    }

    return cleanAIResponse(data.response);
}

function splitAIList(text) {
    return text
        .split(/\n/)
        .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
        .filter(Boolean)
        .slice(0, 10);
}

async function getAIOrFallback(prompt, fallbackFunction) {
    try {
        const result = await askLocalAI(prompt);

        if (result) {
            return {
                text: result,
                source: "local AI"
            };
        }
    } catch (error) {
        console.info("Local AI unavailable; using browser-based fallback.");
    }

    return {
        text: fallbackFunction(),
        source: "basic browser mode"
    };
}

/* ======================================
   LAZY MODE: BREAK DOWN A TASK
====================================== */

function fallbackBreakdown(task) {
    return [
        `Write down exactly what "${task}" requires.`,
        "Gather the materials, notes, or information you need.",
        "Choose the smallest useful part and work on it for 10 minutes.",
        "Take a short break if you need one.",
        "Complete the next small part.",
        "Review what you have done and choose your next step."
    ];
}

async function breakDownTask() {
    const task = bigTaskInput.value.trim();

    if (!task) {
        showMessage(lazyOutput, "Enter a task you would like to simplify.");
        bigTaskInput.focus();
        return;
    }

    if (task.length > 1000) {
        showMessage(lazyOutput, "Please keep your task under 1,000 characters.");
        return;
    }

    $("breakTaskButton").disabled = true;
    showMessage(lazyOutput, "Making your task feel more manageable...");

    const result = await getAIOrFallback(
        `You are LazyFlow, a gentle productivity assistant.
Break this task into 4 to 6 short, practical steps.
Keep the steps specific, encouraging, and easy for a beginner.
Avoid guilt or pressure.
Return only a numbered list.

Task: ${task}`,
        () => fallbackBreakdown(task).map((step, index) => `${index + 1}. ${step}`).join("\n")
    );

    const items = splitAIList(result.text);

    showList(
        lazyOutput,
        "Your small-step plan 🌱",
        items.length ? items : fallbackBreakdown(task),
        `Created with ${result.source}. You can go at your own pace.`
    );

    $("breakTaskButton").disabled = false;
}

$("breakTaskButton").addEventListener("click", breakDownTask);

/* ======================================
   QUICK TEXT SUMMARIZER
====================================== */

// This fallback selects important-looking sentences.
// It is not a generative AI summary.
function fallbackSummary(text) {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    const cleaned = sentences
        .map((sentence) => sentence.trim())
        .filter(Boolean);

    if (cleaned.length <= 2) {
        return cleaned.join(" ");
    }

    const words = (text.toLowerCase().match(/\b[a-z0-9]+\b/g) || []);

    const stopWords = new Set([
        "the", "and", "for", "that", "this", "with", "from",
        "are", "was", "were", "have", "has", "had", "not",
        "but", "you", "your", "they", "their", "its", "into",
        "about", "can", "will", "would", "could", "should",
        "a", "an", "to", "of", "in", "on", "is", "it", "as",
        "at", "by", "be", "or", "if", "we", "our"
    ]);

    const frequency = {};

    words.forEach((word) => {
        if (!stopWords.has(word) && word.length > 2) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });

    const ranked = cleaned.map((sentence, index) => {
        const sentenceWords =
            sentence.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];

        const score = sentenceWords.reduce((total, word) => {
            return total + (frequency[word] || 0);
        }, 0) / Math.max(sentenceWords.length, 1);

        return { sentence, index, score };
    });

    const numberToKeep = Math.max(
        1,
        Math.ceil(cleaned.length * 0.35)
    );

    const selected = ranked
        .sort((a, b) => b.score - a.score)
        .slice(0, numberToKeep)
        .sort((a, b) => a.index - b.index);

    return selected.map((item) => item.sentence).join(" ");
}

async function summarizeText() {
    const text = summaryInput.value.trim();

    if (!text) {
        showMessage(summaryOutput, "Paste some text to summarize.");
        summaryInput.focus();
        return;
    }

    if (text.length > 12000) {
        showMessage(summaryOutput, "Please keep the text under 12,000 characters.");
        return;
    }

    $("summarizeButton").disabled = true;
    showMessage(summaryOutput, "Creating a shorter version...");

    const result = await getAIOrFallback(
        `Summarize the following text in simple language.
Keep the main facts and important ideas.
Use 3 to 5 concise bullet points.
Do not invent information.

TEXT:
${text}`,
        () => fallbackSummary(text)
    );

    summaryOutput.replaceChildren();

    const heading = document.createElement("h4");
    heading.textContent = "Your quick summary 📄";

    const paragraph = document.createElement("p");
    paragraph.textContent = result.text;

    const note = document.createElement("p");
    note.className = "result-note";
    note.textContent = `Created with ${result.source}. Check important facts against the original text.`;

    summaryOutput.append(heading, paragraph, note);

    $("summarizeButton").disabled = false;
}

$("summarizeButton").addEventListener("click", summarizeText);

/* ======================================
   WIND-DOWN PLANNER
====================================== */

const routines = {
    tired: [
        "Put away one or two things around you.",
        "Get a glass of water and prepare anything you need for tomorrow.",
        "Dim the lights and choose something relaxing.",
        "Give yourself permission to rest."
    ],

    stressed: [
        "Write down the things occupying your mind.",
        "Choose just one small priority for tomorrow.",
        "Step away from screens for a little while.",
        "Try a few comfortable, unhurried breaths.",
        "Let the rest wait until you have more energy."
    ],

    busy: [
        "Check tomorrow's schedule for anything essential.",
        "Spend five minutes tidying your workspace.",
        "Prepare your bag or materials for the next day.",
        "Choose a relaxing activity before bed."
    ],

    calm: [
        "Reflect on one thing that went well today.",
        "Prepare anything you need for tomorrow.",
        "Read, listen to gentle music, or enjoy a quiet hobby.",
        "Finish your evening without rushing."
    ]
};

async function createRoutine() {
    const mood = moodSelect.value;
    const routine = routines[mood] || routines.tired;

    $("routineButton").disabled = true;
    showMessage(routineOutput, "Putting together a gentle routine...");

    const result = await getAIOrFallback(
        `Create a gentle evening routine for someone who feels ${mood}.
Give 4 short, realistic steps.
Do not give medical advice or create a strict schedule.
Return only a numbered list.`,
        () => routine.map((step, index) => `${index + 1}. ${step}`).join("\n")
    );

    const items = splitAIList(result.text);

    showList(
        routineOutput,
        "Your gentle evening plan 🌙",
        items.length ? items : routine,
        `Created with ${result.source}. Adjust it to suit your needs.`
    );

    $("routineButton").disabled = false;
}

$("routineButton").addEventListener("click", createRoutine);

/* ======================================
   LOCAL AI CONNECTION STATUS
====================================== */

async function checkAIConnection() {
    const status = $("aiStatus");
    const dot = $("aiStatusDot");

    try {
        // Ollama's local tags endpoint indicates whether its server is reachable.
        const response = await fetch("http://localhost:11434/api/tags", {
            signal: AbortSignal.timeout(2500)
        });

        if (!response.ok) {
            throw new Error("Local server unavailable.");
        }

        const data = await response.json();
        const models = Array.isArray(data.models) ? data.models : [];

        const modelAvailable = models.some((model) =>
            model.name === AI_CONFIG.model ||
            model.name.startsWith(`${AI_CONFIG.model}:`)
        );

        if (modelAvailable) {
            status.textContent = `Local AI connected · ${AI_CONFIG.model}`;
            dot.style.background = "#64a875";
        } else {
            status.textContent =
                `Ollama connected · Install ${AI_CONFIG.model} to enable AI`;
            dot.style.background = "#d6a64d";
        }
    } catch (error) {
        status.textContent =
            "Basic mode active · Local AI is not connected";
        dot.style.background = "#b0b8ac";
    }
}

/* ======================================
   INITIALIZE WEBSITE
====================================== */

renderTasks();
checkAIConnection();

console.info("LazyFlow AI is ready.");
```
