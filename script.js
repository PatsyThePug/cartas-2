// Card suits and values
const suits = ["♠", "♥", "♦", "♣"];
const values = [
  "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"
];

// Global variables
let currentCards = [];
let sortingLog = [];
let isAnimating = false;

// DOM elements
const cardCountInput = document.getElementById("cardCount");
const drawBtn = document.getElementById("drawBtn");
const sortBtn = document.getElementById("sortBtn");
const helpBtn = document.getElementById("helpBtn");
const cardContainer = document.getElementById("cardContainer");
const sortingLogContainer = document.getElementById("sortingLog");
const modal = document.getElementById("algorithmModal");
const closeBtn = document.getElementsByClassName("close")[0];

drawBtn.addEventListener("click", drawCards);
sortBtn.addEventListener("click", startSorting);
helpBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", outsideClick);

class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.numericValue = this.getNumericValue();
    this.color = suit === "♥" || suit === "♦" ? "red" : "black";
  }

  getNumericValue() {
    switch (this.value) {
      case "A": return 1;
      case "J": return 11;
      case "Q": return 12;
      case "K": return 13;
      default: return parseInt(this.value);
    }
  }

  toString() {
    return `${this.value}${this.suit}`;
  }
}

function generateRandomCards(count) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    const randomSuit = suits[Math.floor(Math.random() * suits.length)];
    const randomValue = values[Math.floor(Math.random() * values.length)];
    cards.push(new Card(randomSuit, randomValue));
  }
  return cards;
}

function createCardElement(card, index, additionalClass = "") {
  const cardElement = document.createElement("div");
  cardElement.className = `card ${card.color} ${additionalClass}`;
  cardElement.setAttribute("data-index", index);
  cardElement.innerHTML = `
    <div class="value">${card.value}</div>
    <div class="suit">${card.suit}</div>
    <div class="value-bottom">${card.value}</div>
  `;
  return cardElement;
}

function createLogCardElement(card, additionalClass = "") {
  const logCard = document.createElement("div");
  logCard.className = `log-card ${card.color} ${additionalClass}`;
  logCard.innerHTML = `
    <div>${card.value}</div>
    <div>${card.suit}</div>
  `;
  return logCard;
}

function renderCards(cards, highlightIndices = {}) {
  cardContainer.innerHTML = "";
  cards.forEach((card, index) => {
    let additionalClass = "";
    if (highlightIndices.comparing?.includes(index)) {
      additionalClass = "comparing";
    } else if (highlightIndices.selected?.includes(index)) {
      additionalClass = "selected";
    } else if (highlightIndices.sorted && index <= highlightIndices.sorted) {
      additionalClass = "sorted";
    }
    const cardElement = createCardElement(card, index, additionalClass);
    cardContainer.appendChild(cardElement);
  });
}

function drawCards() {
  const count = parseInt(cardCountInput.value);
  if (count < 2 || count > 20) {
    alert("Por favor, ingresa un número entre 2 y 20");
    return;
  }
  currentCards = generateRandomCards(count);
  sortingLog = [];
  renderCards(currentCards);
  updateSortingLog();
  sortBtn.disabled = false;
}

function addLogStep(stepNumber, cards, comparingIndices = [], selectedIndices = [], sortedIndex = -1) {
  const logStep = {
    step: stepNumber,
    cards: [...cards],
    comparing: [...comparingIndices],
    selected: [...selectedIndices],
    sorted: sortedIndex
  };
  sortingLog.push(logStep);
  updateSortingLog();
}

function updateSortingLog() {
  sortingLogContainer.innerHTML = "";
  sortingLog.forEach((logStep, index) => {
    const stepElement = document.createElement("div");
    stepElement.className = "log-step";
    const stepTitle = document.createElement("h4");
    stepTitle.textContent = `${index}`;
    stepElement.appendChild(stepTitle);
    const cardsContainer = document.createElement("div");
    cardsContainer.className = "log-cards";
    logStep.cards.forEach((card, cardIndex) => {
      let additionalClass = "";
      if (logStep.comparing.includes(cardIndex)) {
        additionalClass = "comparing";
      } else if (logStep.selected.includes(cardIndex)) {
        additionalClass = "selected";
      } else if (cardIndex <= logStep.sorted) {
        additionalClass = "sorted";
      }
      const logCard = createLogCardElement(card, additionalClass);
      cardsContainer.appendChild(logCard);
    });
    stepElement.appendChild(cardsContainer);
    sortingLogContainer.appendChild(stepElement);
  });
  sortingLogContainer.scrollTop = sortingLogContainer.scrollHeight;
}

async function selectionSort(cards) {
  const n = cards.length;
  let stepCount = 0;
  addLogStep(stepCount++, cards);
  for (let i = 0; i < n - 1; i++) {
    let minIndex = i;
    renderCards(cards, { selected: [i], sorted: i - 1 });
    await sleep(600);
    for (let j = i + 1; j < n; j++) {
      renderCards(cards, { comparing: [j, minIndex], selected: [i], sorted: i - 1 });
      await sleep(400);
      if (cards[j].numericValue < cards[minIndex].numericValue) {
        minIndex = j;
        renderCards(cards, { selected: [i, minIndex], sorted: i - 1 });
        await sleep(300);
      }
    }
    if (minIndex !== i) {
      renderCards(cards, { comparing: [i, minIndex], sorted: i - 1 });
      await sleep(500);
      [cards[i], cards[minIndex]] = [cards[minIndex], cards[i]];
      renderCards(cards, { sorted: i });
      await sleep(400);
    } else {
      renderCards(cards, { sorted: i });
      await sleep(300);
    }
    addLogStep(stepCount++, cards, [], [], i);
  }
  renderCards(cards, { sorted: n - 1 });
  addLogStep(stepCount++, cards, [], [], n - 1);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startSorting() {
  if (isAnimating) return;
  isAnimating = true;
  sortBtn.disabled = true;
  drawBtn.disabled = true;
  sortingLog = [];
  await selectionSort([...currentCards]);
  isAnimating = false;
  drawBtn.disabled = false;
}

function init() {
  drawCards();
}

document.addEventListener("DOMContentLoaded", init);

function openModal() {
  modal.style.display = "block";
}

function closeModal() {
  modal.style.display = "none";
}

function outsideClick(e) {
  if (e.target === modal) {
    modal.style.display = "none";
  }
}
