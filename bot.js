const Telegraf = require('telegraf');
const {
    Extra,
    Markup
} = require('telegraf');

const config = require('./config');
const dataService = require('./dataService');


var _ = require('lodash');

dataService.loadUsers();
console.log('Deplooooooooooo')

const bot = new Telegraf(config.botToken);
console.log(config.botToken)

const initMsg = `Wellcome to DecideBot!

For more information you can use the command /help 
`;

const helpMsg = `Reference commands:

/start\nStart bot\n
[/addlist + listName]\nAdds a list with the name "listName"\n
[/add + listName + itemName]\nAdd the item "itemName" to the list "listName" \n
[/show + listName]\nShows all the items in the list "listName"\n
/lists\nShows all the lists\n
[/random + listName]\nShows one random item from the list\n
[/addmultiple + listName + ':' + item1, item2]\nAdd multiple items to a list. Items must be separated by commas\n
[/delete + listName + itemName]\nDeletes the item from a specific list\n

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
        ctx.reply("Wellcome to Decide_Bot");
    }, 50);  //delay para enviar este mensaje como segundo mensaje
});



bot.command('help', ctx => {
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
bot.command('addlist', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length && words.length < 2) {
            dataService.addList(ctx, words);
            ctx.reply('🚀 List "' + words + '" created 🚀');
        } else {
            console.log('solo tenía una palabra o más de una');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('Error: please add the command and the name of your list. Example "/addlist Films"');
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
            ctx.reply('Item added!');

        } else {
            console.log('error');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('Error: Item NOT added. Use the command /help to check how to properly write the commands :)');
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

bot.command('delete', ctx => {
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
            ctx.reply('item deleted');

        } else {
            console.log('error');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('item NOT deleted');
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

bot.command('addmultiple', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(':');

        var listName = words[0].split(' ');
        listName.shift(); //borramos la primera palabra  (que es la llamada al comando)

        var elements = words[1].split(',');

        if (words.length > 1 && elements.length != 0) {
            dataService.addElements(ctx, listName, elements);
            ctx.reply('Items added!');

            var listOptions = dataService.getElementsList(ctx, listName);
            if (listOptions.length) {

                var res = listName + ': \n\n';
                for (var i = 0; i < listOptions.length; i++) {
                    res += listOptions[i] + '\n'
                }
                ctx.reply(res);

            } else {
                ctx.reply('There are no items here yet\n To add an item you can use the command [/add + listName + item]');
            }

        } else {
            console.log('error');
            //todo: mandar mensaje diciendo como se usa
            ctx.reply('Error: Items NOT added');
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

bot.command('lists', ctx => {
    logMsg(ctx);
    try {
        var listsNames = dataService.getLists(ctx);
        if (listsNames.length) {

            var res = '📝 Your lists: \n\n';
            for (var i = 0; i < listsNames.length; i++) {
                res += listsNames[i] + '\n'
            }
            ctx.reply(res);

        } else {
            ctx.reply('Any list created yet. For creating a list you can use the command [/addlist + listName]')
        }

    } catch (e) {
        if (e.message == errInitMsg) {
            ctx.reply(e.message);
        } else if (e instanceof TypeError) {
            ctx.reply(unknownError);

        }
    }


});


bot.command('show', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length && words.length < 2) {

            var listsNames = dataService.getElementsList(ctx, words[0]);
            if (listsNames.length) {

                var res = 'Here you have the items of the list ' + words[0] + ': \n\n';
                for (var i = 0; i < listsNames.length; i++) {
                    res += listsNames[i] + '\n'
                }
                ctx.reply(res);

            } else {
                ctx.reply('There are no items here yet\n To add an item you can use the command [/add + listName + item]')
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

bot.command('random', ctx => {
    logMsg(ctx);
    try {
        var words = ctx.message.text.split(' ');
        words.shift(); //borramos la primera palabra  (que es la llamada al comando)

        if (words.length && words.length < 2) {

            var res = dataService.getRandom(ctx, words[0]);
            if (res) {

                ctx.reply(res);

            } else {
                ctx.reply('There are no items here yet\n To add an item you can use the command [/add + listName + item]')
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
