import express from "express";
import * as broker from "./broker.js";
import { Message } from "./proto/chat_pb.js";

const app = express();


app.post("/post", express.json(), (req, res) => {
  try {
    // Use Protobuf to validate the message
    
    const message = Message.fromJson(req.body);

    console.log("message",message)

    broker.emit(message);
    res.sendStatus(204);
  } catch (error) {
    // Protobuf runtime will throw an error if the message is invalid
    if (error instanceof Error) res.status(400).send({ error: error.message });
    else res.sendStatus(500);
  }
});

// SSE route to broadcast messages to clients
app.get("/messages", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");

  console.log("req",req)

  const removeListener = broker.listen((message) => {
    // `message` is guaranteed to have all the props we need
    res.write(`data: ${JSON.stringify(message)}\r\n\r\n`);
  });

  req.on("close", removeListener);
});


app.listen(3000 ,() => {
  console.log("[server]: server is running")
})