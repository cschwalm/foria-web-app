import React from "react";

import {antiFlashWhite, trolleyGray} from "../utils/colors";

export default () => (
  <svg
    width="30"
    height="31"
    viewBox="0 0 30 31"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="15" cy="15.9792" r="15" fill={antiFlashWhite} />
    <g transform="translate(7,7.9896)">
      <path
        d="M8.71164 1.41125L3.47645 6.64645L2.62289 7.5H3.83H15.5V8.5H3.83H2.62442L3.47613 9.35324L8.70321 14.5897L8 15.2929L0.707107 8L8.00125 0.70586L8.71164 1.41125Z"
        stroke={trolleyGray}
      />
    </g>
  </svg>
);
