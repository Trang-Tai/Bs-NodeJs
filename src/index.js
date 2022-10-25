import express from "express";
const app = express();
import bodyParser from "body-parser";
const configViewEngine = require("./config/viewEngine");
const initWebRoutes = require("./routes/web");
import connectDB from './config/connectDB';

import 'dotenv/config'
const port = process.env.PORT || 6969;
import cors from 'cors';

// This npm package enables us to handle incoming requests using req.body
app.use(bodyParser.json({ limit: '5MB' }));
app.use(bodyParser.urlencoded({ limit: '5MB', extended: true })); // cho phép load file tối đa 5MB

app.use(cors({
    origin: process.env.URL_REACT,
    methods: ['POST', 'GET', 'PUT', 'OPTIONS', 'PATCH', 'DELETE'],
    allowedHeaders: ['X-Requested-With', 'content-type'],
    credentials: true,
}));
// Add headers before the routes are defined
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

configViewEngine(app);
initWebRoutes(app);
connectDB();

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
