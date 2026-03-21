import { Component, inject, OnInit } from '@angular/core';
import { BoardComponent } from './features/board/board.component';
import { SignalrService } from './core/services/signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [BoardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'whiteboard-client';

  private signalrService = inject(SignalrService);

  ngOnInit(): void {
    // Boot up the WebSocket connection when the app starts
    this.signalrService.startConnection();
  }
}
