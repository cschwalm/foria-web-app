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
  authorized_amount: number;
  amount_remaining: number;
  price: string;
  currency: string;
}

export interface TicketFeeConfig {
  id: string;
  name: string;
  description: string;
  method: string;
  type: string;
  amount: string;
  currency: string;
}

export interface Event {
  name: string;
  address: Address;
  ticket_type_config: [TicketTypeConfig];
  ticket_fee_config: [TicketFeeConfig];
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

export const initialState: State = {
  layout: getLayout(),
  // TODO: parse from URL
  eventId: "52991c6d-7703-488d-93ae-1aacdd7c4291",
  authenticationStatus: AuthenticationStatus.Pending,
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
