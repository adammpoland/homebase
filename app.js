const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();

//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


    //body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//load ideamodel
require('./models/ideas');
const Idea = mongoose.model('ideas');
//const SavedURLs = mongoose.model('savedURLs');



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
    storage: storage
}).single('myFile');


//starts ejs
app.set('view engine', 'ejs');

app.use(express.static('./public'));
app.use(express.static("./views"));


app.get('/', (req, res) => {

    //DATABASE TO ARRAY
    Idea.find({}, (err, ideas) => {
        if (err) return console.log(err);

        res.render('index', { ideas: ideas });
    });
});


app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log("err");

            console.log(err);

            res.render('index', {
                msg: err
                
            });

        } else {
            if (req.file == undefined) {
                console.log(req.file);

                res.render('index', {
                    msg: 'Error no file selected'
                });
            } else {
                console.log("the fuck?");

                const newUser={
                    title: req.file.filename,
                    //details: req.body.details

                }
                new Idea(newUser)
                    .save()

                Idea.find({}, (err, ideas) => {
                    if (err) return console.log(err);
            
                    res.render('index', { 
                        ideas: ideas
                        //file: `uploads/${req.file.filename}`

                    });
                });
               


            }
        }
    })
});




//for downloads
app.post('/download', function (req, res) {
    let file = __dirname + '/public/uploads/'+req.body.title;
    console.log(file);
    res.download(file); // Set disposition and send it.
});

app.get('/browserView', function (req, res) {
    let file = '/public/uploads/'+req.query['title'];
    console.log(file);

    var stream = fs.createReadStream(file);
    var filename = req.query['title']; 
    // Be careful of special characters

    filename = encodeURIComponent(filename);
    // Ideally this should strip them

    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');

    stream.pipe(res);

  
});

app.get('/savedURLs', function (req, res) {
    //DATABASE TO ARRAY
   
        res.render('savedURLs');
   
});

app.get('/contacts', function (req, res) {
    //DATABASE TO ARRAY
   
        res.render('contacts');
   
});

const port = 5000;

app.listen(port, () => console.log('server started on 5000'));
