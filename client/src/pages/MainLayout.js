import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spin, Menu, Layout } from 'antd';
import { Redirect } from 'react-router-dom';
import { BuildOutlined } from '@ant-design/icons';

const { Header, Footer, Sider } = Layout;

export default function MainLayout(props) {
  const auth = useSelector((state) => state.auth);

  const renderContent = () => {
    switch (auth) {
      case null:
        return <Spin />;
      case false:
        return <Redirect to="/api/auth/clickup" />;
      default:
        return (
          <Layout>
            <Sider
              className="site-layout-background"
              breakpoint="lg"
              collapsedWidth="0"
              onBreakpoint={(broken) => {}}
              onCollapse={(collapsed, type) => {}}
            >
              <div className="logo" />

              <Menu theme="light" mode="inline" defaultSelectedKeys={['1']}>
                <Menu.Item key="1" icon={<BuildOutlined />}>
                  Dashboard
                </Menu.Item>
                {/* <Menu.Item key="2" icon={<SettingOutlined />}>
                  Settings
                </Menu.Item>
                <Menu.Item key="3" icon={<InfoCircleOutlined />}>
                  Help & Contact
                </Menu.Item> */}
              </Menu>
            </Sider>
            <Layout>
              <Header
                className="site-layout-sub-header-background"
                style={{ padding: 0 }}
              ></Header>

              {props.children}
              <Footer style={{ textAlign: 'center' }}>
                Lol Corp. ©2020 Created by R.N
              </Footer>
            </Layout>
          </Layout>
        );
    }
  };

  return <>{renderContent()}</>;
}
