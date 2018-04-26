const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../model/todo');
const {User} = require('./../../model/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const todos = [{
    _id: new ObjectID(),
    text: 'First todo',
    completed: true,
    completedAt: 32,
    creator: userOneId
}, {
    _id: new ObjectID(),
    text: 'Second todo',
    completed: false,
    completedAt: 33,
    creator: userTwoId
}];

const users = [{
    _id: userOneId,
    name: 'user one',
    email: 'user1@example.com',
    password: 'pwd123!',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]},
    {
        _id: userTwoId,
        name: 'user two',
        email: 'user2@example.com',
        password: 'abc123!',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
        }]
    }];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
    }).then(() => done());
}

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();
        
        return Promise.all([userOne, userTwo]);
    }).then(() => done());
}

module.exports = {todos, users, populateTodos, populateUsers};