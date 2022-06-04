# CGPS User Accounts

User account login based on a boilerplate Node.js app (https://github.com/nikolaydyankov/node-social-auth).

## Strategies

- Facebook
- Google
- Twitter
- Passwordless (email)
- LDAP

## Tokens

Tokens are provided by `passport-jwt`. This is not counted as a strategy as it does not create accounts, it provides sessionless authorisation for existing accounts.
