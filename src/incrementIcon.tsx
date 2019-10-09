import React from "react";

import {vividRaspberry, trolleyGray} from "./colors";

export default ({disabled = false}: {disabled?: boolean}) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 19 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.50001 4.90996V14.09M4.90997 9.5H14.09M18 9.5C18 14.1944 14.1944 18 9.5 18C4.80558 18 1 14.1944 1 9.5C1 4.80558 4.80558 1 9.5 1C14.1944 1 18 4.80558 18 9.5Z"
      stroke={disabled ? trolleyGray : vividRaspberry}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
