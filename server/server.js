const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./model/todo');
const {User} = require("./model/user");
const {ObjectID} = require('mongodb');

var app = express();
const port = process.env.port || 3000;

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

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(404).send(e);
    })
});

app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        Todo.findById(id).then((todo) => {
            if (todo) {
                res.send({todo});
            } else {
                res.status(404).send("Not Found");
            }
        }, (e) => {
           res.status(400).send(e);
        });
    } else {
        res.status(400).send();
    }
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        Todo.findByIdAndRemove(id).then((todo) => {
            if (todo) {
                res.send({todo});
            } else {
                res.status(404).send("Not Found");
            }
        }, (e) => {
           res.status(400).send(e);
        });
    } else {
        res.status(400).send();
    }
});

app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        var body = _.pick(req.body, ['text', 'completed']);
        
        if (_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime();
        }
        else {
            body.completed = false;
            body.completedAt = null;
        }

        Todo.findByIdAndUpdate(id, {$set: body}, {new: true} ).then((todo) => {
            if (!todo) {
                res.status(404).send();        
            } else {
                res.send(todo);
            }
        }).catch((e) => {
            res.status(400).send();
        });

    } else {
        res.status(404).send();
    }
});

app.listen(port, () => {
    console.log(`Starting on port ${port}`);
});

module.exports = {app};

/*var newUser = new User({
    name: 'Guillermo',
    email: 'guillote_gg@hotmail.com'
});

newUser.save().then((doc) => {
    console.log('Saved User', doc);
}, (e)=> {
    console.log('Unable to save User', e)
});*/

