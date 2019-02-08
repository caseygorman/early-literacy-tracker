import * as types from "./actionTypes";
import history from "../../history";
function assignGroupApi() {
  return "http://34.217.207.162/api/assign-group";
}

function addGroupApi() {
  return "http://34.217.207.162/api/add-group";
}

function fetchGroupsApi() {
  return "http://34.217.207.162/api/all-groups";
}
function fetchGroupApi(group) {
  return `http://34.217.207.162/api/group-detail/${group}`;
}
function deleteGroupApi() {
  return "http://34.217.207.162/api/delete-group";
}

function addNoteApi() {
  return `http://34.217.207.162/api/add-note`;
}

function deleteNoteApi() {
  return "http://34.217.207.162/api/delete-note";
}
export function receiveStudent(student) {
  return { type: types.RECEIVE_STUDENT, student: student };
}
export function receiveGroups(groups) {
  return { type: types.RECEIVE_GROUPS, groups: groups };
}

export function receiveGroup(group) {
  return { type: types.RECEIVE_GROUP, group: group };
}

export function assignGroup(students, groupName, user) {
  return dispatch => {
    return fetch(assignGroupApi(), {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        "x-access-token": user
      },
      body: JSON.stringify({ students, groupName })
    })
      .then(() => alert("added!"))
      .then(() => dispatch(fetchGroups(user)))
      .then(() => history.push("/manage-groups"));
  };
}

export function fetchGroups(user) {
  return dispatch => {
    return fetch(fetchGroupsApi(), {
      method: "GET",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        "x-access-token": user
      }
    })
      .then(response => response.json())
      .then(groups => dispatch(receiveGroups(groups)));
  };
}

export function fetchGroup(group, user) {
  return dispatch => {
    return fetch(fetchGroupApi(group), {
      method: "GET",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        "x-access-token": user
      }
    })
      .then(response => response.json())
      .then(group => dispatch(receiveGroup(group)));
  };
}

export function addGroup(groupName, user) {
  return dispatch => {
    return (
      fetch(addGroupApi(), {
        method: "POST",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": user
        },
        body: JSON.stringify(groupName)
      })
        // .then(response => response.json())
        .then(() => dispatch(fetchGroups(user)))
        .then(() => history.push("/manage-groups"))
    );
  };
}

export function deleteGroup(group, user) {
  return dispatch => {
    return (
      fetch(deleteGroupApi(), {
        method: "POST",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": user
        },
        body: JSON.stringify(group)
      })
        // .then(response => response.json())
        .then(() => dispatch(fetchGroups(user)))
        .then(history.push("/manage-groups"))
    );
  };
}

export function addNote(note, group, user) {
  console.log("user", user);
  return dispatch => {
    return (
      fetch(addNoteApi(), {
        method: "POST",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": user
        },
        body: JSON.stringify({ note, group })
      })
        // .then(response => response.json())
        .then(() => dispatch(fetchGroup(group, user)))
        .then(history.push(`/group-detail/${group}`))
    );
  };
}

export function deleteNote(note, user, group) {
  console.log(note);
  return dispatch => {
    return (
      fetch(deleteNoteApi(), {
        method: "POST",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": user
        },
        body: JSON.stringify(note)
      })
        // .then(response => response.json())
        .then(() => dispatch(fetchGroup(group, user)))
        .then(history.push(`/group-detail/${group}`))
    );
  };
}
