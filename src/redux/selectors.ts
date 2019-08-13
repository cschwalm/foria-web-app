import {AppState} from "./store";

export const getEventId = (state: AppState) => state.root.eventId;
export const getView = (state: AppState) => state.home.view;
export const getTicketsForPurchase = (state: AppState) =>
  state.home.ticketsForPurchase;
export const getAccessToken = (state: AppState) => state.root.accessToken;
export const getCanMakePayment = (state: AppState) => state.home.canMakePayment;
