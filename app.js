const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const hostURL = 'http://localhost:5000/';
const app = express();
var methodOverride = require('method-override')

//promise
mongoose.Promise = global.Promise;
const keys = require('./config/keys');

//connet to mongoose
mongoose.connect(keys.mongoURI, {
    useNewUrlParser: true
})
    .then(() => console.log('Mongo is connected'))
    .catch(err => console.log(err));


// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
    //body parser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());


//load ideamodel
require('./models/ideas');
require('./models/urls');
require('./models/persons');


const Idea = mongoose.model('ideas');
const Url = mongoose.model('urls');
const Person = mongoose.model('persons');

//


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

app.use("/public", express.static(path.join(__dirname, 'public')));
app.use("/views", express.static(path.join(__dirname, 'views')));

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
            
                    res.writeHead(301,
                        {Location: hostURL}
                      );
                    res.end();
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



app.get('/savedURLs', function (req, res) {
    Url.find({}, (err, urls) => {
        if (err) return console.log(err);

        res.render('savedURLs', { 
            urls: urls
        });
    });
});



app.post('/addNewURL', function (req, res) {
    const newUrl={
        url: req.body.newURL,
        notes: req.body.newNote,
        categorie: req.body.newCategorie
        
    }
    new Url(newUrl)
        .save()

    Url.find({}, (err, urls) => {
        if (err) return console.log(err);

        res.writeHead(301,
            {Location: hostURL+'savedURLs'}
          );
        res.end();
    });
   
});

app.get('/contacts', function (req, res) {
    //DATABASE TO ARRAY
   Person.find({},(err,persons)=>{
        res.render('contacts', { 
            persons: persons
        });
   })
        
   
});

app.post('/addNewPerson', function (req, res) {
    upload(req, res, (err) => {
        if (err) {
            console.log("err");

            console.log(err);

            res.render('contacts', {
                msg: err
                
            });

        } else {
            if (req.file == undefined) {
                console.log(req.file);

                res.render('contacts', {
                    msg: 'Error no file selected'
                });
            } else {
                console.log("the fuck?");

                var newPerson={
                    name: req.body.name,
                    pic: req.file.filename,
                    phone: req.body.phone,
                    email: req.body.email,
                    notes: {
                        note:req.body.note
                    }
                }
                console.log(newPerson);
                new Person(newPerson)
                    .save();


                
               
                res.writeHead(301,
                    {Location: hostURL+"contacts"}
                    );
                res.end();


            }
        }
    })
    
});

app.get('/personView/:id', (req, res) => {
    try {
        var idString = req.params.id;
        //var id = new mongoose.Types.ObjectId(String(idString));

        Person.findById({
            _id: req.params.id
            }).then(person => {
                    console.log(person),
                    res.render('personView', {
                        person: person
                    
                });
            })
    } catch (error) {
        console.log(error);
        }
   


});


app.post('/deleteFile', (req, res) =>{
    try {
        var path = 'public/uploads/'+req.body.fileName;
    fs.unlinkSync(path);
    Idea.deleteOne({
        _id: req.body.deleteFile
    }).then(Idea.find({}, (err, ideas) => {
        if (err) return console.log(err);
        
        res.writeHead(301,
            {Location: hostURL}
          );
        res.end();
    }));
    } catch (error) {
        console.log(error);
    }
    
});

app.post('/deleteURL', (req, res) =>{
    Url.deleteOne({
        url: req.body.deleteURL
    }).then(Url.find({}, (err, urls) => {
        if (err) return console.log(err);

        res.writeHead(301,
            {Location: hostURL+"savedURLs"}
          );
        res.end();
    }));
});


const port = 5000;

app.listen(port, () => console.log('server started on 5000'));
