const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('../modules/login/login.router'));
app.use(require('../modules/user/user.router'));

//TESTS:
const badToken = "qwerty";
let rolUserToken;
let rolAdminToken;

describe('INIT LOGIN TESTING', () => {
    describe('TEST /POST', () => {
        test("Login with incorrect data", function(done) {
            request(app)
                .post('/login')
                .send({ "email": "no@user.com", "passwd": "nopass" })
                .type('form')
                .end((err, resp) => {
                    expect(resp.status).toBe(404);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Username or password incorrect");
                    done();
                });
        });

        test("Login with correct data", function(done) {
            request(app)
                .post('/login')
                .send({ "email": "super@admin.com", "passwd": "123456" }) //superadmin account
                .type('form')
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    rolAdminToken = resp.body.data.token;
                    done();
                });
        });
    });
});