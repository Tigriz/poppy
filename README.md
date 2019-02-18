# Poppy, Church's mistress
This repository is a node.js bot for 2Sucres.org that can run the Church, using 2sucres-api from taigah and SQLite3.

## Installation
With node.js installed, in a command shell:
```bash
git clone https://github.com/tigriz/poppy.git
cd poppy
npm install  
node index.js
```
You need to setup a config.json file with these elements at the root of the folder
```json
{
    "csrf": "9f750803e878b07a76f3f2e8e156fd6395ef496e011ceed247fb8ac3a6576b27",
    "cookies": "PHPSESSID=...",
    "id": 0,
    "head": 0
}
```