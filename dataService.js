
//firebase
const firebaseConfig = require('./firebaseConfig');
const firebase = require('firebase');
const app = firebase.initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
    measurementId: firebaseConfig.measurementId
});
const ref = firebase.database().ref();
var sitesRef = ref.child("users");

var users = {};


function loadUsers() {

    // Get a database reference to our users
    var usersRef = firebase.database().ref("users");

    if (!usersRef) {
        usersRef = { users: {} };
    }

    // Attach an asynchronous callback to read the data at our posts reference
    usersRef.on("value", function (snapshot) {
        if (snapshot.val() == null) {
            sitesRef.set({});
        }
        users = snapshot.val();

    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    })
}

function saveUsers() {
    sitesRef.set(users);
}

function registerUser(msg) {
    var uid = msg.chat.id;
    var usr = { enabled: true, data: { chat: msg.chat }, lists: { enabled: true } };
    users[uid] = usr;
    saveUsers();
}


function getUserList() {
    return Object.keys(users);
}








function addList(ctx, listName) {
    var uid = checkUser(ctx);
    var lists
    //compruebo que el usuario tenga su lista de listas
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists
        if (!lists[listName]) {
            //si no existe ya la lista con ese nombre la creo
            lists[listName] = { 0: 'enabled' };
        } else {
            throw {
                id: 003,
                msg: 'La lista que has intentado añadir ya existe \n Para ver las listas creadas puedes usar el comando /listas'
            };
        }
    }//todo crear else para lanzar error y cachearlo en bot.js
    //guardo los usuarios
    saveUsers();
}


function addElement(ctx, listName, element) {
    var uid = checkUser(ctx);
    var lists;
    //compruebo que el usuario tenga su lista de listas
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists
        if (lists[listName]) {
            var arrayElements = Object.values(lists[listName]);
            arrayElements.push(element);
            lists[listName] = arrayElements;
        } else {
            throw {
                id: 001,
                msg: 'Error añadiendo elemento porque la lista no existe. \n Si necesitas ayuda no dudes en usar el comando /ayuda'
            };
        }
    }//todo crear else para lanzar error y cachearlo en bot.js
    //guardo los usuarios
    saveUsers();
}

function removeElement(ctx, listName, element) {
    var uid = checkUser(ctx);
    var lists;
    //compruebo que el usuario tenga su lista de listas
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists
        if (lists[listName]) {
            var arrayElements = Object.values(lists[listName]);
            arrayElements = arrayElements.filter(e => e !== element); 
            lists[listName] = arrayElements;
        } else {
            throw {
                id: 001,
                msg: 'Error añadiendo elemento porque la lista no existe. \n Si necesitas ayuda no dudes en usar el comando /ayuda'
            };
        }
    }//todo crear else para lanzar error y cachearlo en bot.js
    //guardo los usuarios
    saveUsers();
}

function addElements(ctx, listName, elements) {
    var uid = checkUser(ctx);
    var lists;
    //compruebo que el usuario tenga su lista de listas
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists
        if (lists[listName]) {
            var arrayElements = Object.values(lists[listName]);
            for (var i = 0; i < elements.length; i++) {
                if (elements[i] != '' && elements[i] != ' ') {
                    arrayElements.push(elements[i].trim());
                    lists[listName] = arrayElements;
                }

            }

        } else {
            throw {
                id: 002,
                msg: 'Error añadiendo elementos porque la lista no existe. \n Si necesitas ayuda no dudes en usar el comando /ayuda'
            };
        }
    }//todo crear else para lanzar error y cachearlo en bot.js
    //guardo los usuarios
    saveUsers();
}

function getLists(ctx) {
    var uid = checkUser(ctx);

    var lists;
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists
        var arrayElements = Object.keys(lists);
        if (arrayElements.includes('enabled')) {
            arrayElements.splice(arrayElements.indexOf('enabled'), 1);
        }
        return arrayElements;
    }


}

function getElementsList(ctx, listName) {
    var uid = checkUser(ctx);
    var lists;
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists

        if (lists[listName]) {
            var arrayElements = Object.values(lists[listName]);
            if (arrayElements.includes('enabled')) {
                arrayElements.splice(arrayElements.indexOf('enabled'), 1);
            }
            return arrayElements;
        } else {
            throw TypeError('La lista seleccionada no existe, usa el comando /lists para ver las listas creadas');
        }


    }
}

function getRandom(ctx, listName) {
    var uid = checkUser(ctx);
    var lists;
    if (users[uid].lists) {
        //guardo sus listas en la variable lists
        lists = users[uid].lists

        if (lists[listName]) {
            var arrayElements = Object.values(lists[listName]);
            if (arrayElements.includes('enabled')) {
                arrayElements.splice(arrayElements.indexOf('enabled'), 1);
            }

            var res = arrayElements[Math.floor(Math.random() * Math.floor(arrayElements.length))];
            return res;

        } else {
            throw TypeError('La lista seleccionada no existe, usa el comando /lists para ver las listas creadas');
        }


    }
}



function checkUser(ctx) {
    var uid = ctx.chat.id;
    if (!users[uid]) {
        registerUser(ctx);
        throw TypeError('Este chat no estaba iniciado de manera correcta, hemos solucionado es problema. \n\n Por favor vauelva a intentarlo de nuevo');
    }
    else {
        return uid;
    }


}




module.exports = {
    loadUsers,
    registerUser,
    getUserList,
    addList,
    addElement,
    addElements,
    getLists,
    getElementsList,
    getRandom,
    removeElement
};
