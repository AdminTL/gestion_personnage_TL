Authentication
==============

Mode of authentication :
1. With username and password
1. With oauth2 on server side

The user is free to choose one or both solutions.

Username and password
---------------------

* When create user, on client side, the password is asked and encrypted with a salt technique.
* The information is sent to the server and saved in database.
* In database, the password is hashed with Bcrypt : https://en.wikipedia.org/wiki/Bcrypt
* When the user ask to logging, the same information is asked and sent to the server.
* When logging, the information is saved in secure cookies : http://www.tornadoweb.org/en/stable/guide/security.html#cookies-and-secure-cookies

### Advantage

When the server is in offline mode, like in activity without internet, we cannot authenticate with a third-party.
Therefore, this solution is essential to support this feature.

And more, the connection is in https with a validate SSL certificate to secure sensitive data.
The browser will indicate to the client if it's secure or not.

If the database is hacked, the password is protected versus brute-force, see documentation about Bcrypt.

### Disadvantage

The security of this solution is medium, the password sent by the client can be found with brute-force attack in case :
* the server has security exploit,
* a malware watches the user type the password.

The proposed solution is to inform the user to use good password and easy to remember like :
* More than 12 characters
* Use alphanumeric
* Better with punctuation

This software is not enough critical to force user to use a good password rule.

OAuth2 on server side
---------------------

The implementation of OAuth is done with Python Tornado : http://www.tornadoweb.org/en/stable/auth.html

It supports Google, Facebook and Twitter. All the documentation with the how to create credentials is in last link.

When the user click on web page to authenticate with one of three options, redirection is done to call external API.
The server side validate the OAuth identity and find associated user.
After, the client side has the same mechanism as "username and password" with secure cookies.

### Advantage

The security of this solution is high, less risk to got steal the password.

### Disadvantage

This solution will not work in offline mode.

### Configuration

1. Copy file "./database/example_auth.json" to "./database/auth.json" and update the credentials keys.
1. When launch server, put the argument "-l HOST:PORT". This information is necessary for redirection.