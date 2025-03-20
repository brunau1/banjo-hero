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
        this.noteSpeed = 200; // pixels per second
        this.lastNoteTime = 0;
        this.noteInterval = 2000; // Time between notes in milliseconds

        // Speed variations
        this.speedLevels = [
            150,  // Slow
            200,  // Normal
            250,  // Fast
            300,  // Very Fast
            350   // Expert
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
        const lane = Math.floor(Math.random() * this.lanes);
        const speed = this.speedLevels[Math.floor(Math.random() * this.speedLevels.length)];
        const shape = this.noteShapes[Math.floor(Math.random() * this.noteShapes.length)];
        const note = new Note(lane, speed, shape);
        this.notes.push(note);
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
        // Draw hit zone background
        const hitZoneY = 550;
        const hitZoneHeight = 20;

        // Draw semi-transparent background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(0, hitZoneY, this.canvas.width, hitZoneHeight);

        // Draw hit zone borders
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, hitZoneY);
        this.ctx.lineTo(this.canvas.width, hitZoneY);
        this.ctx.moveTo(0, hitZoneY + hitZoneHeight);
        this.ctx.lineTo(this.canvas.width, hitZoneY + hitZoneHeight);
        this.ctx.stroke();

        // Draw key labels
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';

        for (let i = 0; i < this.lanes; i++) {
            const x = i * this.laneWidth + this.laneWidth / 2;
            this.ctx.fillText(this.keyLabels[i], x, hitZoneY + 15);
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