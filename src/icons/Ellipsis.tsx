import React from "react";

const Ellipsis = ({style = {}}: {style?: React.CSSProperties}) => (
  <div className="ellipsis-anim" style={style}>
    <span>.</span>
    <span>.</span>
    <span>.</span>
  </div>
);

export default Ellipsis;