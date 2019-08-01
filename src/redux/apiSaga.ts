import {call, select, put} from "redux-saga/effects";

import {ActionType as RootActionType} from "./reducers/root";
import {getEventId} from "./selectors";

const foriaBackend = process.env.REACT_APP_FORIA_BACKEND_BASE_URL as "string";

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json"
};

function fetchEvent(eventId: string) {
  return fetch(`${foriaBackend}/v1/event/${eventId}`, {
    headers: defaultHeaders
  }).then(resp => resp.json());
}

function* saga() {
  let eventId = yield select(getEventId);
  let event;
  try {
    event = yield call(fetchEvent, eventId);
  } catch (err) {
    yield put({
      type: RootActionType.EventFetchError,
      data: err
    });
    return;
  }

  yield put({
    type: RootActionType.EventFetchSuccess,
    data: event
  });
}

export default saga;
