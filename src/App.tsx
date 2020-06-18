import React from "react";
import {Provider} from "react-redux";
import {initializeStore} from "./redux/store";
import {BrowserRouter as Router, Route} from "react-router-dom";

import Home from "./Home";
import "./App.css";

const App = () => (
    <Provider store={initializeStore()}>
        <Router>
            <Route component={Home} />
        </Router>
    </Provider>
);

export default App;