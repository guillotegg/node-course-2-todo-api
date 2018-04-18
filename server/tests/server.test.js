const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../model/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First todo',
    completed: true,
    completedAt: 32
}, {
    _id: new ObjectID(),
    text: 'Second todo',
    completed: false,
    completedAt: 33
}]

beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
    }).then(() => done());
})

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
});
