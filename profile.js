let express = require('express');
let app = express();
let path = require('path');
let fs = require("fs");


const PORT = 3000;
const BIO_FILE_NAME = "bio.txt";
const FRIENDS_PATH = path.join(__dirname, "private/");
const TITLE_FILE_NAME = "title.txt"
const TEXT_START = "text";
const TEXT_END = "txt";

// set the view engine to ejs
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')));

app.get('/profile', function(req, res) { 
  // get ID entered by user
  let id = req.query.id;

  // get right title & short description by ID
  let title_file = fs.readFileSync(`private/${id}/${TITLE_FILE_NAME}`,'utf-8');
  let title_lines = title_file.split("\n");


 // get relevant bio file to the id
 let bio = fs.readFileSync(`private/${id}/${BIO_FILE_NAME}`, { encoding: 'utf-8', flag: 'r' });
 let bio_lines = bio.split("\n"); 


 // get friends list (except the one that the user view his profile)
 let friends = fs.readdirSync(FRIENDS_PATH,{ encoding: 'utf-8', flag: 'r' });
 let filtered_friends = friends.filter(function (friend) {
   if(friend!==id){
     return friend;
   };
 });

  // get files name that start with "text" and ends with "txt"
  const TEXT_PATH = path.join(__dirname, `private/${id}`);
  let files = fs.readdirSync(TEXT_PATH,{ encoding: 'utf-8', flag: 'r' });
  let filtered_files = files.filter(function (text_file){
    return text_file.split(".")[0].slice(0,4)===TEXT_START && text_file.split(".")[1]===TEXT_END;
  });

      // get content of relevant text files
      let endorsement_files = [];
      for (let i=0; i< filtered_files.length;i++){
          let file_name = filtered_files[i];
          endorsement_files.push(fs.readFileSync(`private/${id}/${file_name}`, { encoding: 'utf-8', flag: 'r' }));
        };


 // load the page with relevant filling to the id entered
 res.render('profile', {id,title_lines,bio_lines,filtered_friends,endorsement_files});
});

app.listen(PORT);
console.log(`Server is listening on port ${PORT}`); 
