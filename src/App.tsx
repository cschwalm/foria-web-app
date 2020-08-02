import React from "react";
import {Provider} from "react-redux";
import {initializeStore} from "./redux/store";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import "./App.css";
import SignUpScreen from "./screens/SignUpScreen";
import WrapperComponent from "./screens/WrapperComponent";

const App = () => (
  <Provider store={initializeStore()}>
    <Router>
        <Switch>
            <Route path="/sign-up" component={SignUpScreen} />
            <Route component={WrapperComponent} />
        </Switch>
    </Router>
  </Provider>
);

export default App;
