import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { Layout, Row, Col, Typography } from 'antd';

import TaskSelector from '../components/TaskSelector';

const { Content } = Layout;
const { Title } = Typography;

export default function Home() {
  const auth = useSelector((state) => state.auth);

  const renderContent = () => {
    console.log(auth);
    switch (auth) {
      case null:
        return <>Loading...</>;
      case '':
        return <Redirect to="/login" />;
      default:
        return (
          <Content style={{ margin: '24px 16px 0' }}>
            <div
              className="site-layout-background"
              style={{ padding: 24, minHeight: '80vh' }}
            >
              <Row>
                <Col className="gutter-row upcoming-events-column" span={4}>
                  <Title level={4}>Tracked Projects</Title>
                  <div>Hello {auth.name}</div>
                  <TaskSelector />
                </Col>
              </Row>
            </div>
          </Content>
        );
    }
  };

  return <>{renderContent()}</>;
}
