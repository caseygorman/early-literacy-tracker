import initialState from "./initialState";
import configureStore from "../store/configureStore";
import { persistStore } from "redux-persist";
import {
  SET_USER,
  LOGIN_ERROR,
  CLEAR_ERRORS,
  LOGOUT_USER
} from "../actions/actionTypes";

export default function auth(state = initialState.auth, action) {
  switch (action.type) {
    case SET_USER:
      return Object.assign({}, state, {
        user: action.auth,
        isAuthenticated: true,
        loginError: false,
        loginErrorMessage: ""
      });
    case LOGIN_ERROR:
      return Object.assign({}, state, {
        user: null,
        isAuthenticated: false,
        loginError: true,
        loginErrorMessage: action.auth.error
      });
    case CLEAR_ERRORS:
      return Object.assign({}, state, {
        user: null,
        isAuthenticated: false,
        loginError: false,
        loginErrorMessage: ""
      });
    case LOGOUT_USER:
      localStorage.clear();
      const store = configureStore(initialState);
      const persistor = persistStore(store);
      persistor.purge();
      return Object.assign({}, state, {
        user: null,
        isAuthenticated: false,
        loginError: false,
        loginErrorMessage: ""
      });

    default:
      return state;
  }
}
