import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';
import '../App.css';

import Redirecter from './Redirecter';
import MainLayout from '../pages/MainLayout';
import Home from '../pages/Home';

class App extends Component {
  componentDidMount() {
    this.props.fetchUser(); // fetchUser declared in actions
  }

  render() {
    return (
      <BrowserRouter>
        <MainLayout>
          <Redirecter />
          <Route exact path="/" component={Home} />
        </MainLayout>
      </BrowserRouter>
    );
  }
}

export default connect(null, actions)(App);
