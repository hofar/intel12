var http = require("http");
var url = require('url');
var qString = require('querystring');
var routes = require("routes")();
var view = require('swig');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    database: 'nodejs',
    user: 'root',
    password: '',
});

routes.addRoute('/', function (req, res) {
    connection.query("select * from mahasiswa", function (err, rows, field) {
        if (err) {
            throw err;
        }
        // rows.forEach(function (item) {
        //     console.log(item.no_induk + " ==> " + item.nama);
        // });
        // res.writeHead(200, {"Content-Type": "text/plain"});
        // res.end(JSON.stringify(rows));

        var html = view.compileFile('./template/index.html')({
            title: "Data Mahasiswa",
            data: rows
        });

        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(html);
    });
});

routes.addRoute('/insert', function (req, res) {
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
                    throw err;
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

routes.addRoute('/update/:id', function (req, res) {
    connection.query("select * from mahasiswa where ?", {
        no_induk: this.params.id
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
                            throw err;
                        }
                        res.writeHead(302, {"Location": "/"});
                        res.end();
                        // console.log(field.affectedRows);
                        // res.end();
                    });
                })
            } else {
                var html = view.compileFile('./template/form_update.html')({
                    data: data
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

routes.addRoute('/delete/:id', function (req, res) {
    connection.query("delete from mahasiswa where ?", {
        no_induk: this.params.id,
    }, function (err, field) {
        if (err) {
            throw err;
        }
        // rows.forEach(function (item) {
        //     console.log(item.no_induk + " ==> " + item.nama);
        // });
        res.writeHead(302, {"Location": "/"});
        res.end();
    });
});

http.createServer(function (req, res) {
    var path = url.parse(req.url).pathname;
    var match = routes.match(path);
    if (match) {
        match.fn(req, res); // request, response
    } else {
        var html = view.compileFile('./template/404.html')({
            title: "Page Not Found"
        });
        res.writeHead(404, {"Content-Type": "text/html"});
        res.end(html);
    }
}).listen(8888);

console.log('Server is running');