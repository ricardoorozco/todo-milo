# ToDo App in NodeJS with Express and MongoDB (JWT and RBAC)

Project for technical test backend from Ricardo Orozco León to Milo Credit

Backend that offers the necessary APIs for the creation of a ToDo App with login and users roles [ADMIN and USER]

Test APIs in POSTMAN:
https://www.getpostman.com/collections/c5180849adaa4f4e8d44

---
### Technologies

 - NodeJS 11
 - Express 4
 - MongoDB 4
 - Jest 24
 - JWT
 - Bcrypt
 - RBAC

---
### Installation

This app requires that you have installed on your system [Node.js](https://nodejs.org/) v11 and [MongoDB](https://www.mongodb.com/) 4

Clone the project
```sh
$ git clone https://github.com/ricardoorozco/todo-milo.git
```

Install the dependencies

Dev environment
```sh
$ cd todo-nodejs
$ npm install -d
```

Prod environment
```sh
$ cd todo-nodejs
$ npm install --production
$ NODE_ENV=prod
```

##### NOTE: In the configure file put your data
./config/config.js


---
### Start

You need first create the *SuperUser*
*user*: superuser
*pass*: 123456
```
db.users.insertOne({
    "username" : "superuser",
    "email" : "superuser@email.com",
    "rol" : "ADMIN",
    "active" : true,
    "created_at" : ISODate("2019-04-03T08:52:38.459Z"),
    "password" : "$2b$10$bo9c72njWKz/JoQPDHNkpOEiwId5UDsHhI9kagj.MXlTRpPkEH07y"
})
```

Dev environment
```sh
$ npm run startNodemon
```

Prod environment
```sh
$ npm run start
```

---
## Contact:
### *Ricardo Orozco León*
*Email:* orozcoleonricardo@gmail.com
*Whatsapp:* [+57 316 4420180](https://api.whatsapp.com/send?phone=573164420180)