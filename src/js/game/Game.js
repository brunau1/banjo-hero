// src/js/game/Game.js
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.isRunning = false;
        this.lastTime = 0;

        this.canvas.width = 800;
        this.canvas.height = 600;

        this.lanes = 5;
        this.laneWidth = this.canvas.width / this.lanes;

        // Note management
        this.notes = [];
        this.lastNoteTime = 0;
        this.noteInterval = 400; // time between notes
        this.nextLaneIndex = 0; // For sequential lane generation

        // Increased speed variations
        this.speedLevels = [
            300,  // Slow
            400,  // Normal
            500,  // Fast
            600,  // Very Fast
            700   // Expert
        ];

        // Combo system
        this.currentCombo = 0;
        this.maxCombo = 0;

        // Note shapes
        this.noteShapes = ['rectangle', 'circle', 'triangle', 'star'];

        // Key labels
        this.keyLabels = ['A', 'S', 'D', 'F', 'G'];

        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        this.audioManager = new AudioManager();
        this.soundBank = new SoundBank();
        this.score = new Score();

        this.isRunning = true;
        requestAnimationFrame(this.gameLoop);

        this.setupControls();
    }

    setupControls() {
        const validKeys = ['a', 's', 'd', 'f', 'g'];

        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (validKeys.includes(key)) {
                const lane = validKeys.indexOf(key);
                this.handleKeyPress(lane);
            }
        });
    }

    handleKeyPress(lane) {
        const hitNote = this.notes.find(note =>
            note.active &&
            note.lane === lane &&
            note.isInHitZone()
        );

        if (hitNote) {
            hitNote.hit = true;
            hitNote.active = false;
            hitNote.createHitEffect();

            // Update combo and score
            this.currentCombo++;
            this.maxCombo = Math.max(this.maxCombo, this.currentCombo);

            // Score calculation with combo multiplier
            const comboMultiplier = Math.min(4, 1 + Math.floor(this.currentCombo / 10));
            this.score.value += 100 * comboMultiplier;
            this.score.display.textContent = this.score.value;
        } else {
            // Miss handling
            this.currentCombo = 0;
            // Find the closest note in the lane for miss effect
            const missedNote = this.notes.find(note =>
                note.active &&
                note.lane === lane
            );
            if (missedNote) {
                missedNote.createMissEffect();
            }
        }
    }

    generateNote() {
        // Generate notes in a more structured pattern
        const lane = this.nextLaneIndex;
        this.nextLaneIndex = (this.nextLaneIndex + 2) % this.lanes; // Skip one lane for better pattern

        const speed = this.speedLevels[Math.floor(Math.random() * this.speedLevels.length)];
        const note = new Note(lane, speed);
        this.notes.push(note);

        // Occasionally generate additional notes for chords
        if (Math.random() < 0.3) { // 30% chance for additional note
            const additionalLane = (lane + 2) % this.lanes;
            const additionalNote = new Note(additionalLane, speed);
            this.notes.push(additionalNote);
        }
    }

    update(deltaTime) {
        // Generate new notes
        const currentTime = performance.now();
        if (currentTime - this.lastNoteTime > this.noteInterval) {
            this.generateNote();
            this.lastNoteTime = currentTime;
        }

        // Update existing notes
        this.notes.forEach(note => {
            note.update(deltaTime);
        });

        // Remove notes that have gone off screen
        this.notes = this.notes.filter(note => note.y < this.canvas.height);
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw lane dividers
        this.drawLanes();

        // Draw hit zone
        this.drawHitZone();

        // Draw combo counter
        this.drawCombo();

        // Draw notes
        this.notes.forEach(note => {
            note.draw(this.ctx, this.laneWidth);
        });
    }

    drawLanes() {
        for (let i = 1; i < this.lanes; i++) {
            const x = i * this.laneWidth;
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#333';
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }

    drawHitZone() {
        const hitZoneY = 545;
        const hitZoneHeight = 10;

        // Draw semi-transparent background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // Reduced opacity
        this.ctx.fillRect(0, hitZoneY, this.canvas.width, hitZoneHeight);

        // Draw key labels with enhanced style
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // Semi-transparent white
        this.ctx.font = 'bold 14px Arial'; // Bold and slightly smaller
        this.ctx.textAlign = 'center';

        for (let i = 0; i < this.lanes; i++) {
            const x = i * this.laneWidth + this.laneWidth / 2;

            // Draw key background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.roundRect(x - 10, hitZoneY - 2, 20, 14, 4);
            this.ctx.fill();

            // Draw key label
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fillText(this.keyLabels[i], x, hitZoneY + 8);
        }
    }

    drawCombo() {
        if (this.currentCombo > 0) {
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Combo: ${this.currentCombo}`, this.canvas.width / 2, 50);
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop);
    }
}