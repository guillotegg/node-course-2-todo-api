const {config} = require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./model/todo');
const {User} = require("./model/user");
const {ObjectID} = require('mongodb');
const {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
    var newTodo = new Todo({
        text: req.body.text,
        completed: req.body.completed,
        completedAt: req.body.completedAt,
        creator: req.user._id
    })
    
    newTodo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });        
});

app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({
            creator: req.user._id
        });        
        res.send({todos});
    }
    catch (e) {
        res.status(404).send(e);
    }
});

app.get('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        try {
            const todo = await Todo.findOne({
                _id: id,
                creator: req.user._id
            })        
            if (todo) {
                res.send({todo});
            } else {
                res.status(404).send("Not Found");
            }            
        } catch (e) {
            res.status(400).send(e);
        }
    } else {
        res.status(400).send();
    }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;
    if (ObjectID.isValid(id)) {
        try 
        {
            let todo = await Todo.findOneAndRemove({
                _id: id,
                creator: req.user._id
            });

            if (todo) {
                res.send({todo});
            } else {
                res.status(404).send("Not Found");
            }
        } catch (e) {
            res.status(400).send(e);
        }

    } else {
        res.status(400).send();
    }
});

app.patch('/todos/:id', authenticate, async (req, res) => {
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

        try {
            const todo = await Todo.findOneAndUpdate(
            {
                _id: id,
                creator: req.user._id
            }, 
            {$set: body}, {new: true} );

            if (!todo) {
                res.status(404).send();        
            } else {
                res.send(todo);
            }

        } catch (e) {
            res.status(400).send();
        }
    } else {
        res.status(404).send();
    }
});

app.post('/users/login', async (req, res) => {
    const body = _.pick(req.body, ['name', 'email', 'password'] )
    try 
    {
        let user = await User.findByCredentials(body.email, body.password);
        let token = await user.generateAuthToken();
        return res.header('x-auth', token).send(user);        
    } catch(e) {
        res.status(400).send();
    }
});

app.post('/users', async (req, res) => {
    var body = _.pick(req.body, ['name', 'email', 'password'] )
    var newUser = new User(body);
    try {
        await newUser.save();
        const token = await newUser.generateAuthToken();
        res.header('x-auth', token).send(newUser);
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
}); 

app.delete('/users/me/token', authenticate, async (req, res) => {
    await req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send();
    });
}); 


app.listen(port, () => {
    console.log(`Starting on port ${port}`);
});

module.exports = {app};