import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { messageSocket } from "./socket/message.socket";
import cors from "cors";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
    },
  });
  messageSocket(io as any);
  // io.on("connection", (socket) => {
  //   console.log("Connected!");
  // });
  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

console.log("Buleyydxy");
