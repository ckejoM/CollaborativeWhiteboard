using Microsoft.AspNetCore.SignalR;
using Whiteboard.API.Models;

namespace Whiteboard.API.Hubs;

public sealed class WhiteboardHub : Hub
{
    // Users join a specific board/session
    public async Task JoinBoard(string boardId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, boardId);
    }

    // Users leave the board
    public async Task LeaveBoard(string boardId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, boardId);
    }

    // Broadcast drawing coordinates to all OTHER clients in the same board
    public async Task Draw(string boardId, DrawAction action)
    {
        await Clients.OthersInGroup(boardId).SendAsync("ReceiveDrawAction", action);
    }
}
