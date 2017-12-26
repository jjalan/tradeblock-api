const express = require('express');

const i18n = require('i18n');

const app = express();

const logger = require('./helpers/log.js');

const compression = require('compression');

const path = require('path');

// See: https://github.com/mashpie/i18n-node for more options
i18n.configure({
  locales: ['en', 'de'],
  defaultLocale: 'en',
  directory: path.join(__dirname, 'locales'),
});

// default: using 'accept-language' header to guess language settings
// See: https://github.com/mashpie/i18n-node
app.use(i18n.init);
app.use(compression());
app.use(require('express-status-monitor')());

app.get('/', (req, res) => {
  res.send(res.__('HELLO_WORLD'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info('Server started on port %s', port));
