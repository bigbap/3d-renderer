const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(express.static(__dirname + '/'));

app.listen(PORT, function () {
    console.log('Express server started on port ' + PORT + '!');
});
