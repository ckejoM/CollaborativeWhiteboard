# Collaborative Whiteboard (Real-Time Distributed State)

> **Created by Jovan Madzic | Software Engineer, https://www.linkedin.com/in/jovan-madzic-12093b202/**

## 🏗️ Architecture Overview
This project is a production-grade, distributed real-time whiteboard. Unlike a basic single-server WebSocket implementation, this architecture is designed to sit behind a load balancer and scale horizontally.

* **Backend:** ASP.NET Core Minimal APIs with SignalR.
* **Horizontal Scaling:** StackExchange.Redis acts as a Pub/Sub backplane, ensuring that WebSocket connections on Server A can broadcast drawing coordinates to clients connected to Server B.
* **Frontend:** Angular 17+ standalone components utilizing the HTML5 Canvas API.
* **State Management:** RxJS handles the high-frequency stream of `mousemove` events, buffering and throttling the data before sending it over the network to prevent server flooding.

## 🛠️ Tech Stack
* **.NET 9** (C#, SignalR, Minimal API)
* **Redis** (Dockerized for local testing, utilized as the SignalR Backplane)
* **Angular 17** (TypeScript, RxJS, SCSS)

## 📝 Architectural Decisions & Tech Debt Log
To keep the project scope focused on real-time infrastructure, the following architectural shortcuts were taken and would need to be addressed before a true production launch:

1. **Hardcoded Sessions:** The frontend currently hardcodes the `boardId` to `'global-board'`. *Resolution:* Implement dynamic routing in Angular (e.g., `/board/:id`) and pass that ID to the SignalR `JoinBoard` method.
2. **Volatile State:** The whiteboard state exists only in the volatile UI of connected clients. If everyone disconnects, the drawing is lost. *Resolution:* Implement a background worker that periodically takes a snapshot of the coordinate arrays and saves them to a persistent database (like PostgreSQL or MongoDB) so late-joiners can fetch the existing board state.
3. **RxJS Throttling Optimization:** The `auditTime` was tuned to `10ms` to provide a smooth line without stripping, balancing network payload size against visual fidelity.
4. **Security/Authentication:** The SignalR Hub currently accepts anonymous connections. *Resolution:* Integrate JWT Bearer token authentication and map user claims to the SignalR `Context.UserIdentifier`.

## 🚀 How to Run Locally
1. Start the Redis Backplane: `cd src/Whiteboard.API && docker-compose up -d`
2. Start the .NET API: `cd src/Whiteboard.API && dotnet run`
3. Start the Angular Client: `cd src/whiteboard-client && ng serve`
4. Open `http://localhost:4200` in multiple browser windows to test the real-time synchronization.