const worker = new SharedWorker('src/sharedWorker.js');
worker.port.start();

const tickersHandlers = new Map();

const subscribeToWS = (tickerName) => {
  worker.port.postMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const unsubscribeFromWS = (tickerName) => {
  worker.port.postMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~USD`],
  });
};

const subscribeToWSForNonTradablePairs = (tickerName) => {
  worker.port.postMessage({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickerName}~BTC`],
  });
};

const unsubscribeFromWSForNonTradablePairs = (tickerName) => {
  worker.port.postMessage({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickerName}~BTC`],
  });
};

const CURRENCY_INDEX = "5";
const ERROR_INDEX = "500";
let btcToUsd = 1;
let cryptoPairIsAlreadyExist = tickersHandlers.has("BTC");

worker.port.addEventListener("message", (e) => {
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

export const getCryptoCoinsList = async () => {
  const f = await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
  const result = await f.json();
  return result.Data;
};
