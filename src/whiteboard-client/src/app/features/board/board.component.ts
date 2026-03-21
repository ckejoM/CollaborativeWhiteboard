import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalrService } from '../../core/services/signalr.service';
import { DrawAction } from '../../core/models/draw-action.model';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  private signalrService = inject(SignalrService);
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  
  private prevX = 0;
  private prevY = 0;
  private remoteDrawSub!: Subscription;

  ngAfterViewInit(): void {
    const canvasEl = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d')!;

    // Fixed resolution
    canvasEl.width = 1000;
    canvasEl.height = 600;

    // 1. Subscribe to the remote stream (Incoming Data)
    this.remoteDrawSub = this.signalrService.remoteDraw$.subscribe((action: DrawAction) => {
      this.drawRemoteAction(action);
    });
  }

  ngOnDestroy(): void {
    // Senior practice: Always clean up subscriptions to prevent memory leaks
    if (this.remoteDrawSub) {
      this.remoteDrawSub.unsubscribe();
    }
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

    // 2. Local Instant Draw (Optimistic UI)
    this.drawOnCanvas(this.prevX, this.prevY, currentX, currentY, '#000000', 3);

    // 3. Push to RxJS Throttled Stream (Outgoing Data)
    const action: DrawAction = {
      sessionId: this.signalrService.getSessionId(),
      prevX: this.prevX,
      prevY: this.prevY,
      currentX: currentX,
      currentY: currentY,
      color: '#000000', // Hardcoded for now, could be dynamic later
      lineWidth: 3
    };
    this.signalrService.sendLocalDrawAction(action);

    this.prevX = currentX;
    this.prevY = currentY;
  }

  onMouseUp(): void {
    this.isDrawing = false;
  }

  // Extracted and enhanced with State Management
  private drawOnCanvas(prevX: number, prevY: number, currentX: number, currentY: number, color: string, lineWidth: number): void {
    this.ctx.save(); // Snapshot current brush settings
    
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(prevX, prevY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    this.ctx.closePath();
    
    this.ctx.restore(); // Revert back to snapshot (prevents remote strokes from hijacking local colors)
  }

  private drawRemoteAction(action: DrawAction): void {
    // Failsafe: Ignore our own messages if the backend grouping logic ever leaks
    if (action.sessionId === this.signalrService.getSessionId()) return;

    this.drawOnCanvas(action.prevX, action.prevY, action.currentX, action.currentY, action.color, action.lineWidth);
  }
}