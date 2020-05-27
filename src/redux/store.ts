import {applyMiddleware, combineReducers, createStore} from "redux";
import createSagaMiddleware from "redux-saga";
import {
  reducer as root,
  initialState as defaultRootInitialState,
  State as RootState
} from "./reducers/root";
import {
  reducer as home,
  initialState as defaultHomeInitialState,
  State as HomeState
} from "./reducers/home";
import saga from "./sagas";
import {FULL_STATE_KEY} from "../utils/constants";

export interface AppState {
  root: RootState;
  home: HomeState;
}

export function initializeStore() {
    let rootInitialState = defaultRootInitialState;
    let homeInitialState = defaultHomeInitialState;

    // Sets initial state from local storage if available
    // The initial states in home.ts and root.ts are over written
    try {
        const state = localStorage.getItem(FULL_STATE_KEY);
        if (state !== null) {
            rootInitialState = JSON.parse(state).root;
            homeInitialState = JSON.parse(state).home;
        }
    } catch (e) {
        console.log("Failed to check session storage.");
    }

  const sagaMiddleWare = createSagaMiddleware();
  const store = createStore(
    combineReducers({root, home}),
    {root: rootInitialState, home: homeInitialState},
    applyMiddleware(sagaMiddleWare)
  );

  // Inititate the saga
  sagaMiddleWare.run(saga);

  return store;
}
