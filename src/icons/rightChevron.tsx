import React from "react";

export default ({onClick = () => {}}: {onClick?: (event: object) => void}) => (
  <svg
    height="100%"
    onClick={onClick}
    aria-hidden="true"
    focusable="false"
    data-prefix="fas"
    data-icon="chevron-left"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 380 512">
    <path
      fill="currentColor"
      d="m335 274c0 3-1 5-3 7l-133 133c-2 2-5 3-7 3-2 0-5-1-7-3l-14-14c-2-2-3-4-3-7 0-2 1-5 3-6l112-113-112-112c-2-2-3-4-3-7 0-2 1-4 3-6l14-14c2-2 5-3 7-3 2 0 5 1 7 3l133 133c2 2 3 4 3 6z"
    />
  </svg>
);
