import {applyMiddleware, combineReducers, createStore} from "redux";
import createSagaMiddleware from "redux-saga";
import {
  reducer as root,
  initialState as rootInitialState,
  State as RootState
} from "./reducers/root";
import {
  reducer as home,
  initialState as homeInitialState,
  State as HomeState
} from "./reducers/home";
import saga from "./sagas";

export interface AppState {
  root: RootState;
  home: HomeState;
}

export function initializeStore() {
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
