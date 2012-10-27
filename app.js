var express = require('express');
var app = express();


// configuration
app.engine('html', require('ejs').__express);
app.set('views', __dirname + '/templates');
app.set('view engine', 'html');
app.use('/static', express.static(__dirname + '/public'));


// routes
app.get('*', function(req, res){
    res.render('index');
});


app.listen(3000);
console.log('check 127.0.0.1:3000 out');