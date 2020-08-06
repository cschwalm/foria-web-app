import {applyMiddleware, combineReducers, createStore} from "redux";
import createSagaMiddleware from "redux-saga";
import {initialState as defaultRootInitialState, reducer as root, State as RootState} from "./reducers/root";
import {initialState as defaultEventInitialState, reducer as event, State as EventState} from "./reducers/event";
import saga from "./sagas";
import {
    FULL_STATE_EVENT_ID_KEY,
    FULL_STATE_EVENT_KEY,
    FULL_STATE_ROOT_KEY,
    FULL_STATE_TIME_EXPIRE_KEY
} from "../utils/constants";

export interface AppState {
  root: RootState;
  event: EventState;
}

export function initializeStore() {
    let rootInitialState = defaultRootInitialState;
    let eventInitialState = defaultEventInitialState;

    const currentTime = (new Date()).getTime();
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("eventId");

    // Sets initial state from local storage if available
    // The initial states in event.ts and root.ts are over written
    try {
        const stateExpireTime = localStorage.getItem(FULL_STATE_TIME_EXPIRE_KEY);
        const rootState = localStorage.getItem(FULL_STATE_ROOT_KEY);

        const eventState = localStorage.getItem(FULL_STATE_EVENT_KEY);
        const loadedEventId = localStorage.getItem(FULL_STATE_EVENT_ID_KEY);

        if (rootState !== null && stateExpireTime !== null) {

            const stateExpireTimeInt = parseInt(stateExpireTime);

            if (currentTime <= stateExpireTimeInt) {
                rootInitialState = JSON.parse(rootState);
            } else {
                console.warn("Time check failed. Clearing full local storage.");
                localStorage.clear();
            }
        }

        if (eventState != null && loadedEventId != null && eventId != null) {

            if (loadedEventId === eventId) {
                eventInitialState = JSON.parse(eventState);
            } else {
                console.warn("Event ID check failed. Clearing event local storage.");
                localStorage.removeItem(FULL_STATE_EVENT_KEY);
                localStorage.removeItem(FULL_STATE_EVENT_ID_KEY);
            }
        }

    } catch (e) {
        console.error("Failed to check session storage.");
    }

  const sagaMiddleWare = createSagaMiddleware();
  const store = createStore(
    combineReducers({root, event}),
    {root: rootInitialState, event: eventInitialState},
    applyMiddleware(sagaMiddleWare)
  );

  // Inititate the saga
  sagaMiddleWare.run(saga);

  return store;
}
