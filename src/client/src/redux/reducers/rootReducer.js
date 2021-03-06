import { combineReducers } from "redux";
import registerUser from "./registerReducer";
import auth from "./authReducers";
import students from "./studentsReducers";
import items from "./itemsReducer";
import student from "./studentReducer";
import studentItems from "./studentItemsReducer";
import item from "./itemReducer";
import studentTest from "./studentTestReducer";
import studentUnassignedItems from "./studentUnassignedItemsReducer";
// import itemUnassignedStudents from "./itemUnassignedStudentsReducer";
import testResults from "./testResultsReducers";
import readingLevels from "./readingLevelsReducers";
import groups from "./groupsReducers";
import group from "./groupReducers";
import notes from "./notesReducers";
const rootReducer = combineReducers({
  registerUser,
  auth,
  students,
  items,
  item,
  student,
  studentItems,
  studentUnassignedItems,
  studentTest,
  testResults,
  readingLevels,
  groups,
  group,
  notes
});

export default rootReducer;
