export const cryptoCoins = async () => {
    const f = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    const result = await f.json();
    return result.Data;
};