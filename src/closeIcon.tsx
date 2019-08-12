import React from "react";

import {trolleyGray} from "./colors";

export default ({onClick = () => {}}: {onClick?: (event: object) => void}) => (
  <svg
    width="0.7em"
    height="0.8em"
    version="1.1"
    viewBox="0 0 14 14"
    xmlns="http://www.w3.org/2000/svg"
    onClick={onClick}>
    <title />
    <desc />
    <defs />
    <g fill="none" fillRule="evenodd" id="Page-1" stroke="none" strokeWidth="1">
      <g
        fill={trolleyGray}
        id="Core"
        transform="translate(-341.000000, -89.000000)">
        <g id="close" transform="translate(341.000000, 89.000000)">
          <path
            d="M14,1.4 L12.6,0 L7,5.6 L1.4,0 L0,1.4 L5.6,7 L0,12.6 L1.4,14 L7,8.4 L12.6,14 L14,12.6 L8.4,7 L14,1.4 Z"
            id="Shape"
          />
        </g>
      </g>
    </g>
  </svg>
);
