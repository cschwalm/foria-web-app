import {call, select, put, takeEvery, actionChannel} from "redux-saga/effects";

import Action from "./Action";
import {ActionType as StripeActionType} from "./stripeSaga";
import {getEventId, getTicketsForPurchase, getAccessToken} from "./selectors";
import {TicketCounts, ActionType as HomeActionType} from "./reducers/home";

const foriaBackend = process.env.REACT_APP_FORIA_BACKEND_BASE_URL as "string";

export enum ActionType {
  EventFetchError = "EventFetchError",
  EventFetchCriticalError = "EventFetchCriticalError",
  EventFetchSuccess = "EventFetchSuccess",
  CheckoutSuccess = "CheckoutSuccess",
  CheckoutError = "CheckoutError",
  CheckoutCriticalError = "CheckoutCriticalError",
  InitiateCalculateOrder = "InitiateCalculateOrder",
  CalculateOrderTotalError = "CalculateOrderTotalError",
  CalculateOrderTotalCriticalError = "CalculateOrderTotalCriticalError",
  CalculateOrderTotalSuccess = "CalculateOrderTotalSuccess"
}

const defaultHeaders = {
  Accept: "application/json",
  "Content-Type": "application/json"
};

const authHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`
});

async function tupleResponse(promise: Promise<Response>) {
  // A tuple response is a promise which always succeeds
  // It yields a tuple
  // [success body if successful, a 400 body, a 500 body, a connection/parsing error]
  let response;
  let text;
  try {
    response = await promise;
    text = await response.text();
  } catch (err) {
    return [null, null, null, err];
  }

  let body = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Unable to parse as json
  }

  if (response.status >= 500) {
    return [null, null, body, null];
  } else if (response.status >= 400) {
    return [null, body, null, null];
  }
  return [body, null, null, null];
}

function fetchEvent(eventId: string) {
  return tupleResponse(
    fetch(`${foriaBackend}/v1/event/${eventId}`, {
      headers: defaultHeaders
    })
  );
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
  return tupleResponse(
    fetch(`${foriaBackend}/v1/ticket/checkout/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {...defaultHeaders, ...authHeaders(accessToken)}
    })
  );
}

function* completePurchase(action: Action) {
  let stripeToken;
  if (action.type === StripeActionType.StripeCreateTokenSuccess) {
    stripeToken = action.data.id;
  } // else we are dealing with a free transaction

  let eventId = yield select(getEventId);
  let accessToken = yield select(getAccessToken);
  let ticketsForPurchase = yield select(getTicketsForPurchase);

  let orderPayload: OrderPayload = {
    event_id: eventId,
    ticket_line_item_list: getTicketItemList(ticketsForPurchase),
    payment_token: stripeToken || null
  };

  let [checkoutResponse, error400, error500, connectionError] = yield call(
    completeCheckout,
    orderPayload,
    accessToken
  );
  if (error400) {
    yield put({
      type: ActionType.CheckoutError,
      data: error400
    });
    return;
  } else if (error500 || connectionError) {
    yield put({
      type: ActionType.CheckoutCriticalError,
      data: error500 || connectionError
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
  return tupleResponse(
    fetch(`${foriaBackend}/v1/ticket/calculateOrderTotal/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {...defaultHeaders, ...authHeaders(accessToken)}
    })
  );
}

function* calculateOrderTotalSaga() {
  let eventId = yield select(getEventId);
  let accessToken = yield select(getAccessToken);
  let ticketsForPurchase = yield select(getTicketsForPurchase);

  let orderPayload: OrderTotalPayload = {
    event_id: eventId,
    ticket_line_item_list: getTicketItemList(ticketsForPurchase)
  };

  let [orderTotal, error400, error500, connectionError] = yield call(
    calculateOrderTotal,
    orderPayload,
    accessToken
  );
  if (error400) {
    yield put({
      type: ActionType.CalculateOrderTotalError,
      data: error400
    });
    return;
  } else if (error500 || connectionError) {
    yield put({
      type: ActionType.CalculateOrderTotalCriticalError,
      data: error500 || connectionError
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
  let freePurchaseChannel = yield actionChannel(
    HomeActionType.FreePurchaseSubmit
  );

  let eventId = yield select(getEventId);
  let [event, error400, error500, connectionError] = yield call(
    fetchEvent,
    eventId
  );
  if (error400) {
    yield put({
      type: ActionType.EventFetchError,
      data: error400
    });
    return;
  } else if (error500 || connectionError) {
    yield put({
      type: ActionType.EventFetchCriticalError,
      data: error500 || connectionError
    });
    return;
  }

  yield put({
    type: ActionType.EventFetchSuccess,
    data: event
  });

  yield takeEvery(freePurchaseChannel, completePurchase);
  yield takeEvery(stripeTokenChannel, completePurchase);
  yield takeEvery(calculateOrderChannel, calculateOrderTotalSaga);
}

export default saga;
