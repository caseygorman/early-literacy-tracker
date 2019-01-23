import React from "react";
import BasicTablePage from "../Tables/BasicTablePage";
const ItemDetailPage = props => (
  <div className="container">
    <h1>{props.item.item.item}</h1>

    <BasicTablePage items={props.item} />
  </div>
);

export default ItemDetailPage;
