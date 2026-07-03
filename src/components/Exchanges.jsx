import React from 'react';
import { Row, Col } from 'antd';

import { useGetExchangesQuery } from '../services/cryptoApi';
import Loader from './Loader';

const Exchanges = () => {
  const { isFetching } = useGetExchangesQuery();
  // Note: To access this endpoint you need premium plan
  if (isFetching) return <Loader />;

  return (
    <>
      <Row style={{ marginBottom: '20px', fontWeight: 'bold' }}>
        <Col span={6}>Exchanges</Col>
        <Col span={6}>24h Trade Volume</Col>
        <Col span={6}>Markets</Col>
        <Col span={6}>Change</Col>
      </Row>
      <Row>
        <Col span={24} style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3 style={{ color: 'var(--text-secondary)' }}>Note: A premium API plan is required to view real-time exchanges data.</h3>
        </Col>
      </Row>
    </>
  );
};

export default Exchanges;
