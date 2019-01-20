import React from "react";
import MainButton from "../Buttons/MainButton";
import StudentSnapshot from "./StudentSnapshot";
// import AssignItems from "../../containers/Forms/AssignItems";
import BasicTablePage from "../Tables/BasicTablePage";
import DeleteStudent from "../../containers/Forms/DeleteStudent";
const StudentDetailPage = props => (
  <div className="student-detail-page">
    <div className="display-student-name">
      {props.student.student.fname}
      <span />
      {props.student.student.lname}
      <DeleteStudent student={props.student.student} />
    </div>

    <MainButton
      id="view-student-word-data-button"
      text={"View Word Data"}
      route={`/word-data${props.student.student.student_id}`}
    />
    <MainButton
      id="view-student-letter-data-button"
      text={"View Letter Data"}
      route={`/letter-data${props.student.student.student_id}`}
    />
    <MainButton
      id="view-student-sound-data-button"
      text={"View Sound Data"}
      route={`/sound-data${props.student.student.student_id}`}
    />
    <MainButton
      id="view-student-data-button"
      text={"View All Student Data"}
      route={`/student-data${props.student.student.student_id}`}
    />

    <StudentSnapshot />

    <BasicTablePage
      itemType={"words"}
      items={props.student.unlearnedWordList}
    />
    <BasicTablePage
      itemType={"letters"}
      items={props.student.unlearnedLetterList}
    />
    <BasicTablePage
      itemType={"sounds"}
      items={props.student.unlearnedSoundList}
    />

    {/* <AssignItems student={props.student} itemType={"words"} />
    <AssignItems student={props.student} itemType={"letters"} />
    <AssignItems student={props.student} itemType={"sounds"} /> */}

    <MainButton
      id="test-student-button"
      text={"Test Student Words"}
      route={`/test-student/${props.student.student.student_id}`}
      onClick={() => props.studentTestActions.beginTest("words")}
    />
    <MainButton
      id="test-student-button"
      text={"Test Student sLetters"}
      route={`/test-student/${props.student.student.student_id}`}
      onClick={() => props.studentTestActions.beginTest("letters")}
    />
    <MainButton
      id="test-student-button"
      text={"Test Student Sounds"}
      route={`/test-student/${props.student.student.student_id}`}
      onClick={() => props.studentTestActions.beginTest("sounds")}
    />
  </div>
);

// import StudentSnapshot from "./StudentSnapshot";
// Display student Name
// Link - word data
// Link - letter data
// link - sound data
// Link -view all data on one page

// Display snapshot of what student is learning

// Just list of words student is learning
// Assign word, letter, sound to student form

// Test student button

export default StudentDetailPage;
