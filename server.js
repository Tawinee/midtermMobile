var express = require("express");
var app = express();
var data = require("./data.json");

var mongo = require("mongodb");

var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var option = { useUnifiedTopology: true, useNewUrlParser: true };

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("pages/index", { profile: data });
});

app.get("/products", function(req, res) {
  MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mobile");
    var query = {};
    //Find the first document in the customers collection:
    dbo
      .collection("MobilePhone")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        res.render("pages/Products", { product: result });
        db.close();
      });
  });
});

app.get("/productId/:mobile_id", function(req, res) {
  var proid = req.params.id;

  // Get the class detail form mongodb

  MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mobile");
    var query = { ProductID: proid };
    //Find the first document in the customers collection:
    dbo.collection("MobilePhone").findOne(query, function(err, result) {
      if (err) throw err;
      console.log(result);
      res.render("pages/productId", { product: result });
      db.close();
    });
  });
});

app.get("/productedit/:id", function(req, res) {
  var proid = req.params.id;
  //Get the class detail from mongodb
  MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mobile");
    var query = {
      mobile_id: proid
    };
    dbo.collection("MobilePhone").findOne(query, function(err, result) {
      if (err) throw err;
      console.log(result);
      res.render("pages/productedit", { detail: result });
      db.close();
    });
  });
});

app.post("/savepro", function(req, res) {
  var id = req.body.id;
  var brand = req.body.brand;
  var generation = req.body.generation;
  var price = req.body.price;
  MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mobile");
    //select target
    var query = {
      mobile_id: id
    };
    //set naw value
    var newvalues = {
      $set: { mobile_brand: brand, generation: generation, price: price }
    };
    dbo
      .collection("MobilePhone")
      .updateOne(query, newvalues, function(err, ressult) {
        if (err) throw err;
        console.log("1 document updated");
        db.close();
        res.redirect("/products");
      });
  });
});

app.post("/addpro", function(req, res) {
  //Insert
  let self = res;
  MongoClient.connect(url, option, function(err, db) {
    if (err) throw err;
    var dbo = db.db("mobile");
    var newmobile = {
      mobile_id: req.body.id,
      mobile_brand: req.body.brand,
      generation: req.body.generation,
      price: req.body.price
    };

    dbo.collection("MobilePhone").insertOne(newmobile, function(err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
      self.redirect("/products");
    });
  });
});


app.get("/productadd", function(req, res) {
  var detail = {
    mobile_id: "",
    mobile_brand: "",
    generation: "",
    price: ""
  };
  res.render("pages/productadd", { detail: detail });
});



app.get("/productdelete/:id", function(req, res) {
    let self = res;
    MongoClient.connect(url, option, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mobile");
      var query = {
        mobile_id: req.params.id
      };
      dbo.collection("MobilePhone").deleteOne(query, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        db.close();
        self.redirect("/products");
      });
    });
  });

  



app.listen(8000);
console.log("Express started at http://localhost:8000");
