const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

//promise
mongoose.Promise = global.Promise;
//connet to mongoose
mongoose.connect('mongodb://localhost/homebase2')
    .then(() => console.log('MongoDb Connected, hopefully this works'))
    .catch(err => console.log(err));

    //body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

//load ideamodel
require('./models/ideas');
const Idea = mongoose.model('ideas');


//set storage engiene
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
        // cb(null,file.originalname+ '-' + Date.now() + path.extname(file.originalname));

    }
});

//init upload
const upload = multer({
    storage: storage,

}).single('myFile');


//starts ejs
app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.get('/', (req, res) => res.render('index'));



app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('index', {
                msg: err
            });
        } else {
            if (req.file == undefined) {
                res.render('index', {
                    msg: 'Error no file selected'
                });
            } else {
                const newUser={
                    title: req.file.filename,
                    //details: req.body.details

                }
                new Idea(newUser)
                    .save()

                res.render('index', {

                    msg: 'Upload Succesful!!!',
                    file: `uploads/${req.file.filename}`


                });


            }
        }
    });
});




//for downloads
app.get('/download', function (req, res) {
    let file = __dirname + '/public/uploads/'+req.query['title'];
    console.log(file);
    res.download(file); // Set disposition and send it.
});

const port = 5000;

app.listen(port, () => console.log('server started on 5000'));
