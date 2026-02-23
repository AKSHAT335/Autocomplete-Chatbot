class TrieNode {
  constructor() {
    this.children = new Map();
    this.isEndOfWord = false;
    this.frequency = 0;
    this.word = "";
  }
}

class AutocompleteChatbotUI {
  constructor() {
    this.root = new TrieNode();
    this.totalWords = 0;
    this.totalInsertions = 0;
    this.initializeDefaultWords();
    this.bindElements();
    this.printWelcome();
  }

  toLowerCase(str) {
    return str.toLowerCase();
  }

  initializeDefaultWords() {
    const defaultWords = [
      ["hello", 10], ["help", 8], ["how", 7], ["house", 5], ["happy", 6],
      ["computer", 9], ["code", 12], ["coding", 8], ["cool", 4], ["cat", 3],
      ["chatbot", 15], ["chat", 10], ["change", 6], ["challenge", 7],
      ["programming", 11], ["program", 9], ["project", 8], ["practice", 5],
      ["python", 7], ["java", 6], ["javascript", 8], ["algorithm", 9],
      ["data", 10], ["structure", 8], ["database", 6], ["design", 7],
      ["development", 9], ["developer", 8], ["debug", 5], ["deploy", 4],
      ["machine", 6], ["learning", 8], ["artificial", 5], ["intelligence", 7],
      ["network", 6], ["security", 8], ["software", 10], ["system", 9],
      ["technology", 7], ["technical", 6], ["tutorial", 8], ["training", 5],
      ["dbms", 4],
    ];

    for (const [word, freq] of defaultWords) {
      this.insert(word, freq);
    }
  }

  insert(word, frequency = 1) {
    const lowerWord = this.toLowerCase(word);
    let current = this.root;
    for (const ch of lowerWord) {
      if (!current.children.has(ch)) {
        current.children.set(ch, new TrieNode());
      }
      current = current.children.get(ch);
    }
    if (current.isEndOfWord) {
      current.frequency += frequency;
    } else {
      current.isEndOfWord = true;
      current.frequency = frequency;
      current.word = lowerWord;
      this.totalWords += 1;
    }
    this.totalInsertions += frequency;
  }

  collectWords(node, words) {
    if (!node) return;
    if (node.isEndOfWord) {
      words.push([node.word, node.frequency]);
    }
    for (const [, child] of node.children) {
      this.collectWords(child, words);
    }
  }

  getSuggestions(prefix, maxSuggestions = 5) {
    const lowerPrefix = this.toLowerCase(prefix);
    let current = this.root;
    for (const ch of lowerPrefix) {
      if (!current.children.has(ch)) {
        return [];
      }
      current = current.children.get(ch);
    }

    const words = [];
    this.collectWords(current, words);

    words.sort((a, b) => {
      if (a[1] === b[1]) {
        return a[0].localeCompare(b[0]);
      }
      return b[1] - a[1];
    });

    return words.slice(0, maxSuggestions).map(([w, f]) => ({ word: w, frequency: f }));
  }

  search(word) {
    const lowerWord = this.toLowerCase(word);
    let current = this.root;
    for (const ch of lowerWord) {
      if (!current.children.has(ch)) return false;
      current = current.children.get(ch);
    }
    return current.isEndOfWord;
  }

  processInput(input) {
    if (!input.trim()) return;

    const lowerInput = this.toLowerCase(input.trim());
    if (lowerInput === "quit" || lowerInput === "exit") {
      this.appendConsole([
        "",
        'Thank you for using the Autocomplete Chatbot in the browser!',
        "You can close this tab or continue experimenting.",
      ], "highlight");
      return;
    }
    if (lowerInput === "stats") {
      this.displayStats();
      return;
    }
    if (lowerInput === "help") {
      this.showHelp();
      return;
    }

    const lines = [];
    lines.push(`--- Processing: "${input}" ---`);

    const suggestions = this.getSuggestions(input);
    if (suggestions.length) {
      lines.push("Autocomplete suggestions:");
      suggestions.forEach((s, idx) => {
        lines.push(`${idx + 1}. ${s.word}  (freq: ${s.frequency})`);
      });
      this.renderSuggestions(suggestions);
    } else {
      lines.push(`No suggestions found for "${input}"`);
      this.renderSuggestions([]);
    }

    if (this.search(input)) {
      lines.push(`Word "${input}" exists in our database.`);
      this.insert(input, 1);
      lines.push(`Increased frequency of "${input}"`);
    } else {
      lines.push(`Word "${input}" not found in database.`);
      lines.push(`Adding "${input}" to the database with frequency 1.`);
      this.insert(input, 1);
    }

    this.appendConsole(lines);
    this.updateStatsPanel();
  }

