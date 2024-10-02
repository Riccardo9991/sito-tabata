let timer;
let isPaused = false;
let currentRound = 0;
let exercises = [];
let currentPhase = 'exercise';  // Può essere 'exercise' o 'rest'
let timeRemaining = 0;  // Variabile che gestisce il tempo rimanente per ciascuna fase

// Funzione per generare i campi di input in base al numero di round
function generateExerciseFields() {
    const rounds = document.getElementById('rounds').value;
    const exercisesDiv = document.getElementById('exercises');
    exercisesDiv.innerHTML = '';  // Reset dei campi

    for (let i = 1; i <= rounds; i++) {
        const label = document.createElement('label');
        label.textContent = `Nome esercizio ${i}:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `exercise${i}`;
        input.value = `Esercizio ${i}`;
        exercisesDiv.appendChild(label);
        exercisesDiv.appendChild(input);
    }
}

// Funzione per avviare il timer
function startTimer() {
    if (!isPaused) {
        currentRound = 0;
        currentPhase = 'exercise';
        exercises = Array.from({ length: document.getElementById('rounds').value }, (_, i) => document.getElementById(`exercise${i + 1}`).value);
    }
    isPaused = false;
    startInitialCountdown();
}

function startInitialCountdown() {
    let countdownTime = 10;
    document.getElementById('currentExercise').textContent = "Pronto a cominciare";
    speakText("Pronto a cominciare");

    const initialCountdownTimer = setInterval(() => {
        document.getElementById('time').textContent = `00:${countdownTime < 10 ? '0' : ''}${countdownTime}`;

        if (countdownTime === 0) {
            clearInterval(initialCountdownTimer);
            runTimer();  // Dopo il countdown inizia il timer del primo esercizio
        } else {
            countdownTime--;
        }
    }, 1000);
}

// Funzione che gestisce il ciclo del timer
function runTimer() {
    const exerciseTime = parseInt(document.getElementById('exerciseTime').value);
    const restTime = parseInt(document.getElementById('restTime').value);

    if (currentPhase === 'exercise') {
        timeRemaining = exerciseTime;
        document.getElementById('currentExercise').textContent = exercises[currentRound];
        speakText(exercises[currentRound]);
    } else if (currentPhase === 'rest') {
        timeRemaining = restTime;
        document.getElementById('currentExercise').textContent = "Riposo";
    }

    timer = setInterval(() => {
        if (timeRemaining === 0) {
            clearInterval(timer);
            playBeep(0);  // Beep finale
            if (currentPhase === 'exercise') {
                // Passaggio alla fase di riposo
                currentPhase = 'rest';
                runTimer();  // Esegui immediatamente il riposo
            } else if (currentPhase === 'rest') {
                // Fine del riposo, passaggio al prossimo round
                currentRound++;
                if (currentRound < exercises.length) {
                    currentPhase = 'exercise';
                    runTimer();  // Passaggio al prossimo esercizio
                } else {
                    document.getElementById('currentExercise').textContent = "Allenamento completato!";
                    speakText("Allenamento completato!");  // Annuncio della fine
                }
            }
        } else {
            document.getElementById('time').textContent = `00:${timeRemaining < 10 ? '0' : ''}${timeRemaining}`;
            if (currentPhase === 'exercise' && timeRemaining > 5) {
                playBeep(timeRemaining, true);  // Beep leggero
            } else {
                if (timeRemaining <= 5) playBeep(timeRemaining);  // Beep forte negli ultimi 5 secondi
            }
            timeRemaining--;
        }
    }, 1000);
}

// Funzione per mettere in pausa il timer
function pauseTimer() {
    isPaused = true;
    clearInterval(timer);
}

// Funzione per resettare il timer
function resetTimer() {
    clearInterval(timer);
    document.getElementById('time').textContent = "00:00";
    document.getElementById('currentExercise').textContent = "Pronto?";
    isPaused = false;
}

// Funzione per esportare l'allenamento in un file JSON
function exportTraining() {
    const training = {
        rounds: document.getElementById('rounds').value,
        exerciseTime: document.getElementById('exerciseTime').value,
        restTime: document.getElementById('restTime').value,
        exercises: Array.from({ length: document.getElementById('rounds').value }, (_, i) => document.getElementById(`exercise${i + 1}`).value)
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(training));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'allenamento_tabata.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Funzione per importare l'allenamento da un file JSON
function importTraining() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = JSON.parse(event.target.result);
            document.getElementById('rounds').value = data.rounds;
            document.getElementById('exerciseTime').value = data.exerciseTime;
            document.getElementById('restTime').value = data.restTime;
            generateExerciseFields();
            data.exercises.forEach((exercise, index) => {
                document.getElementById(`exercise${index + 1}`).value = exercise;
            });
        };
        reader.readAsText(file);
    }
}

// Funzione per riprodurre il suono del beep
function playBeep(timeRemaining, isSmallBeep = false) {
    const beepSound = document.getElementById('beep-sound');
    const finalBeepSound = document.getElementById('final-beep-sound');
    const smallBeepSound = document.getElementById('small-beep-sound');  // Nuovo beep leggero

    if (timeRemaining === 0) {
        finalBeepSound.play();
    } else if (isSmallBeep) {
        smallBeepSound.play();  // Beep leggero ogni secondo
    } else {
        beepSound.play();  // Beep forte negli ultimi 5 secondi
    }
}

function speakText(text) {
    // Verifica che il browser supporti l'API SpeechSynthesis
    if ('speechSynthesis' in window) {
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';  // Imposta la lingua su Italiano
        window.speechSynthesis.speak(utterance);
    } else {
        console.log('Il Text-to-Speech non è supportato su questo browser.');
    }
}