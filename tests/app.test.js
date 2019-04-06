//Preparation for the test environment
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Modules to test
app.use(require('../modules/login/login.router'));
app.use(require('../modules/user/user.router'));
app.use(require('../modules/task/task.router'));

//TESTS:
const wrongToken = "wrongToken";
let rolAdminToken;
let rolAdminId;
let rolUserToken;
let rolUserId;
let taskUserId;
let taskAdminId;

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

describe('--- STARTING TASK TESTING ---', () => {
    describe('Test POST', () => {
        test("Create task with USER role (/task)", (done) => {
            request(app)
                .post('/task')
                .set('Authorization', rolUserToken)
                .send({
                    "task": "Task",
                    "responsable": rolUserId
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Unauthorized user");
                    done();
                });
        });

        test("Create task with ADMIN role - responsable USER (/task)", (done) => {
            request(app)
                .post('/task')
                .set('Authorization', rolAdminToken)
                .send({
                    "task": "Task",
                    "responsable": rolUserId
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("Task created successfully");
                    taskUserId = resp.body.data.test;
                    done();
                });
        });

        test("Create another task with ADMIN role - responsable ADMIN (/task)", (done) => {
            request(app)
                .post('/task')
                .set('Authorization', rolAdminToken)
                .send({
                    "task": "Task",
                    "responsable": rolAdminId
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("Task created successfully");
                    taskAdminId = resp.body.data.test;
                    done();
                });
        });
    });

    describe('Test GET', () => {
        test('List tasks with USER (/task)', (done) => {
            request(app)
                .get('/task')
                .set('Authorization', rolUserToken)
                .expect('Content-Type', /json/)
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.tasks.length).toBe(1); //Own task
                    done();
                });
        });

        test('List tasks with ADMIN (/task)', (done) => {
            request(app)
                .get('/task')
                .set('Authorization', rolAdminToken)
                .expect('Content-Type', /json/)
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.tasks.length).toBe(2); //Own task and USER task
                    done();
                });
        });
    });

    describe('Test PUT', () => {
        test("Update task of another user with USER (/task/:id)", (done) => {
            request(app)
                .put('/task/' + taskAdminId)
                .set('Authorization', rolUserToken)
                .send({
                    "status": "CANCELED"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(404);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Task not found");
                    done();
                });
        });

        test("Update task of another user with ADMIN (/task/:id)", (done) => {
            request(app)
                .put('/task/' + taskUserId)
                .set('Authorization', rolAdminToken)
                .send({
                    "status": "CANCELED"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("Task updated successfully");
                    done();
                });
        });

        test("Update own task (/task/:id)", (done) => {
            request(app)
                .put('/task/' + taskUserId)
                .set('Authorization', rolUserToken)
                .send({
                    "status": "DONE"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("Task updated successfully");
                    done();
                });
        });

        test("Update task with wrong status: INCOMPLETE (/task/:id)", (done) => {
            request(app)
                .put('/task/' + taskUserId)
                .set('Authorization', rolUserToken)
                .send({
                    "status": "INCOMPLETE"
                })
                .end((err, resp) => {
                    expect(resp.status).toBe(400);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Validation failed: status: INCOMPLETE is not a valid status");
                    done();
                });
        });
    });

    describe('Test DELETE', () => {

        test("delete task with USER (/task/:id)", (done) => {
            request(app)
                .delete('/task/' + taskUserId)
                .set('Authorization', rolUserToken)
                .end((err, resp) => {
                    expect(resp.status).toBe(401);
                    expect(resp.body.error).toBe(true);
                    expect(resp.body.data.message).toBe("Unauthorized user");
                    done();
                });
        });

        test("delete USER's task with ADMIN (/task/:id)", (done) => {
            request(app)
                .delete('/task/' + taskUserId)
                .set('Authorization', rolAdminToken)
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("Task deleted successfully");
                    done();
                });
        });

        test("delete ADMIN's task with ADMIN (/task/:id)", (done) => {
            request(app)
                .delete('/task/' + taskUserId)
                .set('Authorization', rolAdminToken)
                .end((err, resp) => {
                    expect(resp.status).toBe(200);
                    expect(resp.body.error).toBe(false);
                    expect(resp.body.data.message).toBe("Task deleted successfully");
                    done();
                });
        });
    });
});