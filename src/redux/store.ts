import {applyMiddleware, combineReducers, createStore} from "redux";
import createSagaMiddleware from "redux-saga";
import {initialState as defaultRootInitialState, reducer as root, State as RootState} from "./reducers/root";
import {initialState as defaultHomeInitialState, reducer as home, State as HomeState} from "./reducers/home";
import saga from "./sagas";
import {FULL_STATE_EVENT_KEY, FULL_STATE_KEY, FULL_STATE_TIME_EXPIRE_KEY} from "../utils/constants";

export interface AppState {
  root: RootState;
  home: HomeState;
}

export function initializeStore() {
    let rootInitialState = defaultRootInitialState;
    let homeInitialState = defaultHomeInitialState;

    const currentTime = (new Date()).getTime();
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    // Sets initial state from local storage if available
    // The initial states in home.ts and root.ts are over written
    try {
        const stateExpireTime = localStorage.getItem(FULL_STATE_TIME_EXPIRE_KEY);
        const state = localStorage.getItem(FULL_STATE_KEY);
        const loadedEventId = localStorage.getItem(FULL_STATE_EVENT_KEY);

        if (state !== null && stateExpireTime !== null && loadedEventId !== null) {

            const stateExpireTimeInt = parseInt(stateExpireTime);

            if (currentTime <= stateExpireTimeInt && eventId === loadedEventId) {
                rootInitialState = JSON.parse(state).root;
                homeInitialState = JSON.parse(state).home;
            } else {
                console.warn("Time/event ID check failed. Clearing local storage.");
                localStorage.clear();
            }
        }
    } catch (e) {
        console.error("Failed to check session storage.");
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
