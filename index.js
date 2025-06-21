require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();
const urlParser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// In-memory "database" to store URLs
let urlDatabase = {};
let counter = 1;

// ✅ POST /api/shorturl — to shorten a URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    // Only accept URLs with http or https
    if (!/^https?:/.test(parsedUrl.protocol)) {
      return res.json({ error: 'invalid url' });
    }

    // DNS lookup to verify domain exists
    dns.lookup(parsedUrl.hostname, (err, address) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        const short_url = counter++;
        urlDatabase[short_url] = originalUrl;
        return res.json({
          original_url: originalUrl,
          short_url: short_url
        });
      }
    });
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

// ✅ GET /api/shorturl/:short_url — to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const short_url = req.params.short_url;
  const original_url = urlDatabase[short_url];

  if (original_url) {
    res.redirect(original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

// Start server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
