import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, NgZone } from '@angular/core';

@Component({
  selector: 'app-flappy-bird',
  templateUrl: './flappy-bird.component.html',
  styleUrls: ['./flappy-bird.component.css']
})
export class FlappyBirdComponent implements OnInit, AfterViewInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  private bird = {
    x: 50,
    y: 240,
    radius: 20,
    velocity: 0,
    gravity: 0.25,
    jumpStrength: -5
  };

  private pipes: Array<{ x: number; top: number; bottom: number; passed?: boolean }> = [];
  private readonly pipeWidth = 50;
  private readonly pipeGap = 180;
  private score = 0;
  private gameOver = false;
  private gameStarted = false;
  private birdImg = new Image();
  private canvasWidth = 320;
  private canvasHeight = 480;

  // New properties for settings
  gameSpeed = 1;
  pipeSpawnRate = 200;
  showSettings = true;

  constructor(private ngZone: NgZone) {
    this.birdImg.src = 'data:image/svg+xml,' + encodeURIComponent(`
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-car-front-fill" viewBox="0 0 16 16">
  <path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z"/>
</svg>
    `);
  }

  ngOnInit(): void {
    // The game will start when the user clicks the "Start Game" button
  }

  ngAfterViewInit(): void {
    this.initializeGame();
  }

  private initializeGame(): void {
    if (this.gameCanvas && this.gameCanvas.nativeElement) {
      this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
      this.gameCanvas.nativeElement.width = this.canvasWidth;
      this.gameCanvas.nativeElement.height = this.canvasHeight;
      this.resetGame();
      this.ngZone.runOutsideAngular(() => this.gameLoop());
    } else {
      setTimeout(() => this.initializeGame(), 100);
    }
  }

  @HostListener('window:click', ['$event'])
  @HostListener('window:touchstart', ['$event'])
  onUserInput(event: Event): void {
    event.preventDefault();
    this.jump();
  }

  private createPipe(): void {
    const gapStart = Math.random() * (this.canvasHeight - this.pipeGap - 100) + 50;
    this.pipes.push({
      x: this.canvasWidth,
      top: gapStart,
      bottom: gapStart + this.pipeGap
    });
  }

  private drawBird(): void {
    this.ctx.save();
    this.ctx.translate(this.bird.x, this.bird.y);
    this.ctx.rotate(this.bird.velocity * 0.05);
    this.ctx.drawImage(this.birdImg, -this.bird.radius, -this.bird.radius, this.bird.radius * 2, this.bird.radius * 2);
    this.ctx.restore();
  }

  private drawPipes(): void {
    this.ctx.fillStyle = '#00FF00';
    this.pipes.forEach(pipe => {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.top);
      this.ctx.fillRect(pipe.x, pipe.bottom, this.pipeWidth, this.canvasHeight - pipe.bottom);
    });
  }

  private drawScore(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
  }

  private drawBackground(): void {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  private update(): void {
    if (!this.gameStarted || this.gameOver) return;

    this.bird.velocity += this.bird.gravity * this.gameSpeed;
    this.bird.y += this.bird.velocity * this.gameSpeed;

    if (this.bird.y + this.bird.radius > this.canvasHeight) {
      this.gameOver = true;
    }

    this.pipes.forEach(pipe => {
      pipe.x -= 1.5 * this.gameSpeed;

      if (pipe.x + this.pipeWidth < this.bird.x - this.bird.radius && !pipe.passed) {
        this.score++;
        pipe.passed = true;
      }

      if (
        this.bird.x + this.bird.radius > pipe.x &&
        this.bird.x - this.bird.radius < pipe.x + this.pipeWidth &&
        (this.bird.y - this.bird.radius < pipe.top || this.bird.y + this.bird.radius > pipe.bottom)
      ) {
        this.gameOver = true;
      }
    });

    this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);

    if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvasWidth - this.pipeSpawnRate) {
      this.createPipe();
    }
  }

  private drawTitleScreen(): void {
    this.ctx.fillStyle = '#000';
    this.ctx.font = '30px Arial';
    this.ctx.fillText('Flappy Bird', this.canvasWidth / 2 - 70, this.canvasHeight / 2 - 50);
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Click to Start', this.canvasWidth / 2 - 50, this.canvasHeight / 2 + 20);
  }

  private draw(): void {
    this.drawBackground();

    if (!this.gameStarted) {
      this.drawTitleScreen();
      return;
    }

    this.drawPipes();
    this.drawBird();
    this.drawScore();

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.fillStyle = '#FFF';
      this.ctx.font = '30px Arial';
      this.ctx.fillText('Game Over', this.canvasWidth / 2 - 70, this.canvasHeight / 2 - 50);
      this.ctx.font = '20px Arial';
      this.ctx.fillText(`Score: ${this.score}`, this.canvasWidth / 2 - 40, this.canvasHeight / 2 + 20);
      this.ctx.fillText('Click to Restart', this.canvasWidth / 2 - 60, this.canvasHeight / 2 + 60);
    }
  }

  private gameLoop(): void {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  private jump(): void {
    if (this.showSettings) return;

    if (!this.gameStarted) {
      this.gameStarted = true;
    } else if (this.gameOver) {
      this.showSettings = true;
    } else {
      this.bird.velocity = this.bird.jumpStrength * this.gameSpeed;
    }
  }

  private resetGame(): void {
    this.bird.y = this.canvasHeight / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    // Don't set showSettings to false here, as we want to show settings after game over
  }

  startGame(): void {
    this.showSettings = false;
    this.resetGame();
    this.gameStarted = true;
  }
}
