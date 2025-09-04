const express = require('express');
const app = express();
const cors = require('cors');
const {connectDB, connectGridFS} = require('./config.js')
const routes = require('./utils/routes.js')
app.use(express.json());
app.use(cors());
const port = 3000;

connectDB();
connectGridFS();

app.use('', routes)

app.listen(port, () => {
    console.log(`Server Listening on Port: ${port}`)
})

module.exports = app;