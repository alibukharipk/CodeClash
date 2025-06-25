import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import Admin from "layouts/Admin";
import Login from "views/Login"
import Home from "views/Home"
import AuthService from "services/authService";
import DefaulLayout from "layouts/Default.js";
import { Provider } from "react-redux";
import store from "store/store"
import { ConnectedRouter } from "connected-react-router";
import { history } from "store/store"; 
import ErrorBoundary from "errorboundry";
import ErrorScreen from "errorscreen";
import Test from "views/Test"
import TakeTest from "views/TakeTest"
import TestScreen from "views/TestScreen"

const root = ReactDOM.createRoot(document.getElementById("root"));

const PrivateRoute = ({ component: Component, fallback: Fallback, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      if (!AuthService.isAuthenticated()) {
        return <Redirect to="/login" />;
      }

      return (
        <ErrorBoundary
          fallback={
            Fallback || (
              <DefaulLayout>
                <ErrorScreen {...props} errorType="admin" />
              </DefaulLayout>
            )
          }
        >
          <Component {...props} />
        </ErrorBoundary>
      );
    }}
  />
);

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ConnectedRouter history={history}>
        <ErrorBoundary>
          <Switch>
            <Route exact path="/" render={() => <Redirect to="/home" />} />
            
            <Route path="/login" render={(props) => (
              <DefaulLayout>
                <Login {...props} />
              </DefaulLayout>
            )} />

            <Route path="/home" render={(props) => (
              <DefaulLayout>
                <Home {...props} />
              </DefaulLayout>
            )} />
            
            <PrivateRoute path="/admin" component={Admin} />
            <Route path="/test/:id" component={Test} />
            <Route path="/take-test/:id" component={TakeTest} />

            <Route exact path="/error" render={(props) => (
              <DefaulLayout>
                <ErrorScreen {...props} />
              </DefaulLayout>
            )} />
            
            <Route render={() => <Redirect to="/error" />} />
           
          </Switch>
        </ErrorBoundary>
      </ConnectedRouter>
    </BrowserRouter>
  </Provider>
);
