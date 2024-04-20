const express = require('express');
const app = express();
app.use(express.static('public'));

// joi for server side validation
const joi = require('joi');

// multer for file uploads
const multer = require('multer');

app.use('/uploads', express.static('uploads'));
app.use(express.json());

// cors for cross domain
const cors = require('cors');
app.use(cors());

// mongoose for mongodb
const mongoose = require('mongoose');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

// mongodb+srv://johnnyhyman97:<password>@crafts-cluster.s0ji6c3.mongodb.net/
mongoose
.connect('mongodb+srv://johnnyhyman97:OoquNcGlbKsorRL0@cluster0.n3k848k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => {
    console.log('connected to mongodb successfully');
})
.catch((error) => {
    console.log('unsuccessful connecting to mongodb', error);
});
//OoquNcGlbKsorRL0

const itemSchema = new mongoose.Schema({
    name: String,
    type: String,
    image_name: String,
    alt_text: String,
    price: Number,
    sizes: [String],
    widths: [Number],
    lengths: [Number],
    description: String
});

const Item = mongoose.model('Item', itemSchema);

app.get('/', (req, res) => {
    res.sendFile(__dirname, './public/index.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname, './public/item-page.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname, './public/admin-edit-items.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname, './public/shop-all.html');
});

app.get('/api/items', async(req, res) => {
    const items = await Item.find();
    res.send(items);
});

app.get('/api/items/:id', async(req, res) => {
    const id = req.params.id;
    const item = await Item.findOne({_id: id});
    res.send(item);
});

app.post('/api/items', upload.single('image_name'), async(req, res) => {
    const result = validateItem(req.body);

    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const item = new Item({
        name: req.body.name,
        type: req.body.type,
        alt_text: req.body.alt_text,
        price: req.body.price,
        sizes: req.body.sizes.split(','),
        widths: req.body.widths.split(','),
        lengths: req.body.lengths.split(','),
        description: req.body.description
    });

    if(req.file) {
        item.image_name = req.file.filename;
    }

    await item.save();
    res.send(item);
});

app.put('/api/items/:id', upload.single('image_name'), async(req, res) => {
    const result = validateItem(req.body);

    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    let fieldsToUpdate = {
        name: req.body.name,
        type: req.body.type,
        alt_text: req.body.alt_text,
        price: req.body.price,
        sizes: req.body.sizes.split(','),
        widths: req.body.widths.split(','),
        lengths: req.body.lengths.split(','),
        description: req.body.description
    };

    if(req.file) {
        fieldsToUpdate.image_name = req.file.filename;
    }

    const id = req.params.id;

    const updateResult = await Item.updateOne({_id: id}, fieldsToUpdate);
    res.send(updateResult);
});

app.delete('/api/items/:id', async(req, res) => {
    const item = await Item.findByIdAndDelete(req.params.id);
    res.send(item);
});

const validateItem = (item) => {
    const schema = joi.object({
        _id: joi.allow(''),
        name: joi.string().min(1).required(),
        type: joi.string().min(1).required(),
        alt_text: joi.string().min(1).required(),
        price: joi.number().required(),
        sizes: joi.allow(''),
        widths: joi.allow(''),
        lengths: joi.allow(''),
        description: joi.string().min(1).required()
    });

    return schema.validate(item);
};

app.listen(3000, () => {});