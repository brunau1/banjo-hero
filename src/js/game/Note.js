// src/js/game/Note.js
class Note {
    constructor(lane, speed) {
        this.lane = lane;
        this.y = 0;
        this.speed = speed;
        this.width = 50;
        this.height = 15;
        this.active = true;
        this.hit = false;
        this.hitEffect = null;
        this.missEffect = null;
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

        this.width = laneWidth - 2; // -2 for small gap between lanes
        const x = this.lane * laneWidth + 1; // +1 for centering
        
        ctx.save();
        
        // Draw the note rectangle
        ctx.fillStyle = this.hit ? '#4CAF50' : 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x, this.y, this.width, this.height);

        // Add a subtle gradient effect
        const gradient = ctx.createLinearGradient(x, this.y, x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x, this.y, this.width, this.height);

        // Draw hit/miss effects
        if (this.hitEffect) {
            ctx.globalAlpha = this.hitEffect.lifetime / 500;
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(x - 1, this.y - 1, this.width + 2, this.height + 2);
        }

        if (this.missEffect) {
            ctx.globalAlpha = this.missEffect.lifetime / 500;
            ctx.fillStyle = '#FF5252';
            ctx.fillRect(x - 1, this.y - 1, this.width + 2, this.height + 2);
        }

        ctx.restore();
    }

    isInHitZone() {
        // The hit zone is between 530 and 570 pixels from the top
        const hitZoneTop = 545;
        const hitZoneBottom = 555;

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