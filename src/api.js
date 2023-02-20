const API_KEY =
  "a0ed06110a6de56d8c55fc29917fcff11c8f5bd60373178e5b98259ca8356f10";

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const subscribeToWS = (tickerName) => {
  startTracking({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const unsubscribeFromWS = (tickerName) => {
  startTracking({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const startTracking = (message) => {
  const messageToSend = JSON.stringify(message);

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
};

const CURRENCY_INDEX = "5";

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    PRICE: price,
    FROMSYMBOL: tickerName,
  } = JSON.parse(e.data);

  if (type !== CURRENCY_INDEX || price === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(tickerName) ?? [];
  handlers.forEach((fn) => fn(price));
});

export const subscribeToUpdates = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
  subscribeToWS(tickerName);
};

export const unsubscribeFromUpdates = (tickerName) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromWS(tickerName);
};

export const cryptoCoins = async () => {
  const f = await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
  const result = await f.json();
  return result.Data;
};
