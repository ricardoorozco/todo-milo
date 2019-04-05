//Preparation for the test environment
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require('../modules/login/login.router'));
app.use(require('../modules/user/user.router'));

//TESTS:
const wrongToken = "wrongToken";
let rolAdminToken;
let rolAdminId;
let rolUserToken;
let rolUserId;

describe('--- STARTING LOGIN TESTING ---', () => {
    describe('Test POST', () => {
        test("Login with incorrect data (/login)", (done) => {
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

        test("Login with correct data (/login)", (done) => {
            request(app)
                .post('/login')
                .send({ "email": "super@admin.com", "passwd": "123456" }) //superadmin account
                .type('form')
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    rolAdminToken = resp.body.data.token;
                    rolAdminId = resp.body.data.test;
                    done();
                });
        });
    });
});

describe('--- STARTING USER TESTING ---', () => {
    describe('Test POST', () => {
        test("Create user with USER role (/user)", (done) => {
            request(app)
                .post('/user')
                .set('Authorization', rolAdminToken)
                .send({
                    "username": "newUser",
                    "email": "newUser@gmail.com",
                    "password": "123456"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("User created successfully");
                    done();
                });
        });
    });

    //For give rolUserToken
    test("Login with new user (/login)", (done) => {
        request(app)
            .post('/login')
            .send({ "email": "newUser@gmail.com", "passwd": "123456" })
            .type('form')
            .end((err, resp) => {
                expect(resp.status).toBe(200);
                expect(resp.body.error).toBe(false);
                rolUserToken = resp.body.data.token;
                rolUserId = resp.body.data.test;
                done();
            });
    });

    describe('Test GET', () => {
        test('List users as guest (/user)', (done) => {
            request(app)
                .get('/user')
                .expect('Content-Type', /json/)
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.data.message).toBe("jwt must be provided");
                    done();
                });
        });

        test('List users with wrong token (/user)', (done) => {
            request(app)
                .get('/user')
                .set('Authorization', wrongToken)
                .expect('Content-Type', /json/)
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.data.message).toBe("jwt malformed");
                    done();
                });
        });

        test('List users with USER role (/user)', (done) => {
            request(app)
                .get('/user')
                .set('Authorization', rolUserToken)
                .expect('Content-Type', /json/)
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.data.message).toBe("Unauthorized user");
                    done();
                });
        });

        test('List users with ADMIN role (/user)', (done) => {
            request(app)
                .get('/user')
                .set('Authorization', rolAdminToken)
                .expect('Content-Type', /json/)
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    done();
                });
        });
    });

    describe('Test PUT', () => {
        test("Update data with ADMIN role (/user/:id)", (done) => {
            request(app)
                .put('/user/' + rolUserId)
                .set('Authorization', rolAdminToken)
                .send({
                    "password": "123456"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("User updated successfully");
                    done();
                });
        });

        test("Update data of another user with USER role (/user/:id)", (done) => {
            request(app)
                .put('/user/' + rolAdminId)
                .set('Authorization', rolUserToken)
                .send({
                    "password": "123456"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Unauthorized user");
                    done();
                });
        });

        test("Update own data with USER role (/user/:id)", (done) => {
            request(app)
                .put('/user/' + rolUserId)
                .set('Authorization', rolUserToken)
                .send({
                    "password": "123456"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("User updated successfully");
                    done();
                });
        });
    });

    describe('Test DELETE', () => {

        test("delete user with USER role (/user/:id)", (done) => {
            request(app)
                .delete('/user/' + rolUserId)
                .set('Authorization', rolUserToken)
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Unauthorized user");
                    done();
                });
        });

        test("delete user with ADMIN role (/user/:id)", (done) => {
            request(app)
                .delete('/user/' + rolUserId)
                .set('Authorization', rolAdminToken)
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("User deleted successfully");
                    done();
                });
        });
    });
});