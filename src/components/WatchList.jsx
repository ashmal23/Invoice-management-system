import React, { useState, useEffect } from 'react';
import millify from 'millify';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Typography } from 'antd';

import { useGetCryptosQuery } from '../services/cryptoApi';
import Loader from './Loader';

const { Title, Text } = Typography;

const WatchList = () => {
  const { data: cryptosList, isFetching } = useGetCryptosQuery(100);
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cryptovault_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  if (isFetching) return <Loader />;

  const allCoins = cryptosList?.data?.coins || [];
  const watchedCoins = allCoins.filter((coin) => watchlist.includes(coin.uuid));

  const removeFromWatchlist = (coinId) => {
    const updated = watchlist.filter((id) => id !== coinId);
    setWatchlist(updated);
    localStorage.setItem('cryptovault_watchlist', JSON.stringify(updated));
  };

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <Title level={2}>
          ⭐ My Watchlist ({watchedCoins.length})
        </Title>
      </div>

      {watchedCoins.length === 0 ? (
        <div className="watchlist-empty">
          <div className="empty-icon">⭐</div>
          <p>Your watchlist is empty</p>
          <Text style={{ color: '#6b7280' }}>
            Go to <Link to="/cryptocurrencies">Cryptocurrencies</Link> and click the star icon to add coins to your watchlist
          </Text>
        </div>
      ) : (
        <Row gutter={[32, 32]} className="crypto-card-container">
          {watchedCoins.map((currency) => (
            <Col xs={24} sm={12} lg={6} className="crypto-card" key={currency.uuid}>
              <Card
                title={(
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{currency.rank}. {currency.name}</span>
                    <button
                      type="button"
                      className="watchlist-star active"
                      onClick={(e) => {
                        e.preventDefault();
                        removeFromWatchlist(currency.uuid);
                      }}
                      title="Remove from watchlist"
                    >
                      ★
                    </button>
                  </div>
                )}
                extra={<img className="crypto-image" src={currency.iconUrl} alt={currency.name} />}
                hoverable
              >
                <Link to={`/crypto/${currency.uuid}`} style={{ textDecoration: 'none' }}>
                  <p>Price: ${millify(currency.price)}</p>
                  <p>Market Cap: ${millify(currency.marketCap)}</p>
                  <p style={{ color: parseFloat(currency.change) >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                    Daily Change: {currency.change}%
                  </p>
                </Link>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default WatchList;