  displayStats() {
    const lines = [
      "",
      "=== Chatbot Statistics ===",
      "Database contains words starting with common prefixes.",
      "Words are ranked by frequency and alphabetical order.",
      "New words are automatically added when not found.",
    ];
    this.appendConsole(lines, "highlight");
    this.toggleStatsPanel(true);
  }

  showHelp() {
    const lines = [
      "",
      "=== Available Commands ===",
      "- Type any word or prefix to get suggestions",
      "- 'stats' - Display chatbot statistics",
      "- 'help' - Show this help menu",
      "- 'quit' or 'exit' - End the program (console equivalent)",
      "",
    ];
    this.appendConsole(lines, "highlight");
  }

  bindElements() {
    this.inputEl = document.getElementById("user-input");
    this.processBtn = document.getElementById("process-btn");
    this.helpBtn = document.getElementById("help-btn");
    this.statsBtn = document.getElementById("stats-btn");
    this.clearBtn = document.getElementById("clear-btn");
    this.suggestionsList = document.getElementById("suggestions-list");
    this.consoleOutput = document.getElementById("console-output");
    this.statsPanel = document.getElementById("stats-panel");
    this.statsContent = document.getElementById("stats-content");

    this.processBtn.addEventListener("click", () => {
      const value = this.inputEl.value;
      if (!value.trim()) {
        this.appendConsole(["Please enter a valid input."], "warning");
        return;
      }
      this.processInput(value);
    });

    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.processBtn.click();
      }
    });

    this.helpBtn.addEventListener("click", () => this.showHelp());
    this.statsBtn.addEventListener("click", () => {
      this.displayStats();
      this.toggleStatsPanel(!this.statsPanel.hidden);
    });

    this.clearBtn.addEventListener("click", () => {
      this.consoleOutput.textContent = "";
      this.renderSuggestions([]);
    });
  }

  printWelcome() {
    const lines = [
      "==============================================",
      "    AUTOCOMPLETE CHATBOT WITH TRIE & PQ",
      "==============================================",
      "Enter words or prefixes to get suggestions.",
      "Type 'quit' or 'exit' to simulate ending the program.",
      "Type 'stats' to see statistics.",
      "Type 'help' to see available commands.",
      "==============================================",
      "",
    ];
    this.appendConsole(lines, "highlight");
    this.updateStatsPanel();
  }

  appendConsole(lines, style = "normal") {
    const frag = document.createDocumentFragment();
    for (const line of lines) {
      const span = document.createElement("span");
      if (style === "highlight") span.classList.add("console-line-highlight");
      if (style === "warning") span.classList.add("console-line-warning");
      if (style === "error") span.classList.add("console-line-error");
      span.textContent = line;
      frag.appendChild(span);
      frag.appendChild(document.createTextNode("\n"));
    }
    this.consoleOutput.appendChild(frag);
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
  }

  renderSuggestions(suggestions) {
    this.suggestionsList.innerHTML = "";
    this.suggestionsList.classList.toggle("empty", suggestions.length === 0);

    if (!suggestions.length) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = "No suggestions yet. Type a word or prefix above.";
      this.suggestionsList.appendChild(li);
      return;
    }

    suggestions.forEach((s, idx) => {
      const li = document.createElement("li");
      li.className = "suggestion-item";

      const main = document.createElement("div");
      main.className = "suggestion-main";

      const wordSpan = document.createElement("span");
      wordSpan.className = "suggestion-word";
      wordSpan.textContent = s.word;

      const metaSpan = document.createElement("span");
      metaSpan.className = "suggestion-meta";
      metaSpan.textContent = `Frequency: ${s.frequency}`;

      main.appendChild(wordSpan);
      main.appendChild(metaSpan);

      const rank = document.createElement("span");
      rank.className = "suggestion-rank";
      rank.textContent = `#${idx + 1}`;

      li.appendChild(main);
      li.appendChild(rank);

      li.addEventListener("click", () => {
        this.inputEl.value = s.word;
        this.inputEl.focus();
      });

      this.suggestionsList.appendChild(li);
    });
  }

  toggleStatsPanel(forceVisible) {
    this.statsPanel.hidden = !forceVisible;
  }

  updateStatsPanel() {
    const statsHtml = `
      <div>Database contains words starting with common prefixes. Words are ranked by frequency and alphabetical order.</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total unique words</div>
          <div class="stat-value">${this.totalWords}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total insert operations</div>
          <div class="stat-value">${this.totalInsertions}</div>
        </div>
      </div>
    `;
    this.statsContent.innerHTML = statsHtml;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AutocompleteChatbotUI();
});

