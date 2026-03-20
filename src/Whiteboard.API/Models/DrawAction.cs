namespace Whiteboard.API.Models;
public sealed record DrawAction(
    string SessionId,
    double PrevX,
    double PrevY,
    double CurrentX,
    double CurrentY,
    string Color,
    int LineWidth
);