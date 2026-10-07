# Collaborative Whiteboard

A real-time shared whiteboard: open it in two browser windows, draw in one, and the lines appear in the other.

## Why I built it
A single-server WebSocket demo is easy. I wanted to see what changes once there's more than one server instance: a client on server A has to see strokes drawn by a client on server B. This project is me working through that with SignalR and a Redis backplane.

## How it works
- **Backend:** ASP.NET Core Minimal API with a SignalR hub.
- **Scaling out:** the SignalR Redis backplane (StackExchange.Redis Pub/Sub) relays messages between server instances, so the app can run as several instances behind a load balancer.
- **Frontend:** Angular standalone components drawing on an HTML5 Canvas.
- **Throttling:** `mousemove` fires very often. RxJS (`auditTime`, tuned to 10 ms) batches points before they are sent, which keeps lines smooth without flooding the hub.

## Stack
.NET 9 · ASP.NET Core SignalR · Minimal APIs · Redis (Docker) · Angular 18 · TypeScript · RxJS · HTML5 Canvas · SCSS

## Run it locally
1. Start Redis: `cd src && docker-compose up -d`
2. Start the API: `cd src/Whiteboard.API && dotnet run`
3. Start the client: `cd src/whiteboard-client && npm install && ng serve`
4. Open `http://localhost:4200` in two or more browser windows.

## Known shortcuts and what's next
I kept the scope on the real-time part. These are the gaps I know about:
1. **One board only.** The client hardcodes `boardId = 'global-board'`. Next: route `/board/:id` and pass the id to `JoinBoard`.
2. **No persistence.** The drawing only lives in connected clients. If everyone leaves, it's gone. Next: a background worker that snapshots board state to Redis or a database.
3. **No auth.** The hub accepts anonymous connections. Next: JWT bearer auth mapped to `Context.UserIdentifier`.

---

Built by Jovan Madzic, Software Engineer in Belgrade · [LinkedIn](https://www.linkedin.com/in/jovan-madzic-12093b202/) · [GitHub](https://github.com/ckejoM)
