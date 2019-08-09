import {call, select, put, takeEvery, actionChannel} from "redux-saga/effects";

import normalizeFetchResponse from "../normalizeFetchResponse";
import {ActionType as StripeActionType} from "./stripeSaga";
import {
  getEventId,
  getTicketsForPurchase,
  getAccessToken,
  getStripeToken
} from "./selectors";
import {TicketCounts} from "./reducers/home";

const foriaBackend = process.env.REACT_APP_FORIA_BACKEND_BASE_URL as "string";

export enum ActionType {
  EventFetchError = "EventFetchError",
  EventFetchSuccess = "EventFetchSuccess",
  CheckoutSuccess = "CheckoutSuccess",
  CheckoutError = "CheckoutError",
  InitiateCalculateOrder = "InitiateCalculateOrder",
  CalculateOrderTotalError = "CalculateOrderTotalError",
  CalculateOrderTotalSuccess = "CalculateOrderTotalSuccess"
}

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json"
};

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
});

function fetchEvent(eventId: string) {
  return fetch(`${foriaBackend}/v1/event/${eventId}`, {
    headers: defaultHeaders
  }).then(normalizeFetchResponse);
}

interface CheckoutTicket {
  ticket_type_id: string;
  amount: number;
}

export interface OrderTotal {
  subtotal: string;
  fees: string;
  grand_total: string;
  grand_total_cents: string;
  currency: string;
}

interface OrderPayload {
  event_id: string;
  ticket_line_item_list: CheckoutTicket[];
  payment_token: string;
}
type OrderTotalPayload = Omit<OrderPayload, "payment_token"> & {
  payment_token?: string;
};

function completeCheckout(data: OrderPayload, accessToken: string) {
  return fetch(`${foriaBackend}/v1/ticket/checkout/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {...defaultHeaders, ...authHeaders(accessToken)}
  }).then(normalizeFetchResponse);
}

function* completePurchase(action: {data: string}) {
  let eventId = yield select(getEventId);
  let accessToken = yield select(getAccessToken);
  let stripeToken = yield select(getStripeToken);
  let ticketsForPurchase = yield select(getTicketsForPurchase);

  let orderPayload: OrderPayload = {
    event_id: eventId,
    ticket_line_item_list: getTicketItemList(ticketsForPurchase),
    payment_token: stripeToken.id
  };

  let checkoutResponse: {id: string};
  try {
    checkoutResponse = yield call(completeCheckout, orderPayload, accessToken);
  } catch (err) {
    yield put({
      type: ActionType.CheckoutError,
      data: err
    });
    return;
  }

  yield put({
    type: ActionType.CheckoutSuccess,
    data: checkoutResponse.id
  });
}

const getTicketItemList = (ticketsForPurchase: TicketCounts) =>
  Object.keys(ticketsForPurchase).map(ticketId => ({
    ticket_type_id: ticketId,
    amount: ticketsForPurchase[ticketId]
  }));

function calculateOrderTotal(data: OrderTotalPayload, accessToken: string) {
  return fetch(`${foriaBackend}/v1/ticket/calculateOrderTotal/`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {...defaultHeaders, ...authHeaders(accessToken)}
  }).then(normalizeFetchResponse);
}

function* calculateOrderTotalSaga() {
  let eventId = yield select(getEventId);
  let accessToken = yield select(getAccessToken);
  let stripeToken = yield select(getStripeToken);
  let ticketsForPurchase = yield select(getTicketsForPurchase);

  let orderPayload: OrderTotalPayload = {
    event_id: eventId,
    ticket_line_item_list: getTicketItemList(ticketsForPurchase),
    ...(stripeToken ? {payment_token: stripeToken.id} : {})
  };

  let orderTotal: OrderTotal;
  try {
    orderTotal = yield call(calculateOrderTotal, orderPayload, accessToken);
  } catch (err) {
    yield put({
      type: ActionType.CalculateOrderTotalError,
      data: err
    });
    return;
  }

  yield put({
    type: ActionType.CalculateOrderTotalSuccess,
    data: orderTotal
  });
}

function* saga() {
  // Before anything, setup a channel to capture any actions we will handle, so
  // we don't lose actions in the interim
  let stripeTokenChannel = yield actionChannel(
    StripeActionType.StripeCreateTokenSuccess
  );
  let calculateOrderChannel = yield actionChannel(
    ActionType.InitiateCalculateOrder
  );

  let eventId = yield select(getEventId);
  let event;
  try {
    // TODO remove this comment after development
    // let delay = require('../delay').default; yield delay(5000);
    event = yield call(fetchEvent, eventId);
  } catch (err) {
    yield put({
      type: ActionType.EventFetchError,
      data: err
    });
    return;
  }

  yield put({
    type: ActionType.EventFetchSuccess,
    data: event
  });

  // TODO change this to not depend  on stripe events
  yield takeEvery(stripeTokenChannel, completePurchase);
  yield takeEvery(calculateOrderChannel, calculateOrderTotalSaga);
}

export default saga;
