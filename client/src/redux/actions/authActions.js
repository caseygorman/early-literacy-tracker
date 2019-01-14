import * as types from "./actionTypes";

function getUserApi() {
  return "http://localhost:5000/api/login";
}

export function checkUser(auth) {
  console.log("checkUser", auth);
  if (!auth.error) {
    return { type: types.SET_USER, auth: auth };
  }
  return { type: types.LOGIN_ERROR, auth: auth };
}

export function logoutUser(auth) {
  console.log("logout action", auth);
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
