const express = require('express');
const app = express();
const morgan = require('morgan');
const multer = require('multer');
const textract = require('textract');
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect('mongodb://martintan:' + 
  process.env.MONGO_ATLAS_PW + 
  '@lbc-dms-shard-00-00-acpu1.mongodb.net:27017,lbc-dms-shard-00-01-acpu1.mongodb.net:27017,lbc-dms-shard-00-02-acpu1.mongodb.net:27017/test?ssl=true&replicaSet=lbc-dms-shard-0&authSource=admin&retryWrites=true', 
  { useNewUrlParser: true })
  .then(res => {
    console.log('Connected to MongoDB database (lbc-dms).')
  });

const Doc = require('./models/doc');

app.use(morgan('dev'));
app.use(express.json());
app.use('/documents', express.static('documents'));

const upload = multer({
  dest: '../../documents'
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

app.post('/api/upload', upload.single('file'), (req, res, next) => {
  console.log(req.file);
  fs.readFile(req.file.path, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    textract.fromBufferWithMime(req.file.mimetype, data, (err, text) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err });
      }
      res.status(200).json({ text });
    });
  });
});

app.get('/api/docs', (req, res, next) => {
  Doc.find()
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(error => res.status(500).json({ error: error }));
});

app.get('/api/docs/:id', (req, res, next) => {
  const id = req.params.id;
  Doc.find({ _id: id })
    .exec()
    .then(docs => {
      res.status(200).json(docs);
    })
    .catch(error => res.status(500).json({ error: error }));
});

app.post('/api/docs', (req, res, next) => {

  console.log(req.body);
  const doc = new Doc({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    content: req.body.content,
    comments: req.body.comments
  });
  doc.save()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(error => res.status(500).json({ error: error }));
});

app.patch('/api/docs/:id', (req, res, next) => {
  const id = req.params.id;
  const comment = req.body.comment;
  const content = req.body.content;
  Doc.findById(id, (err, doc) => {
    if (err) res.status(500).json({ error: err });

    if (content == undefined) doc.comments = [...doc.comments, comment];
    else doc.content = content;

    doc.save((err, updatedDoc) => {
      if (err) res.status(500).json({ error: err });
      res.status(200).json(doc);
    });
  })
});

app.delete('/api/docs/:id', (req, res, next) => {
  Doc.remove({ _id: req.params.id })
    .exec()
    .then(result => {
      res.status(200).json(result);
    })
    .catch(error => res.status(500).json({ error: error }));
});


module.exports = app;
