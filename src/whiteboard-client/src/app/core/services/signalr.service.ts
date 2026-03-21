import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Subject, auditTime } from 'rxjs';
import { DrawAction } from '../models/draw-action.model';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: HubConnection;
  
  // We will hardcode a single room for now. In a real app, this comes from the URL route.
  private boardId = 'global-board'; 
  private sessionId = crypto.randomUUID(); // Unique ID for this browser tab

  // 1. INBOUND STREAM: Coordinates coming FROM the server
  private remoteDrawSubject = new Subject<DrawAction>();
  public remoteDraw$ = this.remoteDrawSubject.asObservable();

  // 2. OUTBOUND STREAM: Coordinates going TO the server
  private localDrawSubject = new Subject<DrawAction>();

  constructor() {
    // THE SENIOR SOLUTION: Taming the Firehose
    // Listen to local draw events, but only send the latest one every 20ms
    this.localDrawSubject.pipe(
      auditTime(20) 
    ).subscribe((action) => {
      if (this.hubConnection?.state === 'Connected') {
        this.hubConnection.invoke('Draw', this.boardId, action)
          .catch(err => console.error('Error sending draw action:', err));
      }
    });
  }

  public startConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7295/whiteboard-hub')
      .withAutomaticReconnect() // SignalR Pareto #1: Fallbacks
      .configureLogging(LogLevel.Information)
      .build();

    this.hubConnection.start()
      .then(() => {
        console.log('SignalR Connection established.');
        this.joinBoard(this.boardId);
        this.registerServerEvents();
      })
      .catch(err => console.error('Error starting SignalR connection:', err));
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  private joinBoard(boardId: string): void {
    this.hubConnection.invoke('JoinBoard', boardId)
      .catch(err => console.error('Error joining board:', err));
  }

  private registerServerEvents(): void {
    // Listening for the RPC call from the C# backend
    this.hubConnection.on('ReceiveDrawAction', (action: DrawAction) => {
      // Push incoming remote data into our RxJS stream
      this.remoteDrawSubject.next(action);
    });
  }

  // Components will call this method when the user moves the mouse
  public sendLocalDrawAction(action: DrawAction): void {
    this.localDrawSubject.next(action); // Push to the throttled stream
  }
}