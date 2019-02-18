const config = require('./config')
const apiFactory = require('2sucres-api')
const api = apiFactory(config.cookies, config.csrf)
const sqlite3 = require('sqlite3').verbose(); 
const CHURCH_DB = new sqlite3.Database('./db/church.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the Church database.');
});

// Running the Church
async function run () {
    console.log("Church n°"+config.id)

    await core(config.id, CHURCH_DB)

    // Close the database connection
    CHURCH_DB.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
}

// Core function looping
async function core() {
    const topic = await api.getTopic(config.id)
    api.editMessage(config.head, `Il y a ${topic.messageCount} messages ici`)
    const messages = await api.getMessages(config.id)
    console.log(messages)
    for (const message in messages) {
        if (messages.hasOwnProperty(message)) {
            const element = messages[message];
            CHURCH_DB.get(`SELECT points FROM seeds WHERE user = ?`, [element.user.id], (err, row) => {
                if (err) {
                  return console.error(err.message);
                }
                if(row == undefined)
                    CHURCH_DB.run(`INSERT INTO seeds(user, points) VALUES(${element.user.id},1)`);
                else CHURCH_DB.run(`UPDATE seeds SET points = ? WHERE user = ?`, [parseInt(row.points)+1, element.user.id])
              });
        }
    }

    CHURCH_DB.all(`SELECT user, points FROM seeds
    ORDER BY user`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log("== CHURCH_DB ==")
        rows.forEach((row) => {
            console.log(row);
        });
    });
}

// Closes the Church
async function close(){
    await api.postMessage(config.id, "Fermeture");
    await api.lockTopic(config.id)
}

// Opens the Church
async function open(){
    await api.unlockTopic(config.id)
    await api.postMessage(config.id, "Ouverture");
}
 
run().catch(err => {
  // global error handling
  console.error(err.stack)
  process.exit(1)
})