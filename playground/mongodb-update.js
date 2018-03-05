const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server')

    const db = client.db('TodoApp');

    db.collection('Users').findOneAndUpdate({_id: new ObjectID('5a9d700f72487a6bedf7f3be')},
    {
        $set: {
            name: 'Pepe1'
        },
        $inc: {
            age: +1
        }     
    },
    {
        returnOriginal: false
    })
    .then((results) => {
        console.log(JSON.stringify(results, undefined, 2));
    }, (err) => {
        console.log('Unable to fetch todos', err);
    })

    client.close();
});