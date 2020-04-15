//Load HTTP module
/*const http = require("http");
const hostname = '127.0.0.1';
const port = 3000;

//Create HTTP server and listen on port 3000 for requests
const server = http.createServer((req, res) => {

  //Set the response HTTP header with HTTP status and Content type
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

//listen for request on port 3000, and as a callback function have the port listened on logged
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

const express = require('express');
const app = express();
const { check } = require('express-validator');
const neatCsv = require('neat-csv');
const fs = require('fs')
const PORT = process.env.PORT || 8000
let data = {
    f_programmes:{},
    f_industry : {},
    f_numEmployed : {},
    f_reasons : {},
    f_comments : {}
};

function readData(fileName, name){
    fs.readFile(fileName, async (err, file_data) => {
        if (err) {
          console.error(err)
          return
        }
        data[name] = await neatCsv(file_data);
    })
}
readData('files/programmes.csv', 'f_programmes');
readData('files/industry_type.csv', 'f_industry');
readData('files/number_employ.csv', 'f_numEmployed');
readData('files/reason_employ.csv', 'f_reasons');
readData('files/other_comment.csv', 'f_comments');

app.use(express.urlencoded())
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    //res.send('Hello World!');
  
    res.render('pages/index', {
        index: 'active',
        form: '',
        music: ''
    });
});
   /* [
    check('name').trim().escape(),
    check('email').isEmail(),
    check('age').isNumeric()
    ]*/
app.post('/submit-form', (req, res) => {
    form_data = req.body;
    prog = data['f_programmes'][parseInt(form_data['T_PROG'])]['Description'];
    ind = data['f_industry'][parseInt(form_data['T_PROG']) - 1]['Description'];
    numEmpNames = data['f_numEmployed'].map((item)=>{
        let key = 'E_NUM_Y' + item['Description'].substring(2, 4) + '_txtb';
        let obj = {};
        obj[item['Description']] = form_data[key];
        return obj;
    });
    reasons = data['f_reasons'].map((item)=>{
        let key = 'E_REA_' + item['Varname'];
        if (form_data.hasOwnProperty(key)){
            return item['Description'];
        }
        else{
            return '';
        }
    }).filter((item) => {
        return item.substring(0, 1).toUpperCase() + item.substring(1, item.length);
    });
    //console.log(reasons);
    let commentKey = 'O_COM_' + data['f_comments'][0]['Varname'] + '_txta';
    res.render('pages/submit_form',{
        index: '',
        form: 'active',
        music: '',
        t_prog: prog,
        t_ind: ind,
        e_num: numEmpNames, //array
        e_rea: reasons, //array
        o_com: form_data[commentKey]
    });
});
app.get('/submit-form', (req, res) => {
    //res.send('No POST data');

    res.render('pages/submit_form_get', {
        index: '',
        form: 'active',
        music: ''
    });
});
app.get('/music', (req, res) => {
    //res.send('No POST data');

    res.render('pages/music', {
        index: '',
        form: '',
        music: 'active'
    });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${ PORT }`)
});