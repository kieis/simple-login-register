const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql');
const path = require('path');
const favicon = require('serve-favicon');
const bcrypt = require('bcrypt');
const generateAccessToken = require('./generateAccessToken');

const app = express();
const joinDir = (file) => path.join(__dirname, file);

dotenv.config({ path: './.env'});

app.use('/css', express.static(joinDir('node_modules/bootstrap/dist/css')));
app.use('/js', express.static(joinDir('node_modules/bootstrap/dist/js')));
app.use('/js', express.static(joinDir('node_modules/jquery/dist')));
app.use(favicon(joinDir('/public/images/favicon.ico')));
app.use(express.static(joinDir('public')));
app.use(express.urlencoded({extended: false}));
app.use(express.json()); //parse request body as JSON, middleware

app.set('view engine', 'ejs');

/*mysql connection*/
const db = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

db.getConnection((err, connection) => {
    if (err) {
        throw (err)
    }
    console.log("DB connected: " + connection.threadId)
 })

/*get routes*/
app.get('/', (req, res) => {
    res.render('./pages/index.ejs', {
        pageTitle: 'Home',
    });
});

app.get('/signin', (req, res) => {
    res.render('./pages/login.ejs', {
        pageTitle: 'Sign In',
    });
});

app.get('/signup', (req, res) => {
    res.render('./pages/register.ejs', {
        pageTitle: 'Sign Up',
    });
});

function isValid(text){
    return (typeof text === typeof "" && text.length > 0);
}

/*post routes*/
app.post('/reguser', async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    if(isValid(email) && isValid(username) && isValid(password)) {
        db.getConnection(async (error, connection) => {
            if(error) throw (error);  

            const searchQry = mysql.format('SELECT * FROM users WHERE user_name = ? OR user_email = ?', [username, email]);
            await connection.query(searchQry, async (error, result) => {
                if((error)) throw (error); 

                if(result.length > 0) {
                    connection.release();
                    res.sendStatus(409); //Conflict
                }else{
                    const insertQry = mysql.format('INSERT INTO users VALUES (0,?,?,?)', [username, email, hashedPassword]);
                    await connection.query(insertQry, async (error, result) => {
                        connection.release();
                        if(error) throw (error); 
                        res.sendStatus(201); //Created
                    });
                }
            });
        });
    }else {
        res.sendStatus(406); //Not acceptable
    }
});

app.post('/auth', async (req, res) =>{
    const username = req.body.username;
    const password = req.body.password;

    if(isValid(username) && isValid(username)) {
        db.getConnection(async (error, connection) => {
            if(error) throw(error);

            const searchQry = mysql.format('SELECT user_pass FROM users WHERE user_name = ? OR user_email = ?', [username, username]);
            await connection.query(searchQry, async (error, result) => {
                if(error) throw(error);
                if(result.length > 0) {
                    connection.release();
                    const hashedPassword = result[0].user_pass;
                    if(await bcrypt.compare(password, hashedPassword)) {
                        res.sendStatus(200); //OK
                        //const token = generateAccessToken({user: username});
                    }else{
                        res.sendStatus(401); //Unauthorized
                    }
                } else{
                    connection.release();
                    res.sendStatus(404); //Not found
                }
            });
        });
    }else {
        res.sendStatus(401); //Unauthorized
    }
});

/*port*/
app.listen(process.env.LISTEN_PORT, () =>{
    console.log('Listening port 5000');
});