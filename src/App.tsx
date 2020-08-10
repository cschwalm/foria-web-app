import React from "react";
import {Provider} from "react-redux";
import {initializeStore} from "./redux/store";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import "./App.css";
import WrapperComponent from "./screens/WrapperComponent";
import MusicDiscoveryScreen from "./screens/MusicDiscoveryScreen";

const App = () => (
  <Provider store={initializeStore()}>
    <Router>
        <Switch>
            <Route path="/music-discovery" component={MusicDiscoveryScreen} />
            <Route component={WrapperComponent} />
        </Switch>
    </Router>
  </Provider>
);

export default App;
