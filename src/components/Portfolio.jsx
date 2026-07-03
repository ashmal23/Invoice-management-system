import React, { useState, useEffect } from 'react';
import millify from 'millify';
import { Card, Row, Col, Typography, Button, Select, InputNumber } from 'antd';

import { useGetCryptosQuery } from '../services/cryptoApi';
import Loader from './Loader';

const { Title, Text } = Typography;
const { Option } = Select;

const Portfolio = () => {
  const { data: cryptosList, isFetching } = useGetCryptosQuery(100);
  const [holdings, setHoldings] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [buyPrice, setBuyPrice] = useState(0);

  // Load holdings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cryptovault_portfolio');
    if (saved) {
      setHoldings(JSON.parse(saved));
    }
  }, []);

  if (isFetching) return <Loader />;

  const allCoins = cryptosList?.data?.coins || [];

  const addHolding = () => {
    if (!selectedCoin || quantity <= 0) return;

    const coin = allCoins.find((c) => c.uuid === selectedCoin);
    if (!coin) return;

    const newHolding = {
      id: `${coin.uuid}-${Date.now()}`,
      coinId: coin.uuid,
      name: coin.name,
      symbol: coin.symbol,
      iconUrl: coin.iconUrl,
      quantity,
      buyPrice: buyPrice || parseFloat(coin.price),
    };

    const updated = [...holdings, newHolding];
    setHoldings(updated);
    localStorage.setItem('cryptovault_portfolio', JSON.stringify(updated));
    setSelectedCoin(null);
    setQuantity(0);
    setBuyPrice(0);
  };

  const removeHolding = (holdingId) => {
    const updated = holdings.filter((h) => h.id !== holdingId);
    setHoldings(updated);
    localStorage.setItem('cryptovault_portfolio', JSON.stringify(updated));
  };

  // Calculate total portfolio value
  const calculateTotalValue = () => {
    let total = 0;
    holdings.forEach((holding) => {
      const coin = allCoins.find((c) => c.uuid === holding.coinId);
      if (coin) {
        total += parseFloat(coin.price) * holding.quantity;
      }
    });
    return total;
  };

  const calculateTotalInvested = () => {
    let total = 0;
    holdings.forEach((holding) => {
      total += holding.buyPrice * holding.quantity;
    });
    return total;
  };

  const totalValue = calculateTotalValue();
  const totalInvested = calculateTotalInvested();
  const totalPnL = totalValue - totalInvested;
  const pnlPercentage = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : 0;

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <Title level={2}>💰 My Portfolio</Title>
      </div>

      {/* Total Portfolio Value Card */}
      <Card className="portfolio-total-card" bordered={false}>
        <div>
          <Text className="total-label">Total Portfolio Value</Text>
          <div className="total-value">${millify(totalValue)}</div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
            <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
              Invested: ${millify(totalInvested)}
            </Text>
            <Text style={{ color: totalPnL >= 0 ? '#6ee7b7' : '#fca5a5', fontWeight: 700 }}>
              P&L: {totalPnL >= 0 ? '+' : ''}{millify(totalPnL)} ({pnlPercentage}%)
            </Text>
          </div>
        </div>
      </Card>

      {/* Add Holding Form */}
      <Card title="➕ Add New Holding" className="portfolio-add-form">
        <div className="portfolio-form-row">
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text style={{ color: '#a0aec0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>SELECT COIN</Text>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Search cryptocurrency..."
              value={selectedCoin}
              onChange={(value) => {
                setSelectedCoin(value);
                const coin = allCoins.find((c) => c.uuid === value);
                if (coin) setBuyPrice(parseFloat(coin.price));
              }}
              optionFilterProp="children"
              filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {allCoins.map((coin) => (
                <Option key={coin.uuid} value={coin.uuid}>{coin.name} ({coin.symbol})</Option>
              ))}
            </Select>
          </div>
          <div style={{ minWidth: '140px' }}>
            <Text style={{ color: '#a0aec0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>QUANTITY</Text>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              value={quantity}
              onChange={(val) => setQuantity(val || 0)}
              placeholder="0.00"
            />
          </div>
          <div style={{ minWidth: '140px' }}>
            <Text style={{ color: '#a0aec0', fontSize: '12px', display: 'block', marginBottom: '6px' }}>BUY PRICE ($)</Text>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              value={buyPrice}
              onChange={(val) => setBuyPrice(val || 0)}
              placeholder="0.00"
            />
          </div>
          <Button className="portfolio-add-btn" onClick={addHolding}>
            Add Holding
          </Button>
        </div>
      </Card>

      {/* Holdings List */}
      {holdings.length === 0 ? (
        <div className="watchlist-empty" style={{ minHeight: '30vh' }}>
          <div className="empty-icon">💰</div>
          <p>No holdings yet</p>
          <Text style={{ color: '#6b7280' }}>Add your first crypto holding above to start tracking your portfolio</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
          {holdings.map((holding) => {
            const coin = allCoins.find((c) => c.uuid === holding.coinId);
            const currentPrice = coin ? parseFloat(coin.price) : 0;
            const currentValue = currentPrice * holding.quantity;
            const investedValue = holding.buyPrice * holding.quantity;
            const pnl = currentValue - investedValue;
            const pnlPct = investedValue > 0 ? ((pnl / investedValue) * 100).toFixed(2) : 0;

            return (
              <Col xs={24} sm={12} lg={8} key={holding.id}>
                <Card className="portfolio-holding" hoverable>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div className="holding-info">
                      <img src={holding.iconUrl} alt={holding.name} />
                      <div>
                        <Text style={{ fontWeight: 700, fontSize: '16px', display: 'block' }}>{holding.name}</Text>
                        <Text style={{ color: '#6b7280', fontSize: '13px' }}>{holding.symbol}</Text>
                      </div>
                    </div>
                    <Button className="remove-holding" size="small" onClick={() => removeHolding(holding.id)}>
                      ✕
                    </Button>
                  </div>
                  <div className="holding-values">
                    <div className="holding-value-item">
                      <div className="label">Quantity</div>
                      <div className="value">{holding.quantity}</div>
                    </div>
                    <div className="holding-value-item">
                      <div className="label">Avg. Buy</div>
                      <div className="value">${millify(holding.buyPrice)}</div>
                    </div>
                    <div className="holding-value-item">
                      <div className="label">Current</div>
                      <div className="value">${millify(currentPrice)}</div>
                    </div>
                    <div className="holding-value-item">
                      <div className="label">P&L</div>
                      <div className={`value ${pnl >= 0 ? 'profit' : 'loss'}`}>
                        {pnl >= 0 ? '+' : ''}{millify(pnl)} ({pnlPct}%)
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default Portfolio;
