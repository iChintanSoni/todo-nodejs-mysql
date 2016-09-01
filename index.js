// Call express module and Initialize it
var express = require("express");
var app = express();

// Call mysql module
var mysql = require('mysql');

// Call body-parser module
var bodyParser = require('body-parser');

// Configure app to use body-parser so as to get data from POST
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var pool  = mysql.createPool({
	host     		: '<replace with your host ip address>',
	user     		: '<replace with your database user name>',
	password 	: '<replace with your password>',
	database 		: '<replace with your Database Name>',
	connectionLimit : 1000,
	queueLimit	: 0
});

// Set port number
app.set('port', (process.env.PORT || 5000));

// get instance of express Router
var router = express.Router();

// This means /api will be required in all routes
app.use('/api', router);

// The default route
router.get('/', function (request, response) {
    response.json('Welcome, to ToDo Api...!');
});

// Get all TODOs
router.get("/todo", function (request, response) {
    pool.getConnection(function (error, connection) {
        connection.query('SELECT * from tabletodo', function (error, rows, fields) {
            connection.release();
            if (error)
                throw error;
            response.json(rows);
        });
    });
});

// Get todo by id
router.get("/todo/:id", function (request, response) {
    pool.getConnection(function (error, connection) {
        connection.query('SELECT * from tabletodo where ID=?', request.params.id, function (error, rows, fields) {
            connection.release();
            if (error)
                throw error;
            response.json(rows[0]);
        });
    });
});

// insert todo data and return the record
router.post("/todo", function (request, response) {
    pool.getConnection(function (error, connection) {
        connection.query('INSERT INTO tabletodo SET ?', {Description: request.body.description, IsComplete: request.body.iscomplete}, function (error, rows, fields) {
            connection.release();
            if (error)
                throw error;
            var res = request.body;
            res.id = rows.insertId;
            response.json(res);
        });
    });
});

// update todo data and return the record
router.put("/todo", function (request, response) {
    pool.getConnection(function (error, connection) {
        connection.query('UPDATE tabletodo SET ? where ID=?',
                [
                    {
                        Description: request.body.description,
                        IsComplete: request.body.iscomplete
                    },
                    request.body.id
                ],
                function (error, rows, fields) {
                    connection.release();
                    if (error)
                        throw error;
                    var res = request.body;
                    response.json(res);
                }
        );
    });
});

// update todo data and return the record
router.delete("/todo", function (request, response) {
    pool.getConnection(function (error, connection) {
        connection.query('DELETE from tabletodo where ID=?',
                [
                    request.body.id
                ],
                function (error, rows, fields) {
                    connection.release();
                    if (error)
                        throw error;
                    var res = request.body;
                    response.json(res);
                }
        );
    });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});