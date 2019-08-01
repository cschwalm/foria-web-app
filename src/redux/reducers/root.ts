import {getLayout, Layout} from "../../layout";

export enum AuthenticationStatus {
  Pending,
  NoAuth,
  Auth
}

export interface Address {
  street_address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Event {
  name: string;
  address: Address;
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
  profile?: auth0.Auth0UserProfile;
  event?: Event;
  accessToken?: string;
}

export const initialState: State = {
  layout: getLayout(),
  // TODO: parse from URL
  eventId: "a42205c9-f7fc-4371-80e4-99b73385f462",
  authenticationStatus: AuthenticationStatus.Pending
};

export enum ActionType {
  Resize = "Resize",

  // checkSession yielded no existing session
  NoExistingSession = "NoExistingSession",

  // Authentication success indicates presence of accessToken
  AuthenticationSuccess = "AuthenticationSuccess",
  AuthenticationError = "AuthenticationError",

  // Login success refers to our ability to get back a profile
  LoginSuccess = "LoginSuccess",
  LoginError = "LoginError",
  Logout = "Logout",

  EventFetchError = "EventFetchError",
  EventFetchSuccess = "EventFetchSuccess",
}
export interface Action {
  type: ActionType;
  data?: any;
}

export const reducer = (state = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.Resize:
      return {
        ...state,
        layout: getLayout()
      };
    case ActionType.AuthenticationSuccess:
      return {
        ...state,
        accessToken: action.data,
        authenticationStatus: AuthenticationStatus.Auth
      };
    case ActionType.AuthenticationError:
      return {
        ...state,
        authenticationStatus: AuthenticationStatus.NoAuth
      };
    case ActionType.LoginSuccess:
      return {
        ...state,
        profile: action.data
      };
    case ActionType.EventFetchSuccess:
      return {
        ...state,
        event: action.data
      };
    case ActionType.NoExistingSession:
      return {
        ...state,
        authenticationStatus: AuthenticationStatus.NoAuth
      };
    default:
      return state;
  }
};
