// File created by Aviv Eliyahu and Matan Asraf.
let express = require('express');
let app = express();
let mysql = require('mysql');
let path = require('path');
let fs = require("fs");


const NODE_PORT = 3000;
const BIO_FILE_NAME = "bio.txt";
const FRIENDS_PATH = path.join(__dirname, "private/");


const URL = "localhost";
const SQL_PORT = "3306";
const USERNAME = "root";
const PASSWORD = "12345";
const DATABASE = "profiles";

// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));

app.get('/profile', function (req, res) {
  // get ID entered by user
  let id = req.query.id;

  // get relevant bio file to the id
  let bio = fs.readFileSync(`private/${id}/${BIO_FILE_NAME}`, { encoding: 'utf-8', flag: 'r' });
  let bio_lines = bio.split("\n");

  // get friends list (except the one that the user view his profile)
  let friends = fs.readdirSync(FRIENDS_PATH, { encoding: 'utf-8', flag: 'r' });
  let filtered_friends = friends.filter(function (friend) {
    if (friend !== id) {
      return friend;
    };
  });

  // get right title & short description by ID from our SQL DB
  // connect to DB
  const con = mysql.createConnection({
    host: URL,
    port: SQL_PORT,
    database: DATABASE,
    user: USERNAME,
    password: PASSWORD
  });

  // recieve relevant information from DB 
  let title_endor = [];
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connection created.");
    let parameter = [id];
    con.query("SELECT ti.title as title,ti.long_text as title_text ,te.long_text as endor, te.signature as signature FROM title ti left join text te on ti.profile = te.profile " +
      "WHERE ti.profile like ?", parameter,
      function result(err, result) {
        if (err) throw err;
        let i = 0;
        for (line of result) {
          if (i === 0) {
            title_endor.push(line["title"]);
            title_endor.push(line["title_text"]);
            title_endor.push(line["endor"]);
            title_endor.push(line["signature"]);
            i++;
          }
          else {
            title_endor.push(line["endor"]);
            title_endor.push(line["signature"]);
            i++;
          }
        }
        // load the page with relevant filling to the id entered
        res.render('profile', { id, title_endor, bio_lines, filtered_friends });
      });
    con.end(function (err) {
      if (err) throw err;
      console.log("Connection terminated.");
    });
  });
});

app.listen(NODE_PORT);
console.log(`Server is listening on port ${NODE_PORT}`); 