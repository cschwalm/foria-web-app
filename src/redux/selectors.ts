import {AppState} from "./store";
import {TicketTypeConfig, FREE_TICKET_PRICE} from "./reducers/root";

export const getEventId = (state: AppState) => state.root.eventId;
export const getView = (state: AppState) => state.home.view;
export const getTicketsForPurchase = (state: AppState) =>
  state.home.ticketsForPurchase;
export const getAccessToken = (state: AppState) => state.root.accessToken;

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
