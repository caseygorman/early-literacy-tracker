import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as studentTestActions from "../../redux/actions/studentTestActions";
import "../../components/TestStudent/static/test.css";
import StudentTestPage from "../../components/TestStudent/StudentTestPage";
import image from "../../components/TestStudent/static/giphy.gif";
class StudentTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      studentTestItems: this.props.studentTestItems,
      idx: 0
    };
    this.incrementIdx = this.incrementIdx.bind(this);
    this.handleTestClick = this.handleTestClick.bind(this);
    this.endTest = this.endTest.bind(this);
  }

  displayItem(studentTestItems) {
    if (!studentTestItems) {
      return (
        <div className="test-complete-message">
          {" "}
          <img src={image} alt="Logo" />
        </div>
      );
    }

    return studentTestItems;
  }

  incrementIdx(idx) {
    let new_idx = idx + 1;
    this.setState({ idx: new_idx });
  }

  endTest(e) {
    e.preventDefault();
    if (this.props.studentTest.testItems.length === 0) {
      this.props.history.push(`/details/${this.props.match.params.id}`);
      return;
    }
    this.props.studentTestActions.submitStudentTest(
      this.props.studentTest.testItems,
      this.props.studentTest.testType,
      this.props.student.student_id,
      this.props.user
    );
  }
  handleTestClick(e, studentTestItems, idx) {
    e.preventDefault();
    this.incrementIdx(idx);
    const answeredCorrectly = e.target.value === "yes";

    this.props.studentTestActions.answerQuestion(
      studentTestItems,
      answeredCorrectly
    );
  }

  render() {
    const studentTestItems = this.props.studentTestItems;
    const idx = this.state.idx;
    return (
      <StudentTestPage
        idx={idx}
        studentTestItems={studentTestItems}
        handleTestClick={this.handleTestClick}
        endTest={this.endTest}
        incrementIdx={this.incrementIdx}
        displayItem={this.displayItem}
      />
    );
  }
}

const StudentTestWrapped = withRouter(StudentTest);

function mapStateToProps(state) {
  return {
    studentTest: state.studentTest
  };
}

function mapDispatchToProps(dispatch) {
  return {
    studentTestActions: bindActionCreators(studentTestActions, dispatch)
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StudentTestWrapped);
