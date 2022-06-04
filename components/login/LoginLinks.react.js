import "./LoginLinks.css";

import React from "react";
import PropTypes from "prop-types";

const LoginLinks = ({ strategies = [], children }) => (
  <div className="cgps-login-links">
    {
      strategies
        .filter((item) => (item !== "passwordless"))
        .map(
          (strategy) => (
            <a
              key={strategy}
              className={`cgps-login-button cgps-login-button--${strategy}`}
              href={`/auth/${strategy}`}
            >
              <div className="cgps-login-button__icon" />
              <div className="cgps-login-button__text">
                Continue with <span className="provider">{ strategy }</span>
              </div>
            </a>
          )
        )
    }
    { children }
  </div>
);

LoginLinks.propTypes = {
  strategies: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
  contactEmail: PropTypes.string,
};

export default LoginLinks;
