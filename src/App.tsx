import React from "react";
import {Provider} from "react-redux";
import {initializeStore} from "./redux/store";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import Home from "./screens/Home";
import "./App.css";
import SignUpScreen from "./screens/SignUpScreen";

const App = () => (
  <Provider store={initializeStore()}>
    <Router>
        <Switch>
            <Route path="/sign-up" component={SignUpScreen} />
            <Route component={Home} />
        </Switch>
    </Router>
  </Provider>
);

export default App;
