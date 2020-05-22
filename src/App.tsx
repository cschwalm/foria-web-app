import React from "react";
import {Provider} from "react-redux";
import {initializeStore} from "./redux/store";
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Home from "./Home";
import "./App.css";
import Auth0Callback from "./Auth0Callback";

const App = () => (
  <Provider store={initializeStore()}>
      <BrowserRouter>
        <Switch>
            <Route path="/auth0/callback" component={Auth0Callback} />
            <Route component={Home} />
        </Switch>
    </BrowserRouter>
  </Provider>
);

export default App;
