import React, { Component } from "react";
import { connect } from "react-redux";
import * as studentsActions from "../../redux/actions/studentsActions";
import * as authActions from "../../redux/actions/authActions";
import AllStudents from "../../components/Students/AllStudents";

class ViewStudents extends Component {
  componentDidMount() {
    if (this.props.auth.isAuthenicated === false) {
      alert("Please log in");
      this.props.history.push("/login");
    }
    const user = this.props.auth.user.token;
    this.props.studentsActions.fetchStudents(user);
  }

  displayAllStudents(students, token) {
    if (!token) {
      return <div>no token...</div>;
    }
    return <AllStudents token={token} students={students} />;
  }

  render() {
    return this.displayAllStudents(
      this.props.students,
      this.props.auth.user.token
    );
  }
}
function mapStateToProps(state) {
  return {
    students: state.students,
    auth: state.auth
  };
}

function mapDispatchToProps(dispatch) {
  return {
    studentsActions: studentsActions,
    dispatch,
    authActions: authActions
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ViewStudents);