   // Confetti particle class
    class ConfettiParticle {
        constructor(context, x, y, w, h, color) {
            this.context = context;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.color = color;
            this.speed = Math.random() * 8;
            this.speedX = (Math.random() - 0.5) * 20;
            this.speedY = Math.random() * 8;
            this.angle = Math.random() * 2 * Math.PI;
            this.rotate = Math.random() * 360;
            this.gravity = 0.06;
            this.velocity = 0;
        }

        draw() {
            this.context.save();
            this.context.beginPath();
            this.context.fillStyle = this.color;
            this.context.translate(this.x, this.y);
            this.context.rotate(this.rotate * Math.PI / 180);
            this.context.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            this.context.restore();
        }

        update() {
            this.x += this.speedX * Math.cos(this.angle);
            this.y += this.speedY * Math.sin(this.angle) + this.velocity;
            this.speedX *= 0.99;
            this.velocity += this.gravity;
            this.rotate += this.speed;
            this.draw();
        }
    }

    // Confetti blast function
    function confettiBlast(context, blastCenter, confettiCount, confettiSize, blastPower) {
        let particles = [];
        for (let i = 0; i < confettiCount; i++) {
            let x = blastCenter.x + Math.random() * blastPower - blastPower / 2;
            let y = blastCenter.y + Math.random() * blastPower - blastPower / 2;
            let w = Math.random() * confettiSize;
            let h = Math.random() * confettiSize;
            let color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            particles.push(new ConfettiParticle(context, x, y, w, h, color));
        }

        function animate() {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            particles.forEach(p => p.update());
            animationID = requestAnimationFrame(animate);
        }

        animate();
    }
