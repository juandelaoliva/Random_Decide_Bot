const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');

const config = require('./config');
const dataService = require('./dataService');



var _ = require('lodash');

dataService.loadUsers();

const bot = new Telegraf(config.botToken);

const initMsg = `Bienvenido a DecideBot!

Para más información puedes ejecutar el comando /ayuda 
`;

const helpMsg = `Comandos de referencia:

/start\nIniciar bot\n
/addlista nombrelista\nAñade una lista con el nombre "nombrelista"\n
/add nombrelista nombreopción\nAñade una la opción "nombreopción" a la lista "nombrelista" \n
/mostrar nombrelista\nMuestra las opciones de la lista "nombrelista"\n
/listas\nMuestra todas las listas\n
/decide nombrelista\nMuestra una de las opciones de manera aleatoria\n
/addvarios nombrelista:\n Añade varios elementos a una lista separados por comas\n
/elimina nombrelista:\n Elimina el último elemento añadido a la lista\n

`;

const aboutMsg = "Este bot ha sido creado por @juandelaoliva con node y telegraf";






function userString(ctx) {
    return JSON.stringify(ctx.from.id == ctx.chat.id ? ctx.from : {
        from: ctx.from,
        chat: ctx.chat
    });
}

function logMsg(ctx) {
    var from = userString(ctx);
    console.log('<', ctx.message.text, from)
}

function logOutMsg(ctx, text) {
    console.log('>', {
        id: ctx.chat.id
    }, text);
}


//---------------------------------------------MENU---------------------------------------------------------------


bot.command('donar', ctx => ctx.reply('💰 Puedes donar al proyecto mediante este link de Paypal \n\n   paypal.me/juandelaoliva'))
bot.command('compartir', ctx => ctx.reply(' Puedes compartir este bot mediante el siguiente link \n\n   telegram.me/RandomDecideBot'))


//---------------------------------------------RESPUESTAS AUTOMÁTICAS---------------------------------------------------------------






//---------------------------------------------COMANDOS---------------------------------------------------------------







bot.command('start', ctx => {
    logMsg(ctx);
    dataService.registerUser(ctx);
    ctx.reply(initMsg);

    setTimeout(() => {
        ctx.reply("Bienvenido a Decide_Bot");
    }, 50);  //delay para enviar este mensaje como segundo mensaje
});



bot.command('ayuda', ctx => {
    logMsg(ctx);
    logOutMsg(ctx, helpMsg);
    ctx.reply(helpMsg);
});

bot.command('about', ctx => {
    logMsg(ctx);
    //logOutMsg(ctx, aboutMsg);
    ctx.reply(aboutMsg);
});

const errInitMsg = 'Este chat no estaba iniciado de manera correcta, hemos solucionado es problema. \n\n Por favor vauelva a intentarlo de nuevo';
const unknownError = 'Parece que algo ha fallado, vuelve a intentarlo más tarde'
bot.command('addlista', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length && words.length < 2) {
            dataService.addList(ctx, words);
            ctx.reply('lista añadida');
        } else {
            console.log('solo tenía una palabra o más de una');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('lista NO añadida');
        }
    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else {
            ctx.reply(e.msg);
        }
    }

});



bot.command('add', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length > 1) {
            var listName = words[0];
            //CHECK LIST
            words.shift();
            var element = words.join(' ');
            dataService.addElement(ctx, listName, element);
            ctx.reply('elemento añadido');

        } else {
            console.log('error');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('elemento NO añadido');
        }
    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else {
            ctx.reply(e.msg);
        }
    }


    //logOutMsg(ctx, aboutMsg);

});

bot.command('elimina', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        var listName = words[0];
        //CHECK LIST
        words.shift();
        dataService.deleteElement(ctx, listName);
        ctx.reply('Último elemento de la lista eliminado');

    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else {
            ctx.reply(e.msg);
        }
    }
    //logOutMsg(ctx, aboutMsg);
});

bot.command('borra', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length > 1) {
            var listName = words[0];
            //CHECK LIST
            words.shift();
            var element = words.join(' ');
            dataService.removeElement(ctx, listName, element);
            ctx.reply('elemento borrado');

        } else {
            console.log('error');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('elemento NO eliminado');
        }
    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else {
            ctx.reply(e.msg);
        }
    }
    //logOutMsg(ctx, aboutMsg);
});

bot.command('addvarios', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(':');

        var listName = words[0].split(' ');
        listName.shift(); //borramos la primera palabra  (que es la llamada al comando)

        var elements = words[1].split(',');

        if (words.length > 1 && elements.length != 0) {
            dataService.addElements(ctx, listName, elements);
            ctx.reply('elementos añadidos');

            var listOptions = dataService.getElementsList(ctx, listName);
            if (listOptions.length) {

                var res = 'Las opciones de tu lista ' + listName + ' son: \n\n';
                for (var i = 0; i < listOptions.length; i++) {
                    res += listOptions[i] + '\n'
                }
                ctx.reply(res);

            } else {
                ctx.reply('Todavía no has añadido ninguna opción en tu lista. \n Para más ayuda no dudes en usar el comando /ayuda');
            }

        } else {
            console.log('error');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('elementos NO añadidos');
        }
    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else {
            ctx.reply(e.msg);
        }
    }


    //logOutMsg(ctx, aboutMsg);

});

bot.command('listas', ctx => {
    logMsg(ctx);
    try {
        var listsNames = dataService.getLists(ctx);
        if (listsNames.length) {

            var res = 'Tus listas son: \n\n';
            for (var i = 0; i < listsNames.length; i++) {
                res += listsNames[i] + '\n'
            }
            ctx.reply(res);

        } else {
            ctx.reply('no hay ninguna lista')
        }

    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else if (e instanceof TypeError) {
            ctx.reply(unknownError);

        }
    }


});


bot.command('mostrar', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length && words.length < 2) {

            var listsNames = dataService.getElementsList(ctx, words[0]);
            if (listsNames.length) {

                var res = 'Las opciones de tu lista ' + words[0] + ' son: \n\n';
                for (var i = 0; i < listsNames.length; i++) {
                    res += listsNames[i] + '\n'
                }
                ctx.reply(res);

            } else {
                ctx.reply('no hay opciones en la lista lista')
            }
        }
    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else if (e instanceof TypeError) {
            ctx.reply(unknownError);
        }
    }

});

bot.command('decide', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length && words.length < 2) {

            var res = dataService.getRandom(ctx, words[0]);
            if (res) {

                ctx.reply(res);

            } else {
                ctx.reply('no hay opciones en la lista lista')
            }
        }
    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else if (e instanceof TypeError) {
            ctx.reply(unknownError);
        }
    }

});









// este comando solo está disponible para el dueño del bot
bot.command('broadcast', ctx => {
    if (ctx.from.id == config.adminChatId) {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es "/broadcast")
        if (words.length == 0) //Evitamos mandar mensajes vacíos
            return;
        var broadcastMessage = words.join(' ');
        var userList = dataService.getUserList();
        console.log("Sending broadcast message to", userList.length, "users:  ", broadcastMessage);
        userList.forEach(userId => {
            console.log(">", { id: userId }, broadcastMessage);
            ctx.telegram.sendMessage(userId, broadcastMessage);
        });
    }
});




bot.startPolling();

module.exports = {

}