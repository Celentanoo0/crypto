//todo:
// fix the problem when you're opening app in another tab it isn't working. With broadcast channel api or ls

const API_KEY =
  "a0ed06110a6de56d8c55fc29917fcff11c8f5bd60373178e5b98259ca8356f10";

const tickersHandlers = new Map();

const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

const subscribeToWS = (tickerName) => {
  sendMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const unsubscribeFromWS = (tickerName) => {
  sendMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const subscribeToWSForNonTradablePairs = (tickerName) => {
  sendMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~BTC`],
  });
};

const unsubscribeFromWSForNonTradablePairs = (tickerName) => {
  sendMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~BTC`],
  });
};

const sendMessage = (message) => {
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
const ERROR_INDEX = "500";
let btcToUsd = 1;
let cryptoPairIsAlreadyExist = tickersHandlers.has("BTC");

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    PRICE: price,
    FROMSYMBOL: tickerFrom,
    TOSYMBOL: tickerTo,
    PARAMETER: errParam,
    MESSAGE: errMessage,
  } = JSON.parse(e.data);

  if (!tickersHandlers.has("BTC") && !cryptoPairIsAlreadyExist) {
    subscribeToWS("BTC");
    cryptoPairIsAlreadyExist = true;
  }

  if (type === ERROR_INDEX && errMessage === "INVALID_SUB") {
    const tokenFrom = errParam.split("~")[2];
    const tokenTo = errParam.split("~")[3];

    if (tokenTo !== "USD") {
      const handlers = tickersHandlers.get(tokenFrom) ?? [];
      handlers.forEach((fn) => fn(undefined));
      return;
    }

    subscribeToWSForNonTradablePairs(tokenFrom);
    return;
  }

  if (type !== CURRENCY_INDEX || price === undefined) {
    return;
  }

  if (tickerFrom === "BTC") {
    btcToUsd = price;
  }

  const handlers = tickersHandlers.get(tickerFrom) ?? [];

  if (tickerTo !== "BTC") {
    handlers.forEach((fn) => fn(price));
  } else {
    handlers.forEach((fn) => fn(price * btcToUsd));
  }
});

export const subscribeToUpdates = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
  subscribeToWS(tickerName);
};

export const unsubscribeFromUpdates = (tickerName) => {
  tickersHandlers.delete(tickerName);
  unsubscribeFromWS(tickerName);
  unsubscribeFromWSForNonTradablePairs(tickerName);
};

export const cryptoCoins = async () => {
  const f = await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
  const result = await f.json();
  return result.Data;
};
