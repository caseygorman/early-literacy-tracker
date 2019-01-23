import React from "react";
import MainButton from "../Buttons/MainButton";
import StudentSnapshot from "./StudentSnapshot";
import DeleteStudent from "../../containers/Forms/DeleteStudent";
import StudentDetailTable from "../Tables/StudentDetailTable";
import StudentDetailHeader from "../Tables/StudentDetailHeader";
import "./static/students.css";
const StudentDetailPage = props => (
  <div className="students">
    <div className="container">
      <div className="display-student-name">
        <b id="student-name">{props.student.student.name}</b>
        <DeleteStudent
          student={props.student.student.student_id}
          id="delete-student-detail"
        />
      </div>
      <div>
        <MainButton
          id="test-student-button"
          text={`Test ${props.student.student.name}'s Words`}
          route={`/test-student/words/${props.student.student.student_id}`}
          onClick={() => props.studentTestActions.beginTest("words")}
        />
        <span />
        <span />
        <MainButton
          id="test-student-button"
          text={`Test ${props.student.student.name}'s Letters`}
          route={`/test-student/letters/${props.student.student.student_id}`}
          onClick={() => props.studentTestActions.beginTest("letters")}
        />
        <span />
        <span />
        <MainButton
          id="test-student-button"
          text={`Test ${props.student.student.name}'s Sounds`}
          route={`/test-student/sounds/${props.student.student.student_id}`}
          onClick={() => props.studentTestActions.beginTest("sounds")}
        />
      </div>
      <br />

      <StudentDetailHeader student={props.student} />

      <StudentSnapshot
        student={props.student}
        tests={props.tests}
        testSentences={props.testSentences}
      />

      <StudentDetailTable student={props.student} />
    </div>
  </div>
);

export default StudentDetailPage;
