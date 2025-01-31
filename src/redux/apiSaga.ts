import {actionChannel, call, put, select, takeEvery} from "redux-saga/effects";

import Action from "./Action";
import {ActionType as StripeActionType} from "./stripeSaga";
import {ActionType as AuthActionType} from "./auth0Saga";
import {getAccessToken, getAppliedPromoCode, getEventId, getIdProfile, getTicketsForPurchase} from "./selectors";
import {ActionType as EventActionType, TicketCounts} from "./reducers/event";
import {atLeast} from "../delay";
import {Dispatch} from "redux";

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
    CalculateOrderTotalSuccess = "CalculateOrderTotalSuccess",
    ApplyPromoError = "ApplyPromoError",
    ApplyPromoCriticalError = "ApplyPromoCriticalError",
    ApplyPromoSuccess = "ApplyPromoSuccess",
    ApplyPromoCancelledNoLogin = "ApplyPromoCancelledNoLogin",
    LinkAccount = "LinkAccount",
    LinkAccountSuccess = "LinkAccountSuccess",
    LinkAccountError = "LinkAccountError",
    MusicFetch = "MusicFetch",
    MusicFetchSuccess = "MusicFetchSuccess",
    MusicFetchError = "MusicFetchError",
}

export const initiateMusicFetch = (dispatch: Dispatch<Action>) => (permalinkUUID: string | null) =>
    dispatch({type: ActionType.MusicFetch, data: permalinkUUID});

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

interface PromoPayload {
  code: string;
}
interface OrderPayload {
  event_id: string;
  ticket_line_item_list: CheckoutTicket[];
  payment_token: string;
  promotion_code?: string;
}
type OrderTotalPayload = Omit<OrderPayload, "payment_token"> & {
  payment_token?: string;
};

interface LinkAccountsRequest {
    "connection"?: string,
    "provider"?: string,
    "id_token"?: string
}

interface Artist {
    "id": string
    "name": string
    "image_url": string
    "image_height": number
    "image_width": number
    "bio_url": string
}

export interface UserTopArtistsResponse {
    "user_id": string,
    "timestamp": string,
    "permalink_uuid": string,
    "spotify_artist_list": Artist[]
}

function getTopArtists(accessToken: string) {
    return tupleResponse(
        fetch(`${foriaBackend}/v1/user/music/topArtists`, {
            headers: {...defaultHeaders, ...authHeaders(accessToken)}
        })
    );
}

function getTopArtistsByPermalink(permalinkUUID: string) {
    return tupleResponse(
        fetch(`${foriaBackend}/v1/user/music/topArtists/${permalinkUUID}`, {
            headers: {...defaultHeaders}
        })
    );
}

/**
 * Checks the action data payload for a Permalink ID.
 * If missing, it pulls the latest data for the currently logged in user.
 *
 * @param action
 */
function* fetchMusicInterests(action: Action) {

    console.log('fetchMusicInterests initiated');
    let response: any;
    if (action.data != null) {

        const permalinkUUID = action.data as string;
        response = yield call(
            getTopArtistsByPermalink,
            permalinkUUID
        );

    } else {

        const accessToken = yield select(getAccessToken);
        response = yield call(
            getTopArtists,
            accessToken
        );
    }

    const [userTopArtists, error400, error500] = response;

    if (error400 || error500) {

        yield put({
            type: ActionType.MusicFetchError,
            data: error400 ?? error500
        });
        return;
    }

    yield put({
        type: ActionType.MusicFetchSuccess,
        data: userTopArtists as UserTopArtistsResponse
    });
}

