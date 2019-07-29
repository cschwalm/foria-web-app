import {getLayout, Layout} from "../../layout";

export interface State {
  layout: Layout;
  profile?: auth0.Auth0UserProfile;
}
export const initialState: State = {
  layout: getLayout()
};

export enum ActionType {
  Resize = "Resize",

  // Authentication success refers to our ability to retrieve an accessToken
  AuthenticationSuccess = "AuthenticationSuccess",
  AuthenticationError = "AuthenticationError",

  // Login success refers to our ability to get back a profile
  LoginSuccess = "LoginSuccess",
  LoginError = "LoginError",
  Logout = "Logout"
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
    case ActionType.LoginSuccess:
      return {
        ...state,
        profile: action.data
      };
    default:
      return state;
  }
};
