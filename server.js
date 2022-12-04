const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const client = require('./db');
const app = express();
const port = process.env.PORT || 4000

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

client.connect((err) => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('connected')
    }
})

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


app.get('/', (req, res) => {
    try {
        client.query("SELECT * FROM galleryimageobjs", (err, res) => {
            if (err) throw err
            console.log("##### RES IS RIGHT HERE #####", res.rows[0])
            // client.end()
        });
        // console.log("***** GALLERY IMAGES ARE BELOW *****");
        // console.log(allGalleryImages);
        // numImages = allGalleryImages.rows.length;
        res.render('index');
    }
    catch (err) {
        console.error(err.message);
    }
})

app.get('/api/getGalleryImages', (req, res) => {
    try {
        client.query("SELECT * FROM galleryimageobjs", (err, response) => {
            if (err) throw err
            res.json(response.rows);
        });
    }
    catch (err) {
        console.error(err.message);
    }
})

const check_inputs = (title, desc, img) => {
    var titleError = null;
    var descError = null;
    var imgError = null;
    console.log("IMAGE IS BELOW");
    console.log(img);
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

app.post('/addGallery', upload2.single('image'), urlEncodedParser, (req, res, next) => {
    const { title, description } = req.body;
    const image = req.file;
    console.log("IMAGE FILE BELOW");
    console.log(image);
    const errors = check_inputs(title, description, image);
    if (errors) {
        return res.render('', {
            errors
        })
    }
    try {
        const newImgFileName = imgFileName.split(".")[0];
        const img_buffer = req.file.buffer.toString('base64');
        client.query("INSERT INTO galleryimageobjs (title, description, image, imgbuffer) VALUES($1, $2, $3, $4) RETURNING *", [title, description, newImgFileName, img_buffer], (err, res) => {
            if (err) throw err
            console.log("***** RES IS HERE *****", res)
            // client.end()
        })
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

app.post("/api/setGView", cors(), (req, res) => {
    console.log("IN THE SET G VIEW");
    console.log("IN THE TRY BLOCK");
    try {
        const data = req.query;
        console.log("DATA IS BELOW");
        console.log(data);
        client.query("SELECT * FROM galleryimageobjs", (err, response) => {
            if (err) throw err
            console.log("RESPONSE IS BELOW");
            console.log(response);
            client.query("SELECT * FROM galleryimageobjs WHERE galleryimageobj_id=" + data['data'], (err, response2) => {
                if (err) throw err
                console.log("RESPONSE 2 IS BELOW");
                console.log(response2);
                console.log(response);
                const allGalleryImages = response;
                const gViewObj = response2;
                const gImageLength = allGalleryImages.rows.length;
                galleryViewImage = gViewObj.rows[0]
                console.log("GALLERY VIEW IMAGE IS BELOW");
                console.log("GALLERY VIEW IMAGE IS BELOW");
                console.log("GALLERY VIEW IMAGE IS BELOW");
                console.log("GALLERY VIEW IMAGE IS BELOW");
                // if (galleryViewImage['galleryimageobj_id'] == gImageLength) {
                //     galleryViewImage['next'] = gImageLength - 1;
                //     galleryViewImage['prev'] = null
                // }
                // else if (galleryViewImage['galleryimageobj_id'] == 1) {
                //     galleryViewImage['next'] = null;
                //     galleryViewImage['prev'] = 2;
                // }
                // else {
                //     galleryViewImage['next'] = galleryViewImage['galleryimageobj_id'] - 1;
                //     galleryViewImage['prev'] = galleryViewImage['galleryimageobj_id'] + 1;
                // }
            });
        });

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

app.listen(port, () => { console.log("Server listening on port 4000.") })