function completeCheckout(data: OrderPayload, accessToken: string) {
  return tupleResponse(
    fetch(`${foriaBackend}/v1/ticket/checkout/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {...defaultHeaders, ...authHeaders(accessToken)}
    })
  );
}

function fetchPromoTicketTypes(
  eventId: string,
  data: PromoPayload
) {
  return tupleResponse(
    fetch(`${foriaBackend}/v1/event/${eventId}/ticketTypeConfig/promo`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {...defaultHeaders}
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
  let promoCode = yield select(getAppliedPromoCode);
  let ticketsForPurchase = yield select(getTicketsForPurchase);

  let orderPayload: OrderPayload = {
    event_id: eventId,
    ticket_line_item_list: getTicketItemList(ticketsForPurchase),
    payment_token: stripeToken || null,
    promotion_code: promoCode
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

function* applyPromoCode(action: Action) {

  let eventId = yield select(getEventId);
  let accessToken = yield select(getAccessToken);
  let promoCode = action.data;
  let promoPayload: PromoPayload = {
    code: promoCode
  };

  let [
    promoTicketTypeConfigs,
    error400,
    error500,
    connectionError
  ] = yield call(
    /* Wait 500ms before reporting error/success so loading animation gets a
     * chance to register to the user without immediately disappearing */
    // @ts-ignore
    (...args) => atLeast(500, fetchPromoTicketTypes(...args)),
    eventId,
    promoPayload,
    accessToken
  );
  if (error400) {
    yield put({
      type: ActionType.ApplyPromoError,
      data: error400
    });
    return;
  } else if (error500 || connectionError) {
    yield put({
      type: ActionType.ApplyPromoCriticalError,
      data: error500 || connectionError
    });
    return;
  }

  yield put({
    type: ActionType.ApplyPromoSuccess,
    data: {promoCode, promoTicketTypeConfigs}
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

function linkAccounts(data: LinkAccountsRequest, accessToken: string) {

    return tupleResponse(
        fetch(`${foriaBackend}/v1/user/linkAccounts`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {...defaultHeaders, ...authHeaders(accessToken)}
        })
    );
}

/**
 * Bridges the primary and specified account together in Auth0.
 * The account that supplies the access token will be primary.
 */
function* linkAccountSaga(action: Action) {

    console.log('linkAccountSaga initiated')
    let idToken;
    if (action.type === ActionType.LinkAccount) {
        idToken = action.data;
    } else {
        return;
    }

    const accessToken = yield select(getAccessToken);
    const primaryProfile = yield select(getIdProfile);

    if (idToken == null || accessToken === undefined) {
        console.error("Missing ID/access token. Unable to link accounts.");

        yield put({
            type: ActionType.LinkAccountError,
            data: "Missing ID/access token. Unable to link accounts."
        });
        return;
    }

    const linkAccountsPayload: LinkAccountsRequest = {
        id_token: idToken,
        connection: "spotify",
        provider: "oauth2"
    };

    const [result, error400, error500, connectionError] = yield call(
        linkAccounts,
        linkAccountsPayload,
        accessToken
    );

    if (error400) {
        yield put({
            type: ActionType.LinkAccountError,
            data: error400
        });
        return;
    } else if (error500 || connectionError) {
        yield put({
            type: ActionType.LinkAccountError,
            data: error500 || connectionError
        });
        return;
    }

    //Replace access token to use primary account.
    yield put({
        type: AuthActionType.AuthenticationSuccess,
        data: accessToken
    });

    yield put({
        type: AuthActionType.LoginSuccess,
        data: primaryProfile
    });

    console.log(`Accounts linked. Primary Account ID: ${primaryProfile.sub}`);

    yield put({
        type: ActionType.LinkAccountSuccess,
        data: result.code
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
    EventActionType.FreePurchaseSubmit
  );
  let applyPromoCodeChannel = yield actionChannel(
    EventActionType.ApplyPromoCode
  );
  const linkAccountChannel = yield actionChannel(
      ActionType.LinkAccount
  );
  const musicFetchChannel = yield actionChannel(
      ActionType.MusicFetch
  );

  let eventId = yield select(getEventId);
  if (eventId != null) {
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

      // event.ticket_type_config = [];
      yield put({
          type: ActionType.EventFetchSuccess,
          data: event
      });
  }

  yield takeEvery(freePurchaseChannel, completePurchase);
  yield takeEvery(applyPromoCodeChannel, applyPromoCode);
  yield takeEvery(stripeTokenChannel, completePurchase);
  yield takeEvery(calculateOrderChannel, calculateOrderTotalSaga);
  yield takeEvery(linkAccountChannel, linkAccountSaga);
  yield takeEvery(musicFetchChannel, fetchMusicInterests);
}

export default saga;
