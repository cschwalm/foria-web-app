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

export const FREE_TICKET_PRICE = "0.00";

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
  id: string;
  name: string;
  address: Address;
  ticket_type_config: TicketTypeConfig[];
  image_url: string;
  start_time: string;
  end_time: string;
  tag_line: string;
  description: string;
  type: string;
}

export interface State {
  layout: Layout;
  eventId: string | null;
  authenticationStatus: AuthenticationStatus;
  stripe: stripe.Stripe | null;
  profile?: auth0.Auth0UserProfile;
  isSpotifyLinked: boolean;
  event?: Event;
  accessToken?: string;
}

const getEventIdFromUrl = (): string | null => {
  let params = new URLSearchParams(window.location.search);
  let eventId = params.get("eventId");
  if (eventId != null) {
    return eventId;
  } else {
      return null;
  }
};

const isEvent = () : boolean => {
    return window.location.pathname !== '/sign-up';
};

export const initialState: State = {
  layout: getLayout(),
  eventId: isEvent() ? getEventIdFromUrl() as string : null,
  authenticationStatus: AuthenticationStatus.NoAuth,
  stripe: null,
  isSpotifyLinked: false
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

      const profile: any = action.data;
      let spotifyId = null;
      if (profile["https://foriatickets.com/spotify/user_id"] !== undefined) {
          spotifyId = profile["https://foriatickets.com/spotify/user_id"] as string;
      }

      return {
          ...state,
          profile: action.data,
          isSpotifyLinked: (spotifyId != null)
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
    case ApiActionType.LinkAccountSuccess:
        localStorage.clear();
      return {
          ...state,
          isSpotifyLinked: true
      };
    default:
      return state;
  }
};
