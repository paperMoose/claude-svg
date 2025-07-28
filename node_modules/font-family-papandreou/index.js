// parse
// =====

// states
// ------

var PLAIN                = 0;
var STRINGS              = 1;
var ESCAPING             = 2;
var IDENTIFIER           = 3;
var SEPARATING           = 4;
var SPACEAFTERIDENTIFIER = 5;
var ESCAPINGIDENTIFIER   = 6;

// patterns
// --------

var identifierPattern = /[a-z0-9_-]/i;
var spacePattern      = /[\s\t]/;

// ---

var parse = function(str) {

  // vars
  // ----

  var starting = true;
  var state    = PLAIN;
  var buffer   = '';
  var i        = 0;
  var quote;
  var c;

  // result
  // ------

  var names  = [];

  // parse
  // -----

  while (true) {

    c = str[i];

    if (state === PLAIN) {

      if (!c && starting) {

        break;

      } else if (!c && !starting) {

        throw new Error('Parse error');

      } else if (c === '"' || c === "'") {

        quote = c;
        state = STRINGS;
        starting = false;

      } else if (spacePattern.test(c)) {
      } else if (identifierPattern.test(c)) {

        state = IDENTIFIER;
        starting = false;
        i--;

      } else {

        throw new Error('Parse error');

      }

    } else if (state === STRINGS) {

      if (!c) {

        throw new Error('Parse Error');

      } else if (c === "\\") {

        state = ESCAPING;

      } else if (c === quote) {

        names.push(buffer);
        buffer = '';
        state = SEPARATING;

      } else {

        buffer += c;

      }

    } else if (state === ESCAPING) {

      if (c === quote || c === "\\") {

        buffer += c;
        state = STRINGS;

      } else {

        throw new Error('Parse error');

      }

    } else if (state === IDENTIFIER) {

      if (!c) {

        names.push(buffer);
        break;

      } else if (identifierPattern.test(c)) {

        buffer += c;

      } else if (c === ',') {

        names.push(buffer);
        buffer = '';
        state = PLAIN;

      } else if (spacePattern.test(c)) {

        state = SPACEAFTERIDENTIFIER;
      } else if (c === "\\") {

        state = ESCAPINGIDENTIFIER;
      } else {

      }
    } else if (state === ESCAPINGIDENTIFIER) {

      if (/[0-9a-f]/i.test(c)) {
        // TODO: Support escaped unicode characters (backslash followed by hex digits)
        // https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident

        throw new Error('Parse error');
      } else {
        buffer += c;
        state = IDENTIFIER;
      }
    } else if (state === SPACEAFTERIDENTIFIER) {

      if (!c) {

        names.push(buffer);
        break;

      } else if (identifierPattern.test(c)) {

        buffer += ' ' + c;
        state = IDENTIFIER;

      } else if (c === ',') {

        names.push(buffer);
        buffer = '';
        state = PLAIN;

      } else if (spacePattern.test(c)) {
      } else {

        throw new Error('Parse error');

      }

    } else if (state === SEPARATING) {

      if (!c) {

        break;

      } else if (c === ',') {

        state = PLAIN;

      } else if (spacePattern.test(c)) {
      } else {

        throw new Error('Parse error');

      }

    }

    i++;

  }

  // result
  // ------

  return names;

};

// stringify
// =========

// pattern
// -------

var stringsPattern = /[^a-z0-9_-]/i;

// ---

var stringify = function(names, options) {

  // quote
  // -----

  var quote = options && options.quote || '"';
  if (quote !== '"' && quote !== "'") {
    throw new Error('Quote must be `\'` or `"`');
  }
  var quotePattern = new RegExp(quote, 'g');

  // stringify
  // ---------

  var safeNames = [];

  for (var i = 0; i < names.length; ++i) {
    var name = names[i];

    if (stringsPattern.test(name)) {
      name = name
        .replace(/\\/g, "\\\\")
        .replace(quotePattern, "\\" + quote);
      name = quote + name + quote;
    }
    safeNames.push(name);
  }

  // result
  // ------

  return safeNames.join(', ');
};

// export
// ======

module.exports = {
  parse:     parse,
  stringify: stringify,
};
