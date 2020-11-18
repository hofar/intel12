const express = require("express");
var http = require("http");
var url = require('url');
var qString = require('querystring');
// var routes = require("routes")();
var view = require('swig');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: '104.161.66.10',
    port: 3306,
    database: 'hofarism_node',
    user: 'hofarism_root',
    password: 'Vu4quis+-',
});

const app_url = "/nodejs/api";
const app = express();
const router = express.Router();

router.get('/tes', function (req, res) {
    console.log('tes');
    res.end('tes page');
});

router.get('/', function (req, res) {
    connection.query("select * from mahasiswa", function (err, rows, field) {
        if (err) {
            if (err) throw err;
        }
        // rows.forEach(function (item) {
        //     console.log(item.no_induk + " ==> " + item.nama);
        // });
        // res.writeHead(200, {"Content-Type": "text/plain"});
        // res.end(JSON.stringify(rows));

        var html = view.compileFile('./template/index.html')({
            title: "Data Mahasiswa",
            data: rows,
            app_url: app_url
        });

        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(html);
    });
});

router.get('/insert', function (req, res) {
    if (req.method.toUpperCase() == "POST") {
        var data_post = "";
        req.on('data', function (chunks) {
            data_post += chunks;
        });

        req.on('end', function () {
            data_post = qString.parse(data_post);
            // console.log(data_post);
            // res.end();

            connection.query("insert into mahasiswa set ?", data_post, function (err, field) {
                if (err) {
                    if (err) throw err;
                }
                res.writeHead(302, {"Location": "/"});
                res.end();
                // console.log(field.affectedRows);
                // res.end();
            });
        })
    } else {
        var html = view.compileFile('./template/form.html')();

        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(html);
    }
});

router.get('/update/:id', function (req, res) {
    connection.query("select * from mahasiswa where ?", {
        no_induk: req.params.id
    }, function (err, rows, fields) {
        if (rows.length) {
            var data = rows[0];
            if (req.method.toUpperCase() == "POST") {
                var data_post = "";
                req.on('data', function (chunks) {
                    data_post += chunks;
                });

                req.on('end', function () {
                    data_post = qString.parse(data_post);
                    // console.log(data_post);
                    // res.end();

                    connection.query("update mahasiswa set ? where ?", [
                        data_post,
                        {
                            no_induk: data.no_induk,
                        }
                    ], function (err, field) {
                        if (err) {
                            if (err) throw err;
                        }
                        res.writeHead(302, {"Location": app_url});
                        res.end();
                        // console.log(field.affectedRows);
                        // res.end();
                    });
                })
            } else {
                var html = view.compileFile('./template/form_update.html')({
                    data: data,
                    app_url: app_url
                });

                res.writeHead(200, {"Content-Type": "text/html"});
                res.end(html);
            }
        } else {
            var html = view.compileFile('./template/404.html')();

            res.writeHead(404, {"Content-Type": "text/html"});
            res.end(html);
        }
    });
});

router.get('/delete/:id', function (req, res) {
    connection.query("delete from mahasiswa where ?", {
        no_induk: this.params.id,
    }, function (err, field) {
        if (err) {
            if (err) throw err;
        }
        // rows.forEach(function (item) {
        //     console.log(item.no_induk + " ==> " + item.nama);
        // });
        res.writeHead(302, {"Location": "/"});
        res.end();
    });
});

app.use(app_url, router);

const app_port = '3000';
app.listen(process.env.PORT || app_port, function () {
    console.log(`Server is running on port: ${process.env.PORT || app_port}`);
});