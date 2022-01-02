const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/characters');

const express = require('express');

const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8080, () => { console.log(`Listening on port 8080`)});

let characterRoutes = require('./routes/characterRoutes')();
app.use('/', characterRoutes);