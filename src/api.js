export const cryptoCoins = async () => {
  const f = await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
  const result = await f.json();
  return result.Data;
};

const API_KEY =
  "a0ed06110a6de56d8c55fc29917fcff11c8f5bd60373178e5b98259ca8356f10";

const tickersHandlers = new Map();

const updateTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
      ...tickersHandlers.keys(),
    ].join(",")}&tsyms=USD&api_key=${API_KEY}`
  )
    .then((data) => data.json())
    .then((rawData) => {
      const tickers = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(tickers).forEach(([tickerName, tickerPrice]) => {
        const handlers = tickersHandlers.get(tickerName) ?? [];
        handlers.forEach((fn) => fn(tickerPrice));
      });
    });
};

setInterval(updateTickers, 5000);

export const subscribeToUpdates = (tickerName, cb) => {
  const subscribers = tickersHandlers.get(tickerName) || [];
  tickersHandlers.set(tickerName, [...subscribers, cb]);
};

export const unsubscribeFromUpdates = (tickerName) => {
  tickersHandlers.delete(tickerName);
};
