const mongoClient = require('mongodb').MongoClient;

mongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server')

    const db = client.db('TodoApp');

    db.collection('Users').insertOne({
        name: 'Guillermo Giménez',
        age: 38,
        location: 'Rosario, Argentina'
    }, (err, result) => {
        if (err) {
            console.log('Unable to insert todo', err);
        }
        console.log(JSON.stringify(result.ops, undefined, 2));
    })

    client.close();
});