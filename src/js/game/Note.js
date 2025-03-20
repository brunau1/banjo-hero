// src/js/game/Note.js
class Note {
    constructor(lane, speed) {
        this.lane = lane;
        this.y = 0;
        this.speed = speed;
        this.width = 50;
        this.height = 20;
        this.active = true;
        this.hit = false;
    }

    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
    }

    draw(ctx, laneWidth) {
        if (!this.active) return;

        const x = this.lane * laneWidth + (laneWidth - this.width) / 2;
        ctx.fillStyle = this.hit ? '#4CAF50' : '#FFF';
        ctx.fillRect(x, this.y, this.width, this.height);
    }

    isInHitZone() {
        // Hit zone is at the bottom of the screen (550px)
        return this.y >= 530 && this.y <= 570;
    }
}