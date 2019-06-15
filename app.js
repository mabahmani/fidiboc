const express = require('express');
const Crawler = require("crawler");
const { Pool, Client } = require('pg');
const app = express();
const port = process.env.PORT || 3000;

const client = new Client({
    user: 'huwbvilkzdqrpd',
    host: 'ec2-54-163-226-238.compute-1.amazonaws.com',
    database: 'd2bhf6abp3tplc',
    password: 'b44612c3f03e9f2615bfe0d01a9ffed3edcd995e90e5cdffddffe4967ade0362',
    port: 5432,
    ssl: true
});
client.connect();

var defquery = 'INSERT INTO public.amintable(isbn, bookid) VALUES ({{isbn}}, {{bookid}});';

var getBookQuery = "select distinct bookid from public.amintable where isbn = '{{isbn}}';"

var defurl = 'https://fidibo.com/book/{{bookid}}';
var link = [];
for (var i=70001; i<=91049; i++){

    var url = defurl.replace('{{bookid}}',i);
    link.push(url);
    //console.log(url);
}
app.get('/update', function (req, res){

var c = new Crawler({
    maxConnections: 100,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            var isbn = $('.book-tags ul li label').text().replace(/-/g,"");
            var bookid = $('.text-info').text().trim().split('/').slice(-1).pop();
            //console.log(isbn);
            console.log(bookid);

            var q = defquery.replace('{{isbn}}', isbn);
            q = q.replace('{{bookid}}', bookid);

            //console.log(q);

            client.query(q, (err, res) => {
                //console.log(err, res);
            })
        }
        done();
    }
});

c.queue(link);
});


app.get('/getBookId/:isbn', function(req,exres){
    var q = getBookQuery.replace('{{isbn}}',req.params.isbn);
    var myBookid;
    client.query(q, (err, res) => {
        if(err == null){
            if(res.rowCount > 0){
                myBookid = {bookId:res.rows[0].bookid}
                exres.json(myBookid);
            }
            else{
                myBookid = {bookId:null};
                exres.json(myBookid);     
            }
        }
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));