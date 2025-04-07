document.addEventListener("DOMContentLoaded", () => {
  // DOM Element References
  const grid = document.getElementById("puzzle-grid");
  const timer = document.getElementById("timer");
  const resetBtn = document.getElementById("reset");
  const successMsg = document.getElementById("success-message");
  const bestTimeSpan = document.getElementById("best-time");

  // Game Configuration Constants
  const GRID_SIZE = 3;
  const PIECE_SIZE = 100;
  const IMAGE_URL = "https://picsum.photos/300";
  const TOTAL_PIECES = GRID_SIZE * GRID_SIZE;

  // Game State Variables
  let startTime = null;
  let timerInterval = null;
  let isGameActive = true;
  let bestTime = localStorage.getItem("bestTime") || Infinity;

  // Initialize game components
  initializeGame();

  function initializeGame() {
    createPuzzlePieces();
    shufflePieces();
    startTimer();
    updateBestTimeDisplay();
  }

  /**
   * Creates 3x3 puzzle pieces with proper positioning
   */
  function createPuzzlePieces() {
    grid.innerHTML = "";

    for (let i = 0; i < TOTAL_PIECES; i++) {
      const piece = document.createElement("div");
      piece.className = "puzzle-piece";
      piece.draggable = true;
      piece.dataset.correctPosition = i;

      // Calculate background position based on grid coordinates
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      piece.style.backgroundImage = `url("${IMAGE_URL}")`;
      piece.style.backgroundPosition = `-${col * PIECE_SIZE}px -${
        row * PIECE_SIZE
      }px`;

      // Add drag event handlers
      piece.addEventListener("dragstart", handleDragStart);
      piece.addEventListener("dragend", handleDragEnd);

      grid.appendChild(piece);
    }
  }

  /**
   * Shuffles puzzle pieces while maintaining 3x3 structure
   */
  function shufflePieces() {
    const pieces = Array.from(grid.children);
    while (pieces.length > 0) {
      const randomIndex = Math.floor(Math.random() * pieces.length);
      grid.appendChild(pieces.splice(randomIndex, 1)[0]);
    }
  }

  // Drag event handlers
  function handleDragStart(e) {
    if (!isGameActive || e.target.classList.contains("correct")) return;
    e.dataTransfer.setData("text/plain", e.target.dataset.correctPosition);
    e.target.classList.add("dragging");
  }

  function handleDragEnd(e) {
    e.target.classList.remove("dragging");
  }

  // Drag-over handler with boundary checks
  grid.addEventListener("dragover", (e) => {
    e.preventDefault();
    const draggingElement = document.querySelector(".dragging");
    const targetElement = e.target.closest(".puzzle-piece:not(.correct)");

    // Prevent operations outside the grid
    if (!targetElement || !grid.contains(targetElement)) return;

    if (targetElement && targetElement !== draggingElement) {
      const temp = document.createElement("div");
      try {
        // Swap elements with temporary placeholder
        grid.insertBefore(temp, targetElement);
        grid.insertBefore(targetElement, draggingElement);
        grid.insertBefore(draggingElement, temp);
        grid.removeChild(temp);
      } catch (error) {
        // Cleanup temporary elements on error
        if (temp.parentNode) temp.parentNode.removeChild(temp);
      }
    }
  });

  // Cleanup temporary elements when leaving grid
  grid.addEventListener("dragleave", (e) => {
    if (!grid.contains(e.relatedTarget)) {
      const tempElements = grid.querySelectorAll("div:not(.puzzle-piece)");
      tempElements.forEach((temp) => temp.parentNode?.removeChild(temp));
    }
  });

  // Drop handler with position validation
  grid.addEventListener("drop", (e) => {
    e.preventDefault();
    const correctPosition = e.dataTransfer.getData("text/plain");
    const draggedPiece = document.querySelector(
      `[data-correct-position="${correctPosition}"]`
    );
    const currentPosition = Array.from(grid.children).indexOf(draggedPiece);

    if (currentPosition == correctPosition) {
      draggedPiece.classList.add("correct");
      checkPuzzleCompletion();
    }
  });

  /**
   * Checks if all pieces are in correct positions
   */
  function checkPuzzleCompletion() {
    const allCorrect = Array.from(grid.children).every((piece) => {
      const position = Array.from(grid.children).indexOf(piece);
      return position == piece.dataset.correctPosition;
    });

    if (allCorrect) {
      isGameActive = false;
      clearInterval(timerInterval);
      successMsg.style.display = "block";
      updateBestTime();
    }
  }

  // Timer management functions
  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      timer.textContent = elapsed;
    }, 1000);
  }

  // Best time handling
  function updateBestTime() {
    const currentTime = parseInt(timer.textContent);
    if (currentTime < bestTime) {
      bestTime = currentTime;
      localStorage.setItem("bestTime", bestTime);
      updateBestTimeDisplay();
    }
  }

  function updateBestTimeDisplay() {
    bestTimeSpan.textContent = bestTime !== Infinity ? bestTime : "--";
  }

  // Reset button functionality
  resetBtn.addEventListener("click", () => {
    isGameActive = true;
    clearInterval(timerInterval);
    initializeGame();
    successMsg.style.display = "none";
    Array.from(grid.children).forEach((piece) =>
      piece.classList.remove("correct")
    );
  });
});
