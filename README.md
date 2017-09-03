# SJSGI
**SailsJS Gateway Interface** Pass requests to sails through CGI

Description
-----------

CGI describes requests to a script with environment variables loosely according
to [RFC3875](https://tools.ietf.org/html/rfc3875), depending on the
implementation. This package uses those variables to make a SailsJS
[virtual request](http://sailsjs.com/documentation/reference/application/advanced-usage/sails-request)
and output a CGI response.

Sails and the app are loaded, executed, and lowered on each request, but
without running the bootstrap or HTTP server.


Installation
------------

```npm install sjsgi --save```


Usage
-----

```javascript
#!/usr/bin/env node7
/**
 * cgi-bin/sails.cgi
 */

const gi = require('sjsgi')

// Default to production environment
if ( ! process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

/**
 * Configure with a SailsJS config object
 * http://sailsjs.com/documentation/reference/configuration
 *
 * Note: These values take precedence over app/config/.
 */
let config = {
  // hooks: {},
  // blueprints: {},
  // ...
  // views: {}
}

/**
 * Configure with .sailsrc
 * http://sailsjs.com/documentation/concepts/configuration/using-sailsrc-files
 */
// let config = require('sails/accessible/rc')('sails')

// Load the app, make a virtual request, and lower the app.
gi.sails(config)

```

Errors
------

By default the CGIError level is set to *1*, which outputs the `safeMessage`
message. Use level *2* to output the actual message and level *3* for a
stacktrace. See `/lib/app/cgi/Error.js` for levels and config options.

Example error levels:

```javascript
#!/usr/bin/env node7

const gi = require('sjsgi')
const CGIError = require('sjsgi/lib/app/cgi/Error')

// Safe errors
// CGIError.init({
//   level: 1,
//   safeMessage: 'There was an error.'
// })

// Actual errors
// CGIError.init({
//   level: 2
// })

// Errors and stacktraces
CGIError.init({
  level: 3
})

gi.sails({})

```

Contribute
----------

- Raise issues at https://github.com/jasonschmedes/sjsgi/issues
- Make pull requests at https://github.com/jasonschmedes/sjsgi/pulls
- Send suggestions to jason@schmedes.info



License
-------

MIT License Copyright (C) 2017 Jason Schmedes
