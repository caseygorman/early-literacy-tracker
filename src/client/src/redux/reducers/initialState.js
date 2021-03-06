export default {
  registerUser: {
    newUser: null,
    registerErrorMessage: "",
    registerError: false
  },
  auth: {
    user: null,
    isAuthenticated: false,
    loginErrorMessage: "",
    loginError: false
  },
  students: {
    students: null
  },
  items: null,
  student: {
    student: null,
    fetchingStudent: false
  },
  item: {
    item: null
  },
  // itemUnassignedStudents: {},

  studentUnassignedItems: {
    studentItemSets: null
  },
  studentItems: {
    studentItemSets: {}
  },
  studentTest: {
    testType: "",
    testItems: [],
    submittingTest: false
  },
  testResults: null,
  readingLevels: null,
  groups: null,
  group: null,
  notes: null
};
