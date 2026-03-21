export interface DrawAction {
  sessionId: string;
  prevX: number;
  prevY: number;
  currentX: number;
  currentY: number;
  color: string;
  lineWidth: number;
}