require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// قاعدة بيانات مؤقتة في الذاكرة
let urlDatabase = {};
let counter = 1;

// API: POST /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;

  try {
    const parsedUrl = new URL(original_url);

    dns.lookup(parsedUrl.hostname, (err, address) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        const short_url = counter++;
        urlDatabase[short_url] = original_url;
        res.json({ original_url, short_url });
      }
    });

  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

// API: GET /api/shorturl/:short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url = req.params.short_url;
  const original_url = urlDatabase[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Listen
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
