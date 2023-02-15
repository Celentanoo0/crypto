export const cryptoCoins = async () => {
  const f = await fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
  const result = await f.json();
  return result.Data;
};

const API_KEY =
  "a0ed06110a6de56d8c55fc29917fcff11c8f5bd60373178e5b98259ca8356f10";

export const tickersPrice = (tokenName) =>
  fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=${tokenName}&tsyms=USD&api_key=${API_KEY}`
  ).then((data) => data.json());
