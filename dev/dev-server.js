const path = require("path");

const express = require("express");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const MongoSessionStore = require("connect-mongo")(session);

const mongoose = require("mongoose");

const config = require("./config.json");
const userAccounts = require("../src/index");

const app = express();
const port = process.env.PORT || 8001;
const dbUrl = config.dbUrl;

// connect to mongo
mongoose.connect(dbUrl);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userStore = require("./user-store");

// required for passport
app.use(
  session({
    secret: "gx48B3GxWDFTbgEZhprjVcYpXrHfJsj2",
    store: new MongoSessionStore({
      url: dbUrl,
    }),
    resave: true,
    saveUninitialized: true,
  })
);

// setup the dev app and serve static content
const publicPath = path.join(__dirname, "dev");
app.use(express.static(publicPath));

// configure user accounts
userAccounts(app, {
  userStore,
  url: config.url,
  authPath: "/auth",
  successRedirect: "/",
  failureRedirect: "/login",
  logoutPath: "/logout",
  logoutRedirect: "/",
  strategies: config.strategies,
  tokens: config.tokens,
});

app.get("/login", (req, res) => {
  res.send(`
    <a class="login-button login-button--google" href="/auth/google">
      <div class="login-button__icon-container"><span class="login-button__icon"></span></div>
      <div class="login-button__text">Google</div>
    </a>
    <a class="login-button login-button--facebook" href="/auth/facebook">
      <div class="login-button__icon-container"><span class="login-button__icon"></span></div>
      <div class="login-button__text">Facebook</div>
    </a>
    <a class="login-button login-button--twitter" href="/auth/twitter">
      <div class="login-button__icon-container"><span class="login-button__icon"></span></div>
      <div class="login-button__text">Twitter</div>
    </a>
    <a class="login-button login-button--ldap" href="/auth/ldap">
      <div class="login-button__icon-container"><span class="login-button__icon"></span></div>
      <div class="login-button__text">LDAP</div>
    </a>

    <style>
    .login-button {
        background: #3c7383;
        border-radius: 3px;
        border: 1px solid transparent;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        height: 38px;
        line-height: 36px;
        margin: 8px 2px;
        max-width: 240px;
        text-align: center;
        text-decoration: none;
    }
    .login-button__icon-container {
        border-right: 1px solid rgba(0, 0, 0, 0.1);
        box-sizing: border-box;
        float: left
        height: 100%;
        line-height: 1;
        padding: 10px 0;
        width: 38px;
    }

    .login-button__icon {
        display: inline-block;
        width: 16px;
        height: 16px
    }

    .login-button__text {
        color: #fff;
        padding: 0 8px;
        flex-shrink: 1;
    }

    .login-button--google {
        background: #e0492f
    }

    .login-button--google .login-button__icon {
        background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4NCiAgICAgICAgPGcgZmlsbD0iI2ZmZmZmZiI+DQogICAgICAgICAgICA8cGF0aCBkPSJNMTAuMzQ5OTQyOSw2LjQ2ODc1IEMxMC40MTY2ODU3LDYuODM2NTAzNTcgMTAuNDUzMTQyOSw3LjIyMTU0Mjg2IDEwLjQ1MzE0MjksNy42MjM2NzE0MyBDMTAuNDUzMTQyOSwxMC43NjU2MjUgOC40MTM0MDk1MiwxMyA1LjMzMzMzMzMzLDEzIEMyLjM4NjcwNDc2LDEzIDAsMTAuNTM4NzEwNyAwLDcuNSBDMCw0LjQ2MTI4OTI5IDIuMzg2NzA0NzYsMiA1LjMzMzMzMzMzLDIgQzYuNzczNDQ3NjIsMiA3Ljk3NjU3MTQzLDIuNTQ2NTAzNTcgOC45MDAwNzYxOSwzLjQzMzQxNzg2IEw3LjM5NjQ5NTI0LDQuOTgzODI4NTcgTDcuMzk2NDk1MjQsNC45ODAyOTI4NiBDNi44MzY2MDk1Miw0LjQzMDI1MzU3IDYuMTI2NjY2NjcsNC4xNDg0NTcxNCA1LjMzMzMzMzMzLDQuMTQ4NDU3MTQgQzMuNTczNDA5NTIsNC4xNDg0NTcxNCAyLjE0MzM5MDQ4LDUuNjgxNTQyODYgMi4xNDMzOTA0OCw3LjQ5NjY2MDcxIEMyLjE0MzM5MDQ4LDkuMzExNDI1IDMuNTczNDA5NTIsMTAuODQ4MjAzNiA1LjMzMzMzMzMzLDEwLjg0ODIwMzYgQzYuOTMwMDE5MDUsMTAuODQ4MjAzNiA4LjAxNjYwOTUyLDkuOTA2MjUgOC4yNDAyNjY2Nyw4LjYxMzgyODU3IEw1LjMzMzMzMzMzLDguNjEzODI4NTcgTDUuMzMzMzMzMzMsNi40Njg3NSBMMTAuMzQ5OTQyOSw2LjQ2ODc1IEwxMC4zNDk5NDI5LDYuNDY4NzUgWiBNMTQuMzMzMzMzMyw1LjA5Mzc1IEwxMyw1LjA5Mzc1IEwxMyw2LjgxMjUgTDExLjMzMzMzMzMsNi44MTI1IEwxMS4zMzMzMzMzLDguMTg3NSBMMTMsOC4xODc1IEwxMyw5LjkwNjI1IEwxNC4zMzMzMzMzLDkuOTA2MjUgTDE0LjMzMzMzMzMsOC4xODc1IEwxNiw4LjE4NzUgTDE2LDYuODEyNSBMMTQuMzMzMzMzMyw2LjgxMjUgTDE0LjMzMzMzMzMsNS4wOTM3NSBaIi8+DQogICAgICAgIDwvZz4NCiAgICA8L2c+DQo8L3N2Zz4=")
    }

    .login-button--facebook {
        background: #395697
    }

    .login-button--facebook .login-button__icon {
        background-image: url("data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTZweCIgaGVpZ2h0PSIxNnB4IiB2aWV3Qm94PSIwIDAgMTYgMTYiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4NCiAgICA8ZyBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTYsMCkiPg0KICAgICAgICA8ZyBmaWxsPSIjZmZmZmZmIj4NCiAgICAgICAgICA8cGF0aCBkPSJtIDI3LjUsNS4xODA4NzM1IC0yLjM4Mzk1NCwwIDAsLTEuNjYwNjA4NSBjIDAsLTAuNjIzNjM5IDAuMzg5MTY2LC0wLjc2OTAzMzQgMC42NjMyNjYsLTAuNzY5MDMzNCBsIDEuNjgyMzMzLDAgMCwtMi43NDE2MjY5NiBMIDI1LjE0NDczNCwwIGMgLTIuNTcxOTg4LDAgLTMuMTU3Mjk2LDIuMDQ0Nzk0IC0zLjE1NzI5NiwzLjM1MzM0MyBsIDAsMS44Mjc1MzA1IC0xLjQ4NzQzOCwwIDAsMi44MjUwODggMS40ODc0MzgsMCAwLDcuOTk0MDM4NSAzLjEyODYwOCwwIDAsLTcuOTk0MDM4NSAyLjExMTEwMSwwIDAuMjcyODUzLC0yLjgyNTA4OCAwLDAgeiIgLz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg==")
    }

    .login-button--twitter {
        background: #00ACED
    }

    .login-button--twitter .login-button__icon {
      background-image: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2072%2072%22%3E%3Cpath%20fill%3D%22none%22%20d%3D%22M0%200h72v72H0z%22%2F%3E%3Cpath%20class%3D%22icon%22%20fill%3D%22%23ffffff%22%20d%3D%22M68.812%2015.14c-2.348%201.04-4.87%201.744-7.52%202.06%202.704-1.62%204.78-4.186%205.757-7.243-2.53%201.5-5.33%202.592-8.314%203.176C56.35%2010.59%2052.948%209%2049.182%209c-7.23%200-13.092%205.86-13.092%2013.093%200%201.026.118%202.02.338%202.98C25.543%2024.527%2015.9%2019.318%209.44%2011.396c-1.125%201.936-1.77%204.184-1.77%206.58%200%204.543%202.312%208.552%205.824%2010.9-2.146-.07-4.165-.658-5.93-1.64-.002.056-.002.11-.002.163%200%206.345%204.513%2011.638%2010.504%2012.84-1.1.298-2.256.457-3.45.457-.845%200-1.666-.078-2.464-.23%201.667%205.2%206.5%208.985%2012.23%209.09-4.482%203.51-10.13%205.605-16.26%205.605-1.055%200-2.096-.06-3.122-.184%205.794%203.717%2012.676%205.882%2020.067%205.882%2024.083%200%2037.25-19.95%2037.25-37.25%200-.565-.013-1.133-.038-1.693%202.558-1.847%204.778-4.15%206.532-6.774z%22%2F%3E%3C%2Fsvg%3E");
    }
    </style>
  `);
});

app.get("/", (req, res) => {
  // if user is authenticated, continue on
  if (req.isAuthenticated()) {
    res.send(`
      Logged in user: ${JSON.stringify(req.user)}
    `);
  } else {
    res.redirect("/login");
  }
});

// launch
app.listen(port);

console.log(`The server is running on port ${port}`);
