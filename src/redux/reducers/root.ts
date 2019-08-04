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
  stripe: null,
  // TODO: delete me
  accessToken:
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik56Y3pPVEZHTUVNelJUTkJPVEl4TURGRU1UTkRNRFpDTmtGR01FSTRPREJETnpBMFJFSkRRZyJ9.eyJpc3MiOiJodHRwczovL2F1dGguZm9yaWF0aWNrZXRzLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwOTI5OTA0NzA2NDI2MjYzOTMzNSIsImF1ZCI6WyJhcGkuZm9yaWF0aWNrZXRzLmNvbSIsImh0dHBzOi8vZm9yaWF0aWNrZXRzLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1NjUwNDI4MjUsImV4cCI6MTU2NTA1MDAyNSwiYXpwIjoiNmJ0V3VwRjVSZlFQUE15UkwwOERXT0Y3d1o4WkRqenIiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.KFJpmyKlmmhTbuXP6-d2XpusCzdDxFkdMscSQpVy9dpW9yVT-fCFxiOK4u17ywYJrjytXgzUJJ2O41HmBfx-BX8YP0ZED1TiVX8sakxEOuUq4z_30gm-XEvg41tuMfaL62p3xDmenQzy-bjyywQfsFbXIUhfLQAdUix8oKljwIC8L-unx99SUT9t1fjqFuPpx1i2dz3Cj0gi_D-jNk6_xbEYRkvPxJihAJrf-bCkg7-kOdz8bkiEi7cQqA_MH-2m4aIEIxsuLHm2gO_sQ5fXZABZ10K4fCA0O0WKY0vYiyakkxhayO4-LNbBe8jzIDHhasQVOLcL_euHfsaKFqTL6w"
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
