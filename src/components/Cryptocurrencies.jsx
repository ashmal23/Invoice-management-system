import React, { useEffect, useState } from 'react';
import millify from 'millify';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Input } from 'antd';

import { useGetCryptosQuery } from '../services/cryptoApi';
import Loader from './Loader';

const Cryptocurrencies = ({ simplified }) => {
  const count = simplified ? 10 : 100;
  const { data: cryptosList, isFetching } = useGetCryptosQuery(count);
  const [cryptos, setCryptos] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useState([]);

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cryptovault_watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    setCryptos(cryptosList?.data?.coins);

    const filteredData = cryptosList?.data?.coins.filter((item) => item.name.toLowerCase().includes(searchTerm));

    setCryptos(filteredData);
  }, [cryptosList, searchTerm]);

  if (isFetching) return <Loader />;

  const toggleWatchlist = (coinId) => {
    let updated;
    if (watchlist.includes(coinId)) {
      updated = watchlist.filter((id) => id !== coinId);
    } else {
      updated = [...watchlist, coinId];
    }
    setWatchlist(updated);
    localStorage.setItem('cryptovault_watchlist', JSON.stringify(updated));
  };

  return (
    <>
      {!simplified && (
        <div className="search-crypto">
          <Input
            placeholder="Search Cryptocurrency"
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
      )}
      <Row gutter={[32, 32]} className="crypto-card-container">
        {cryptos?.map((currency) => (
          <Col
            xs={24}
            sm={12}
            lg={6}
            className="crypto-card"
            key={currency.uuid}
          >
            <Card
              title={(
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{currency.rank}. {currency.name}</span>
                  <button
                    type="button"
                    className={`watchlist-star ${watchlist.includes(currency.uuid) ? 'active' : 'inactive'}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWatchlist(currency.uuid);
                    }}
                    title={watchlist.includes(currency.uuid) ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {watchlist.includes(currency.uuid) ? '★' : '☆'}
                  </button>
                </div>
              )}
              extra={<img className="crypto-image" src={currency.iconUrl} alt={currency.name} />}
              hoverable
            >
              <Link key={currency.uuid} to={`/crypto/${currency.uuid}`} style={{ textDecoration: 'none' }}>
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
    </>
  );
};

export default Cryptocurrencies;
