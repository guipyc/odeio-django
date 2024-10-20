document.addEventListener("DOMContentLoaded", () => {
  let timer;
  let isRunning = false;
  let timeLeft = 0;
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");
  const secondsInput = document.getElementById("seconds");
  const timerDisplay = document.getElementById("timer-display");
  const startStopButton = document.getElementById("start-stop");
  const resetButton = document.getElementById("reset");
  const setTimeButton = document.getElementById("set-time");
  const darkModeButton = document.getElementById("toggle-dark-mode");
  const musicSelect = document.getElementById("music");

  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  let audioBuffers = {};
  let sourceNode = null;

  // Função para carregar o áudio com retorno de Promise
  function loadAudio(url) {
      return fetch(url)
          .then(response => response.arrayBuffer())
          .then(data => audioContext.decodeAudioData(data))
          .catch(error => console.error('Erro ao carregar áudio:', error));
  }

  // Carregar todos os áudios ao abrir a página
  function preloadAllAudios() {
      for (let key in audioPaths) {
          loadAudio(audioPaths[key]).then(buffer => {
              audioBuffers[key] = buffer; // Armazenar o áudio carregado em audioBuffers
          });
      }
  }

  // Função para tocar o áudio
  function playAudio(audioKey) {
      if (!audioBuffers[audioKey]) return;

      // Cria um novo nó de fonte para tocar o áudio
      sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = audioBuffers[audioKey];
      sourceNode.connect(audioContext.destination);
      sourceNode.start(0);
  }

  function updateDisplay() {
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function startTimer() {
      if (isRunning) return;
      isRunning = true;
      startStopButton.textContent = "Stop";

      // Tocar a música selecionada ao iniciar o timer
      playSelectedMusic();

      timer = setInterval(() => {
          if (timeLeft > 0) {
              timeLeft--;
              updateDisplay();
          } else {
              clearInterval(timer);
              isRunning = false;
              startStopButton.textContent = "Start";
              alert("Tempo esgotado!");
          }
      }, 1000);
  }

  function stopTimer() {
      clearInterval(timer);
      isRunning = false;
      startStopButton.textContent = "Start";
      if (sourceNode) {
          sourceNode.stop(); // Para o áudio se estiver tocando
      }
  }

  function resetTimer() {
      stopTimer();
      timeLeft = 0;
      updateDisplay();
  }

  setTimeButton.addEventListener("click", () => {
      timeLeft = (parseInt(hoursInput.value) || 0) * 3600 + (parseInt(minutesInput.value) || 0) * 60 + (parseInt(secondsInput.value) || 0);
      updateDisplay();
  });

  startStopButton.addEventListener("click", () => {
      if (isRunning) {
          stopTimer();
      } else {
          // Verifica se houve uma interação do usuário para retomar o contexto de áudio
          if (audioContext.state === 'suspended') {
              audioContext.resume();
          }
          startTimer();
      }
  });

  resetButton.addEventListener("click", resetTimer);

  updateDisplay();

  function toggleDarkMode() {
      const body = document.body;
      const darkModeEnabled = body.classList.toggle('dark-mode');
      darkModeButton.textContent = darkModeEnabled ? "Modo Claro" : "Modo Escuro";
      localStorage.setItem('darkMode', darkModeEnabled ? 'enabled' : 'disabled');
  }

  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'enabled') {
      document.body.classList.add('dark-mode');
      darkModeButton.textContent = "Modo Claro";
  } else {
      darkModeButton.textContent = "Modo Escuro";
  }

  darkModeButton.addEventListener('click', toggleDarkMode);

  // Função que toca a música selecionada ao iniciar o timer
  function playSelectedMusic() {
      const selectedMusic = musicSelect.value;
      if (selectedMusic === "none") return;

      playAudio(selectedMusic); // Toca o áudio pré-carregado
  }

  // Pré-carregar os áudios ao carregar a página
  preloadAllAudios();
});
