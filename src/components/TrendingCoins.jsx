import React from 'react';
import { Link } from 'react-router-dom';

import { useGetCryptosQuery } from '../services/cryptoApi';

const TrendingCoins = () => {
  const { data, isFetching } = useGetCryptosQuery(20);
  const coins = data?.data?.coins;

  if (isFetching || !coins) return null;

  // Double the coins array for seamless infinite scroll
  const duplicatedCoins = [...coins, ...coins];

  return (
    <div className="trending-container">
      <div className="trending-title">
        <span role="img" aria-label="fire">🔥</span>
        <h3>Trending Coins</h3>
      </div>
      <div className="trending-ticker">
        {duplicatedCoins.map((coin, index) => (
          <Link to={`/crypto/${coin.uuid}`} key={`${coin.uuid}-${index}`} style={{ textDecoration: 'none' }}>
            <div className="trending-coin">
              <img src={coin.iconUrl} alt={coin.name} />
              <span className="coin-symbol">{coin.symbol}</span>
              <span className="coin-price">${parseFloat(coin.price).toFixed(2)}</span>
              <span className={`coin-change ${parseFloat(coin.change) >= 0 ? 'positive' : 'negative'}`}>
                {parseFloat(coin.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(coin.change))}%
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingCoins;
