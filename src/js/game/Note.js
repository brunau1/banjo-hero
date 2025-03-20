// src/js/game/Note.js
class Note {
    constructor(lane, speed) {
        this.lane = lane;
        this.y = 0;
        this.speed = speed;
        this.width = 50;
        this.height = this.generateHeight();
        this.active = true;
        this.hit = false;
        this.hitEffect = null;
        this.missEffect = null;
    }

    generateHeight() {
        // Generate heights between 20 and 40 pixels
        return Math.floor(Math.random() * 21) + 20;
    }

    update(deltaTime) {
        this.y += this.speed * (deltaTime / 1000);
        
        // Update hit effect
        if (this.hitEffect) {
            this.hitEffect.lifetime -= deltaTime;
            if (this.hitEffect.lifetime <= 0) {
                this.hitEffect = null;
            }
        }

        // Update miss effect
        if (this.missEffect) {
            this.missEffect.lifetime -= deltaTime;
            if (this.missEffect.lifetime <= 0) {
                this.missEffect = null;
            }
        }
    }

    draw(ctx, laneWidth) {
        if (!this.active) return;

        const x = this.lane * laneWidth + (laneWidth - this.width) / 2;
        
        ctx.save();
        
        // Draw the note rectangle
        ctx.fillStyle = this.hit ? '#4CAF50' : '#FFF';
        ctx.fillRect(x, this.y, this.width, this.height);

        // Draw hit effect
        if (this.hitEffect) {
            ctx.globalAlpha = this.hitEffect.lifetime / 500;
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x - 5, this.y - 5, this.width + 10, this.height + 10);
        }

        // Draw miss effect
        if (this.missEffect) {
            ctx.globalAlpha = this.missEffect.lifetime / 500;
            ctx.fillStyle = '#FF5252';
            ctx.fillRect(x - 5, this.y - 5, this.width + 10, this.height + 10);
        }

        ctx.restore();
    }

    isInHitZone() {
        // The hit zone is between 530 and 570 pixels from the top
        const hitZoneTop = 530;
        const hitZoneBottom = 570;
        
        // Check if any part of the note overlaps with the hit zone
        const noteTop = this.y;
        const noteBottom = this.y + this.height;

        // Note is in hit zone if:
        // 1. Note top is within hit zone, OR
        // 2. Note bottom is within hit zone, OR
        // 3. Note completely encompasses hit zone
        return (noteTop >= hitZoneTop && noteTop <= hitZoneBottom) ||
               (noteBottom >= hitZoneTop && noteBottom <= hitZoneBottom) ||
               (noteTop <= hitZoneTop && noteBottom >= hitZoneBottom);
    }

    createHitEffect() {
        this.hitEffect = { lifetime: 500 };
    }

    createMissEffect() {
        this.missEffect = { lifetime: 500 };
    }
}