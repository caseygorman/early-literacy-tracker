import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as studentUnassignedItemsActions from "../../redux/actions/studentUnassignedItemsActions";
import AssignItemsFormPage from "../../components/Forms/AssignItemsFormPage";

class AssignItemsForm extends Component {
  constructor(props) {
    super(props);
    this.state = { value: [] };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getOptions = this.getOptions.bind(this);
  }

  componentDidMount() {
    console.log("assign items form", this.props);
  }

  handleSubmit(event) {
    event.preventDefault();
    let newStudentItems = {
      student: this.props.student.student.student_id,
      items: this.state.value,
      itemType: this.props.itemType
    };
    let user = this.props.auth.user.token;
    this.props.studentUnassignedItems.assignStudentItems(newStudentItems, user);
  }

  handleChange(e) {
    const options = e.target.options;
    let value = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    this.setState({ value: value });
  }

  getOptions(itemList) {
    console.log("assign items form item list", itemList);
    if (!itemList) {
      return <div>Loading!</div>;
    }

    return (
      <AssignItemsFormPage
        handleSubmit={this.handleSubmit}
        handleChange={this.handleChange}
        itemList={itemList}
        itemType={this.props.itemType}
      />
    );
  }

  render() {
    return <div>{this.getOptions(this.props.itemList)}</div>;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    studentUnassignedItemsActions: bindActionCreators(
      studentUnassignedItemsActions,
      dispatch
    )
  };
}

function mapStateToProps(state) {
  return {
    studentUnassignedItems: state.studentUnassignedItems,
    auth: state.auth
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AssignItemsForm);
