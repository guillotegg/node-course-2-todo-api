const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../model/todo');
const {User} = require('./../model/user');
const {todos, users, populateTodos, populateUsers} = require('./seed/seed');


beforeEach(populateTodos);  
beforeEach(populateUsers);  

describe('POST /Todos', () => {
    it('should create a new todo', (done) => {
        const text = 'test todo text';
        
        request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        })
    })

    it('should not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });   
    });  
});

describe('POST /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return 404', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });

    it('should return 400', (done) => {
        request(app)
        .get('/todos/123')
        .expect(400)
        .end(done);
    });

});

describe('DELETE /todos/:id', () => {
    it('should delete todo', (done) => {
        var hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
               
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeNull();
                    done();
                }).catch((e) => done(e));                
            });
    });

    it('should return 404', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });

    it('should return 400', (done) => {
        request(app)
        .delete('/todos/123')
        .expect(400)
        .end(done);
    });
});

describe('PATCH /todos/:id', (done) => {
    it('should update todo and set as completed', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = 'updated from unit test';
        
        request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: true,
            text
        })
        .expect(200)
        .expect((res) => {
                expect(res.body.text).toBe(text);
                expect(res.body.completed).toBe(true);
                expect(typeof res.body.completedAt).toBe('number');
            }            
        )
        .end(done);        
    });

    it('should update todo and clear completedAt', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = 'updated from unit test';

        request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: false,
            text
        })
        .expect(200)
        .expect((res) => {
                expect(res.body.text).toBe(text);
                expect(res.body.completed).toBe(false);
                expect(res.body.completedAt).toBeFalsy();
            }            
        )
        .end(done);
    });

    describe('GET /users/me', () => {
        it('should return an user if authenticated', (done) => {
            
            request(app)
                .get('/users/me')
                .set('x-auth', users[0].tokens[0].token)
                .expect(200)
                .expect((res) => {
                    expect(res.body._id).toBe(users[0]._id.toHexString());
                    expect(res.body.email).toBe(users[0].email);
                })
                .end(done);
        });

        it('should return 401 if not authenticated', (done) => {
            
            request(app)
                .get('/users/me')
                .expect(401)
                .expect((res) => {
                    expect(res.body).toEqual({});                    
                })
                .end(done);
        });     

    });

    describe('POST /users', () => {
        it('should create an user', (done) => {
            
            const name = 'user test';
            const email = 'user@example.com';
            const password = 'abc123!';
            
            request(app)
                .post('/users')
                .send({name, email, password})
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                    expect(res.body._id).toBeTruthy();
                    expect(res.body.email).toBe(email);
                })
                .end((err) => {
                    if (err) {
                        return done(err);
                    }

                    User.findOne({email}).then((user) => {
                        expect(user).toBeTruthy();
                        expect(user.password).not.toBe(password);
                        done();
                    }).catch((e) => done(e));
                });
        });
        
        it('should return a validation error if request is invalid', (done) => {
            
            const name = 'user test';
            const email = 'userexample.com';
            const password = '123';

            request(app)
                .post('/users')
                .send({name, email, password})
                .expect(400)
                .end(done);
        });

        it('should not create user if email is alreay in use', (done) => {
            
            const name = 'user test';
            const email = users[0].email;
            const password = 'abc123!';

            request(app)
                .post('/users')
                .send({name, email, password})
                .expect(400)
                .end(done);
        });
    });

    describe('POST /users/login', () => {
        it('should login user and return a token', (done) => {
            request(app)
                .post('/users/login')
                .send({
                    name: users[1].name,
                    email: users[1].email,
                    password: users[1].password
                })
                .expect(200)
                .expect((res) => {
                    expect(res.headers['x-auth']).toBeTruthy();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    User.findById(users[1]._id).then((user) => {
                        expect(user.tokens[0]).toMatchObject({
                            access : 'auth',
                            token : res.headers['x-auth']
                        });
                        done();
                    }).catch((e) => done(e));
                })
            });        

        it('should reject invalid login', (done) => {
            request(app)
                .post('/users/login')
                .send({
                    name: users[1].name,
                    email: users[1].email,
                    password: 'badpassword'
                })
                .expect(400)
                .expect((res) => {
                    expect(res.headers['x-auth']).not.toBeTruthy();
                })
                .end((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    User.findById(users[1]._id).then((user) => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    }).catch((e) => done(e));
                })
            });
        });
});
