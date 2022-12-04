const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var numImages = 1111;
var imgFileName = ""

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'Images/gallery');
    },
    filename: function (req, file, callback) {
        console.log(file);
        console.log("NUM IMAGES ARE BELOW");
        console.log(numImages);
        var newFileName = "";
        if (numImages < 9) {
            const newNum = numImages + 1;
            newFileName = 'IMG-000' + newNum.toString() + '.jpg';
        }
        else {
            const newNum = numImages + 1;
            newFileName = 'IMG-00' + newNum.toString() + '.jpg';
        }
        imgFileName = newFileName;
        callback(null, newFileName);
    }
});
const upload = multer({ storage: storage });

const upload2 = multer({ storage: multer.memoryStorage() });



const urlEncodedParser = bodyParser.urlencoded({ extended: false });

var galleryViewImage = {};


app.get('/', async (req, res) => {
    try {
        const allGalleryImages = await pool.query("SELECT * FROM galleryimageobjs");
        numImages = allGalleryImages.rows.length;
        res.render('index');
    }
    catch (err) {
        console.error(err.message);
    }
})

app.get('/api/getGalleryImages', async (req, res) => {
    try {
        const allGalleryImages = await pool.query("SELECT * FROM galleryimageobjs");
        res.json(allGalleryImages.rows)
    }
    catch (err) {
        console.error(err.message);
    }
})

const check_inputs = (title, desc, img) => {
    var titleError = null;
    var descError = null;
    var imgError = null;
    if (title.split(' ').join('') == "") {
        titleError = "Title is required."
    }
    if (desc.split(' ').join('') == "") {
        descError = "Description is required."
    }
    if (img == undefined) {
        imgError = "Image is required."
    }
    const errors = [titleError, descError, imgError];
    if (titleError || descError || imgError) {
        return errors;
    }
    return null;
}

app.post('/addGallery', upload2.single('image'), urlEncodedParser, async (req, res, next) => {
    const { title, description, image } = req.body;
    const errors = check_inputs(title, description, image);
    if (errors) {
        return res.render('', {
            errors
        })
    }
    try {
        const newImgFileName = imgFileName.split(".")[0];
        const img_buffer = req.file.buffer.toString('base64');
        const newGalleryImage = await pool.query("INSERT INTO galleryimageobjs (title, description, image, imgbuffer) VALUES($1, $2, $3, $4) RETURNING *", [title, description, newImgFileName, img_buffer])
    }
    catch (err) {
        console.error(err.message);
    }
    res.send("Image uploaded");
})

app.get("/api", (req, res) => {
    res.json({ "users": ["userOne", "userTwo", "userThree"] })
})

app.post("/api/login", cors(), (req, res) => {
    const data = req.query;
    if (data["password"] == "adminPassword") {
        res.sendStatus(200);
    }
    else {
        res.sendStatus(201);
    }
})

app.post("/api/setGView", cors(), async (req, res) => {
    try {
        const data = req.query;
        const allGalleryImages = await pool.query("SELECT * FROM galleryimageobjs");
        const gViewObj = await pool.query("SELECT * FROM galleryimageobjs WHERE galleryimageobj_id=" + data['data']);
        const gImageLength = allGalleryImages.rows.length;
        galleryViewImage = gViewObj.rows[0]
        if (galleryViewImage['galleryimageobj_id'] == gImageLength) {
            galleryViewImage['next'] = gImageLength - 1;
            galleryViewImage['prev'] = null
        }
        else if (galleryViewImage['galleryimageobj_id'] == 1) {
            galleryViewImage['next'] = null;
            galleryViewImage['prev'] = 2;
        }
        else {
            galleryViewImage['next'] = galleryViewImage['galleryimageobj_id'] - 1;
            galleryViewImage['prev'] = galleryViewImage['galleryimageobj_id'] + 1;
        }
        res.sendStatus(200);
    }
    catch (err) {
        res.sendStatus(201);
    }

})

app.post("/api/addGallery", cors(), (req, res) => {
    try {
        const data = req.query;
        res.sendStatus(200);
    }
    catch (err) {
        res.sendStatus(201);
    }

})

app.get("/api/getGView", (req, res) => {
    res.json(galleryViewImage);
})

app.listen(4000, () => { console.log("Server listening on port 4000.") })