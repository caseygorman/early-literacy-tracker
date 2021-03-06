import React from "react";
import { Table } from "react-bootstrap";
const TestResultsTable = (testResults, onSort) => (
  <div>
    <h3>Past test results</h3>
    <Table striped bordered condensed hover>
      <thead>
        <tr>
          <th onClick={e => onSort(e, "testDate")}>Test taken</th>
          <th onClick={e => onSort(e, "score")}>Score</th>
          <th onClick={e => onSort(e, "correctItems")}>Correct</th>
          <th onClick={e => onSort(e, "incorrectItems")}>Incorrect</th>
        </tr>
      </thead>
      <tbody>
        {testResults.map(function(testResults) {
          return (
            <tr>
              <td>{testResults.testDate}</td>
              <td>{testResults.score}</td>
              <td>
                <ul>
                  {testResults.correctItems.map(item => (
                    <li>{item}</li>
                  ))}
                </ul>
              </td>
              <td>
                <ul>
                  {testResults.incorrectItems.map(item => (
                    <li>{item}</li>
                  ))}
                </ul>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  </div>
);

export default TestResultsTable;
