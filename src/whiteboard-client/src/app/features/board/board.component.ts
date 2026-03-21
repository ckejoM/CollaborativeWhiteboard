import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  
  // Track the previous coordinates
  private prevX = 0;
  private prevY = 0;

  ngAfterViewInit(): void {
    const canvasEl = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d')!;

    // Set a fixed resolution for the canvas
    canvasEl.width = 1000;
    canvasEl.height = 600;

    // Canvas styling defaults
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#000000'; // Default black ink
  }

  onMouseDown(e: MouseEvent): void {
    this.isDrawing = true;
    this.prevX = e.offsetX;
    this.prevY = e.offsetY;
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    this.drawOnCanvas(this.prevX, this.prevY, currentX, currentY);

    // Update previous coordinates for the next frame of movement
    this.prevX = currentX;
    this.prevY = currentY;
  }

  onMouseUp(): void {
    this.isDrawing = false;
  }

  // Extracted drawing method so we can reuse it when remote data arrives later
  private drawOnCanvas(prevX: number, prevY: number, currentX: number, currentY: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(prevX, prevY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    this.ctx.closePath();
  }
}