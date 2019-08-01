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
    // TODO remove this comment after development
    // let delay = require('../delay').default; yield delay(5000);
    event = yield call(fetchEvent, eventId);
  } catch (err) {
    yield put({
      type: RootActionType.EventFetchError,
      data: err
    });
    return;
  }
  // TODO remove this comment after development
  // event.ticket_type_config.push(
  //   {
  //     "id": "63c47345-a15a-4a6e-b248-e700418b6e2b",
  //     "name": "GA",
  //     "description": "General Audience",
  //     "authorized_amount": 0,
  //     "amount_remaining": 0,
  //     "price": "50.00",
  //     "currency": "USD"
  //   }
  // )

  yield put({
    type: RootActionType.EventFetchSuccess,
    data: event
  });
}

export default saga;
