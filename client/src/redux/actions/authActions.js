import * as types from "./actionTypes";

function getUserApi() {
  return "http://localhost:5000/api/login";
}

function requestResetPasswordApi() {
  return "http://localhost:5000/api/request-reset-password";
}
function resetPasswordApi() {
  return "http://localhost:5000/api/reset-password";
}
export function checkUser(auth) {
  if (!auth.error) {
    return { type: types.SET_USER, auth: auth };
  }
  return { type: types.LOGIN_ERROR, auth: auth };
}

export function logoutUser(auth) {
  return { type: types.LOGOUT_USER, auth: auth };
}

export function clearErrors() {
  return { type: types.CLEAR_ERRORS };
}

export function loginUser(user) {
  return dispatch => {
    return fetch(getUserApi(), {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    })
      .then(response => response.json())
      .then(user => dispatch(checkUser(user)))
      .catch(err => console.error(err));
  };
}

export function resetPassword(user) {
  console.log("user", user);
  return dispatch => {
    return fetch(resetPasswordApi(), {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });
    // .then(user => dispatch(checkUser(user)))
    // .catch(err => console.error(err));
  };
}

export function requestResetPassword(user) {
  return dispatch => {
    return fetch(requestResetPasswordApi(), {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    }).then(response => response.json());
    // .then(user => dispatch(checkUser(user)))
    // .catch(err => console.error(err));
  };
}
