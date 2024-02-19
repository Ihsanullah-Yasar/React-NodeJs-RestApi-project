import React from "react";

import "./Image.css";

const image = (props) => (
  <img
    className="image"
    style={{
      backgroundImage: `url(${props.imageUrl})`,
      backgroundSize: props.contain ? "contain" : "cover",
      backgroundPosition: props.left ? "left" : "center",
    }}
    src={props.imageUrl}
    alt="post illustration"
  />
);

export default image;
