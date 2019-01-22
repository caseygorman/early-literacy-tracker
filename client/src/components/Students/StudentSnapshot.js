import React from "react";

const StudentSnapshot = props => (
  <div>
    <h3>
      {props.student.student.name}
      <span />
      's Snapshot
    </h3>
    {props.student.student.name} knows {props.student.wordCount}/
    {props.student.totalWordCount} words, {props.student.letterCount}/
    {props.student.totalLetterCount} letters, and {props.student.soundCount}/
    {props.student.totalSoundCount} sounds. {props.student.student.name}'s last
    word test was {props.student.lastWordTest} and they scored ///.{" "}
    {props.student.student.name}'s last word test was{" "}
    {props.student.lastLetterTest} and they scored ///.{" "}
    {props.student.student.name}'s last word test was{" "}
    {props.student.lastSoundTest} and they scored ///. <br />
    <br />
    <br />
    {/* {props.student.student.name} sabe {props.student.wordCount}/
    {props.student.totalWordCount} palabras, {props.student.letterCount}/
    {props.student.totalLetterCount} letras, y {props.student.soundCount}/
    {props.student.totalSoundCount} sonidos. La prueba ultima de{" "}
    {props.student.student.name} fue word test was {props.student.lastWordTest}{" "}
    y el/ella recibio ///. La prueba ultima de {props.student.student.name} fue{" "}
    {props.student.lastLetterTest} y el/ella recibio ///. La prueba ultima de{" "}
    {props.student.student.name} fue {props.student.lastSoundTest} y el/ella
    recibio ///.{" "} */}
  </div>
);

export default StudentSnapshot;
