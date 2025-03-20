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
        // Check for notes in the hit zone for the pressed lane
        const hitNote = this.notes.find(note => 
            note.active && 
            note.lane === lane && 
            note.isInHitZone()
        );

        if (hitNote) {
            hitNote.hit = true;
            hitNote.active = false;
            this.score.value += 100;
            this.score.display.textContent = this.score.value;
            // TODO: Play success sound
        } else {
            // TODO: Play error sound
        }
    }

    generateNote() {
        const lane = Math.floor(Math.random() * this.lanes);
        const note = new Note(lane, this.noteSpeed);
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
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(0, 550, this.canvas.width, 20);
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