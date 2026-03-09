import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private animationId: number = 0;
  
  // Game state
  isGameRunning = false;
  player1Score = 0;
  player2Score = 0;
  
  // Canvas dimensions
  private canvasWidth = 800;
  private canvasHeight = 400;
  
  // Ball properties
  private ball = {
    x: 400,
    y: 200,
    radius: 8,
    speedX: 5,
    speedY: 3,
    maxSpeed: 10
  };
  
  // Paddle properties
  private paddleWidth = 12;
  private paddleHeight = 80;
  
  private player1 = {
    x: 20,
    y: 160,
    speed: 6
  };
  
  private player2 = {
    x: 768,
    y: 160,
    speed: 6
  };

  constructor() {}

  ngAfterViewInit() {
    this.initCanvas();
    this.resetBall();
    this.draw();
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
  }

  toggleGame() {
    this.isGameRunning = !this.isGameRunning;
    if (this.isGameRunning) {
      this.gameLoop();
    }
  }

  resetGame() {
    this.isGameRunning = false;
    this.player1Score = 0;
    this.player2Score = 0;
    this.resetBall();
    this.player1.y = 160;
    this.player2.y = 160;
    this.draw();
  }

  private resetBall() {
    this.ball.x = this.canvasWidth / 2;
    this.ball.y = this.canvasHeight / 2;
    
    // Random direction
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    const direction = Math.random() < 0.5 ? 1 : -1;
    this.ball.speedX = Math.cos(angle) * 5 * direction;
    this.ball.speedY = Math.sin(angle) * 5;
  }

  private gameLoop() {
    if (!this.isGameRunning) return;
    
    this.update();
    this.draw();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update() {
    // Move ball
    this.ball.x += this.ball.speedX;
    this.ball.y += this.ball.speedY;
    
    // Ball collision with top and bottom walls
    if (this.ball.y - this.ball.radius <= 0 || this.ball.y + this.ball.radius >= this.canvasHeight) {
      this.ball.speedY = -this.ball.speedY;
    }
    
    // AI for Player 1 (left paddle)
    this.updateAI(this.player1, true);
    
    // AI for Player 2 (right paddle)
    this.updateAI(this.player2, false);
    
    // Ball collision with paddles
    this.checkPaddleCollision();
    
    // Score points
    if (this.ball.x - this.ball.radius <= 0) {
      this.player2Score++;
      this.resetBall();
    } else if (this.ball.x + this.ball.radius >= this.canvasWidth) {
      this.player1Score++;
      this.resetBall();
    }
  }

  private updateAI(player: any, isLeftPaddle: boolean) {
    // AI follows the ball with some prediction
    const paddleCenter = player.y + this.paddleHeight / 2;
    const targetY = this.ball.y;
    
    // Add some reaction delay for more realistic AI
    const reactionThreshold = 15;
    
    if (Math.abs(paddleCenter - targetY) > reactionThreshold) {
      if (paddleCenter < targetY) {
        player.y += player.speed;
      } else {
        player.y -= player.speed;
      }
    }
    
    // Keep paddle within bounds
    if (player.y < 0) player.y = 0;
    if (player.y + this.paddleHeight > this.canvasHeight) {
      player.y = this.canvasHeight - this.paddleHeight;
    }
  }

  private checkPaddleCollision() {
    // Player 1 (left) paddle collision
    if (this.ball.x - this.ball.radius <= this.player1.x + this.paddleWidth &&
        this.ball.y >= this.player1.y &&
        this.ball.y <= this.player1.y + this.paddleHeight &&
        this.ball.speedX < 0) {
      
      this.ball.speedX = -this.ball.speedX * 1.05;
      const hitPos = (this.ball.y - (this.player1.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
      this.ball.speedY += hitPos * 2;
      
      // Limit max speed
      if (Math.abs(this.ball.speedX) > this.ball.maxSpeed) {
        this.ball.speedX = this.ball.maxSpeed * Math.sign(this.ball.speedX);
      }
    }
    
    // Player 2 (right) paddle collision
    if (this.ball.x + this.ball.radius >= this.player2.x &&
        this.ball.y >= this.player2.y &&
        this.ball.y <= this.player2.y + this.paddleHeight &&
        this.ball.speedX > 0) {
      
      this.ball.speedX = -this.ball.speedX * 1.05;
      const hitPos = (this.ball.y - (this.player2.y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
      this.ball.speedY += hitPos * 2;
      
      // Limit max speed
      if (Math.abs(this.ball.speedX) > this.ball.maxSpeed) {
        this.ball.speedX = this.ball.maxSpeed * Math.sign(this.ball.speedX);
      }
    }
  }

  private draw() {
    // Clear canvas
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Draw center line
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 10]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvasWidth / 2, 0);
    this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    
    // Draw paddles
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.player1.x, this.player1.y, this.paddleWidth, this.paddleHeight);
    this.ctx.fillRect(this.player2.x, this.player2.y, this.paddleWidth, this.paddleHeight);
    
    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.closePath();
  }
}
