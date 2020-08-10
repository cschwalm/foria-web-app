import {AppState} from "./store";
import {TicketTypeConfig, FREE_TICKET_PRICE} from "./reducers/root";
import {
    FULL_STATE_EVENT_ID_KEY,
    FULL_STATE_EVENT_KEY,
    FULL_STATE_ROOT_KEY,
    FULL_STATE_TIME_EXPIRE_KEY
} from "../utils/constants";

export const getEventId = (state: AppState) => state.root.eventId;
export const getView = (state: AppState) => state.event.view;
export const getTicketsForPurchase = (state: AppState) =>
  state.event.ticketsForPurchase;
export const getAccessToken = (state: AppState) => state.root.accessToken;
export const getIdProfile = (state: AppState) => state.root.profile;
export const getAppliedPromoCode = (state: AppState) =>
  state.event.appliedPromoCode;

export const setLocalStorage = (state: AppState) => {

    const currentTime = (new Date()).getTime();
    const timeExpire = currentTime + (1000 * 60 * 15); //15 min from now
    const eventId: string = state.root.eventId ?? "";

    try {
        localStorage.setItem(FULL_STATE_ROOT_KEY, JSON.stringify(state.root));
        localStorage.setItem(FULL_STATE_EVENT_KEY, JSON.stringify(state.event));

        localStorage.setItem(FULL_STATE_TIME_EXPIRE_KEY, timeExpire.toString());
        localStorage.setItem(FULL_STATE_EVENT_ID_KEY, eventId);
    } catch (e) {
        console.warn("Failed to set state in local storage. Msg: " + e.message);
    }
};

export const isFreePurchase = (state: AppState) => {
  let ticketTypes: TicketTypeConfig[] =
    (state.root.event && state.root.event.ticket_type_config) || [];
  // [{ id, price },] => { id: price }
  let ticketPrices: {[id: string]: string} = ticketTypes.reduce(
    (results, {id, price}) => ({...results, [id]: price}),
    {}
  );

  let ticketsForPurchase = getTicketsForPurchase(state);
  return Object.keys(ticketsForPurchase).every(
    (ticketId: string) => ticketPrices[ticketId] === FREE_TICKET_PRICE
  );
};
