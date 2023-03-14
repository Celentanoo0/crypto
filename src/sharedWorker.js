const API_KEY =
  "a0ed06110a6de56d8c55fc29917fcff11c8f5bd60373178e5b98259ca8356f10";

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

addEventListener("connect", (event) => {
  const port = event.ports[0];
  port.start();

  port.addEventListener("message", (e) => {
    const messageToSend = JSON.stringify(e.data);

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(messageToSend);
      return;
    }

    socket.addEventListener(
      "open",
      () => {
        socket.send(messageToSend);
      },
      { once: true }
    );
  });

  socket.addEventListener("message", (msg) => {
    port.postMessage(msg.data);
  });
});
