const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan')
const moment = require('moment');
const {FB, FacebookApiException} = require('fb');
const randomColor = require('randomcolor');

const APP_ID = "301634764001016";
const APP_SECRET = "add0dd650dacd729b0ab3ea90b8ac4d9";

const PORT = process.env.PORT || 3000;
const app = express();
app.set('views', path.join(__dirname, '/public'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public/assets'));

// Change cookie: { secure: true, httpOnly: true } when deploying to Production environment

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(morgan('dev'))

// Views
app.get('/', function(req, res) {
  res.render('views/index');
});

app.get('/events', function(req, res) {
  console.log(req.query.code);
  if (!!req.query && !!req.query.code) {
    console.log("Getting fb token");

    FB.api('oauth/access_token', {
      client_id: APP_ID,
      client_secret: APP_SECRET,
      redirect_uri: 'http://localhost:3000/events',
      code: req.query.code
    }, function (resToken) {
      if(!resToken || resToken.error) {
        console.log(!resToken ? 'error occurred' : resToken.error);
        let msg = !resToken ? 'Please login with facebook!' : resToken.error.message;
        res.render('views/events', {
          id: 0,
          title: !msg ? "Please login with facebook!" : msg,
          colorCode: randomColor({luminosity: 'dark', count: 5}),
          events: [],
          moment: moment
        });
        return;
      }

      var accessToken = resToken.access_token;
      var expires = resToken.expires ? resToken.expires : 0;

      let fieldList = "id,name,events.limit(50){name,place,description,cover,start_time,attending_count,interested_count}";
      FB.api('me', { fields: fieldList, access_token: accessToken }, function (fbRes) {
        console.log(JSON.stringify(fbRes, null, 2));

        res.render('views/events', {
          id: fbRes.id,
          title: fbRes.name + '\'s Facebook Events',
          colorCode: randomColor({luminosity: 'dark', count: fbRes.events.data.length}),
          events: fbRes.events.data,
          moment: moment
        });
      });
    });
  } else {
    res.render('views/events', {
      id: 0,
      title: "Please login with facebook!",
      colorCode: randomColor({luminosity: 'dark', count: 5}),
      events: [],
      moment: moment
    });
  }
});


app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

