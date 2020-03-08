//Imports declaring
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");

const { TesseractWorker } = require("tesseract.js");
const worker = new TesseractWorker();

//Storage declaring
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/lang", (req, res) => {
  console.log(req.body.language);
});

app.post("/upload", (req, res) => {
  upload(req, res, err => {
    try {
      fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
        if (err) return console.log("Something went wrong: ", err);
        //worker recognizing
        worker
          .recognize(data, "eng", { tessjs_create_pdf: "1" })
          .progress(progress => {
            // console.log(progress);
          })
          .then(result => {
            res.redirect("/download");
          })
          .finally(() => worker.terminate());
      });
    } catch (error) {
      console.error(error);
    }
  });
});
app.post("/russian_upload", (req, res) => {
  upload(req, res, err => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("Something went wrong: ", err);
      //worker recognizing
      worker
        .recognize(data, "rus", { tessjs_create_pdf: "1" })
        .progress(progress => {
          // console.log(progress);
        })
        .then(result => {
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

app.get("/download", (req, res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
  res.sendFile(file);
});

//Start up the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
