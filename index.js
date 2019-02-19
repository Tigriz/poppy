const config = require('./config')
const apiFactory = require('2sucres-api')
const api = apiFactory(config.cookies, config.csrf)
const sqlite3 = require('sqlite3').verbose(); 
const db = new sqlite3.Database('./db/church.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the Church database.');
});

// Running the Church
async function run () {
    console.log("Church n°"+config.id)
    
    await core()

    // Close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
    });
}

// Core function looping
async function core() {
    await open();
    let counts = {}
    let messages = await api.getMessages(config.id) 
    messages.filter(function(obj) { return obj.user.id }).map(function(obj) { return obj.user.id }).forEach(function(x) { counts[x] = (counts[x] || 0)+1; });

    console.log(counts)
    
    Object.getOwnPropertyNames( counts ).forEach( function( key ){
        db.run(`UPDATE seeds SET points = ? WHERE user = ?`, [counts[key], key])
    });

    printAll();
    setTimeout(() => close(), 60000)

    core()
}

// Closes the Church
async function close(){
    await api.postMessage(config.id, "Fermeture");
    setTimeout(() => api.lockTopic(config.id), 100)
}

// Opens the Church
async function open(){
    await api.unlockTopic(config.id)
    setTimeout(() => api.postMessage(config.id, "Ouverture"), 100)
}

function printAll(){
    db.all(`SELECT user, pseudo, points FROM seeds
    ORDER BY user`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        console.log("== Database ==")
        let string = "**Database** \n | User ID | User name | Points \n |:"
        rows.forEach((row) => {
            console.log(row)
            string += "\n | "+row.user+" | "+row.pseudo+" | "+row.points;
        });
        api.editMessage(config.head, string)
    });
}
 
run().catch(err => {
  // global error handling
  console.error(err.stack)
  process.exit(1)
})