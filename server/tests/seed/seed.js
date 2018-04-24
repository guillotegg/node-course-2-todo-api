const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../model/todo');
const {User} = require('./../../model/user');

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
}];

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
    _id: userOneId,
    name: 'user one',
    email: 'user1@example.com',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]},
    {
        _id: userTwoId,
        name: 'user two',
        email: 'user2@example.com'
    }];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        User.insertMany(users);
    }).then(() => done());
}

module.exports = {todos, users, populateTodos, populateUsers};