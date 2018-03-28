const {mongoose} = require('./../server/db/mongoose');
const {User} = require('./../server/model/user');

User.findById('5a9da29252f53b3938928c02').then((user) => {
    if (!user){
        return console.log('Id not found');
    }
    console.log('User by Id', JSON.stringify(user, undefined, 2));
}).catch((e) => console.log(e));