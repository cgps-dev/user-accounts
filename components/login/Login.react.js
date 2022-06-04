import React from "react";
import PropTypes from "prop-types";

import LoginLinks from "./LoginLinks.react";

const Login = ({ message, appName = "Microreact", strategies, additional, termsLink }) => (
  <section className="cgps-login">
    <h3 className="cgps-heading">Sign in to your {appName} account</h3>
    { message && <p className="cgps-login-message">{message}</p> }
    <div className="cgps-login-links-wrapper">
      <LoginLinks strategies={strategies}>
        {additional}
      </LoginLinks>
    </div>
    {
      termsLink &&
        <p className="cgps-login-tos">
          By signing in, you are agreeing to our {termsLink}.
        </p>
    }
    <h4 className="cgps-heading">Access to Information</h4>
    <p>
      {appName} accesses your <strong>name</strong>, <strong>email</strong>,
      and <strong>profile photo</strong> when signing in
      with <strong>Google</strong>, <strong>Twitter</strong>, or <strong>Facebook</strong>.
    </p>
    <p>
      Other information, such as <strong>tweets</strong> and <strong>Facebook friends</strong>,
      will not be accessed or stored by {appName}.
    </p>
  </section>
);

Login.displayName = "Login";

Login.propTypes = {
  message: PropTypes.string,
  appName: PropTypes.string,
  strategies: PropTypes.arrayOf(PropTypes.string),
  additional: PropTypes.node,
  termsLink: PropTypes.node,
};

export default Login;
