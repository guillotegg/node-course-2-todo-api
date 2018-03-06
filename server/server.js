const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./model/todo');
const {User} = require("./model/user");

var app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var newTodo = new Todo({
        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt
    })
    
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });        
});

app.listen(3000, () => {
    console.log('Starting on port 3000');
});

/*var newUser = new User({
    name: 'Guillermo',
    email: 'guillote_gg@hotmail.com'
});

newUser.save().then((doc) => {
    console.log('Saved User', doc);
}, (e)=> {
    console.log('Unable to save User', e)
});*/
