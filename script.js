const state = {
  exercises: [],
  activeCategory: "all",
  solvedIds: new Set(),
};

const elements = {
  container: document.getElementById("exercises"),
  heroCount: document.getElementById("hero-count"),
  totalCount: document.getElementById("total-count"),
  solvedCount: document.getElementById("solved-count"),
  tabs: Array.from(document.querySelectorAll(".tab-btn")),
};

function exerciseTemplate(exercise) {
  const requirementBlock = exercise.requirementHtml || "";
  const sampleBlock = exercise.sampleHtml
    ? `<pre>${exercise.sampleHtml}</pre>`
    : "";
  const hintButton = exercise.hintHtml
    ? `<button class="hint-btn" type="button">💡 Hint</button>
    <div class="hint-text">${exercise.hintHtml}</div>`
    : "";

  return `<div class="exercise cat-${exercise.category} visible" data-cat="${exercise.category}" data-id="${exercise.id}">
  <div class="ex-header" role="button" tabindex="0" aria-expanded="false">
    <span class="ex-num">${exercise.id}</span>
    <span class="ex-title">${exercise.title}</span>
    <span class="diff ${exercise.difficultyClass}">${exercise.difficulty}</span>
    <svg class="chv" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </div>
  <div class="ex-body"><div class="ex-content">
    <h4>Cerință</h4>
    ${requirementBlock}
    ${sampleBlock}
    ${hintButton}
    <button class="sol-btn" type="button">✅ Soluție</button>
    <div class="sol-code">
      <pre>${exercise.solutionHtml}</pre>
    </div>
  </div></div>
</div>`;
}

function filteredExercises() {
  if (state.activeCategory === "all") return state.exercises;
  return state.exercises.filter(
    (exercise) => exercise.category === state.activeCategory
  );
}

function updateCounts() {
  elements.heroCount.textContent = state.exercises.length;
  elements.totalCount.textContent = filteredExercises().length;
  elements.solvedCount.textContent = state.solvedIds.size;
}

function renderExercises() {
  const visibleExercises = filteredExercises();

  if (!visibleExercises.length) {
    elements.container.innerHTML =
      '<p id="loading-state">Nu există exerciții pentru categoria selectată.</p>';
    updateCounts();
    return;
  }

  elements.container.innerHTML = visibleExercises.map(exerciseTemplate).join("");
  updateCounts();
}

function setActiveTab(category) {
  state.activeCategory = category;
  elements.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.cat === category);
  });
  renderExercises();
}

function toggleExercise(header) {
  const card = header.closest(".exercise");
  const isOpen = card.classList.toggle("open");
  header.setAttribute("aria-expanded", String(isOpen));
}

function toggleHint(button) {
  const hint = button.nextElementSibling;
  if (!hint || !hint.classList.contains("hint-text")) return;
  hint.classList.toggle("show");
  button.textContent = hint.classList.contains("show")
    ? "💡 Ascunde"
    : "💡 Hint";
}

function toggleSolution(button) {
  const solution = button.nextElementSibling;
  if (!solution || !solution.classList.contains("sol-code")) return;

  solution.classList.toggle("show");
  button.textContent = solution.classList.contains("show")
    ? "✅ Ascunde"
    : "✅ Soluție";

  if (solution.classList.contains("show")) {
    const card = button.closest(".exercise");
    state.solvedIds.add(card.dataset.id);
    updateCounts();
  }
}

async function loadExercises() {
  try {
    const response = await fetch("./exercises.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.exercises = await response.json();
    renderExercises();
  } catch (error) {
    elements.container.innerHTML =
      '<p id="loading-state">Nu am putut încărca exercises.json. Pe GitHub Pages va funcționa direct; local ai nevoie de un server static.</p>';
    console.error("Failed to load exercises.json", error);
  }
}

elements.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.cat));
});

elements.container.addEventListener("click", (event) => {
  const header = event.target.closest(".ex-header");
  if (header) {
    toggleExercise(header);
    return;
  }

  const hintButton = event.target.closest(".hint-btn");
  if (hintButton) {
    toggleHint(hintButton);
    return;
  }

  const solutionButton = event.target.closest(".sol-btn");
  if (solutionButton) {
    toggleSolution(solutionButton);
  }
});

elements.container.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const header = event.target.closest(".ex-header");
  if (!header) return;
  event.preventDefault();
  toggleExercise(header);
});

loadExercises();
