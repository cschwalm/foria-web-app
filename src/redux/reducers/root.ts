import {getLayout, Layout} from "../../layout";
import {ActionType as StripeActionType} from "../stripeSaga";
import {ActionType as Auth0ActionType} from "../auth0Saga";
import {ActionType as ApiActionType} from "../apiSaga";
import Action from "../Action";

export enum AuthenticationStatus {
  Pending,
  NoAuth,
  Auth
}

export interface Address {
  venue_name: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface TicketTypeConfig {
  id: string;
  name: string;
  description: string;
  amount_remaining: number;
  price: string;
  currency: string;
  calculated_fee: string;
}

export interface Event {
  name: string;
  address: Address;
  ticket_type_config: [TicketTypeConfig];
  image_url: string;
  start_time: string;
  end_time: string;
  tag_line: string;
  description: string;
}

export interface State {
  layout: Layout;
  eventId: string;
  authenticationStatus: AuthenticationStatus;
  stripe: stripe.Stripe | null;
  profile?: auth0.Auth0UserProfile;
  event?: Event;
  accessToken?: string;
  stripeToken?: stripe.Token;
}

const parseEventIdFromURL = (): string | void => {
  let match = window.location.pathname.match(/^\/events\/(.*)\/$/);
  if (match && match[1]) {
    return match[1];
  }
  window.location.href = "/";
};

export const initialState: State = {
  layout: getLayout(),
  eventId: parseEventIdFromURL() as string,
  authenticationStatus: AuthenticationStatus.NoAuth,
  stripe: null
};

export enum ActionType {
  Resize = "Resize"
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.Resize:
      return {
        ...state,
        layout: getLayout()
      };
    case Auth0ActionType.AuthenticationSuccess:
      return {
        ...state,
        accessToken: action.data,
        authenticationStatus: AuthenticationStatus.Auth
      };
    case Auth0ActionType.AuthenticationError:
      return {
        ...state,
        authenticationStatus: AuthenticationStatus.NoAuth
      };
    case Auth0ActionType.LoginSuccess:
      return {
        ...state,
        profile: action.data
      };
    case ApiActionType.EventFetchSuccess:
      return {
        ...state,
        event: action.data
      };
    case Auth0ActionType.NoExistingSession:
      return {
        ...state,
        authenticationStatus: AuthenticationStatus.NoAuth
      };
    case StripeActionType.StripeInstantiated:
      return {
        ...state,
        stripe: action.data
      };
    case StripeActionType.StripeCreateTokenSuccess:
      return {
        ...state,
        stripeToken: action.data
      };
    default:
      return state;
  }
};
