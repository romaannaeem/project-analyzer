import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { Link, Redirect } from 'react-router-dom';

class HeaderBar extends Component {
  renderContent = () => {
    switch (this.props.auth) {
      case null:
        return;
      case false:
        return <Redirect to="/api/auth/clickup" />;
      default:
        return <></>;
    }
  };

  render() {
    return <>{this.renderContent()}</>;
  }
}

function mapStateToProps({ auth }) {
  return {
    auth,
  };
}

export default connect(mapStateToProps, actions)(HeaderBar);
