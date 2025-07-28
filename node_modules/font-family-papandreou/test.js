var expect = require('chai').expect;

var parse     = require('./index').parse;
var stringify = require('./index').stringify;

describe('font-family', function() {
  describe('parse()', function() {
    it('should parse family names', function() {
      var result = parse('"Helvetica Neue", Helvetica, sans-serif');

      expect(result).to.have.length(3);
      expect(result[0]).to.equal('Helvetica Neue');
      expect(result[1]).to.equal('Helvetica');
      expect(result[2]).to.equal('sans-serif');
    });

    it('should parse unquoted multi-word family names', function() {
      var result = parse('Helvetica Neue, Helvetica, Open   Sans, sans-serif');
      expect(result).to.have.length(4);
      expect(result[0]).to.equal('Helvetica Neue');
      expect(result[1]).to.equal('Helvetica');
      expect(result[2]).to.equal('Open Sans');
      expect(result[3]).to.equal('sans-serif');
    });

    it('should parse family names even if it is minified', function() {
      var result = parse('"Helvetica Neue",Helvetica,sans-serif');

      expect(result).to.have.length(3);
      expect(result[0]).to.equal('Helvetica Neue');
      expect(result[1]).to.equal('Helvetica');
      expect(result[2]).to.equal('sans-serif');
    });

    it('should parse a family name with an escaped space', function() {
      var result = parse('Font Awesome\\ 5 Free');

      expect(result).to.have.length(1);
      expect(result[0]).to.equal('Font Awesome 5 Free');
    });

    it('should parse a family name with an escaped backslash', function() {
      var result = parse('Foo\\\\Bar');

      expect(result).to.have.length(1);
      expect(result[0]).to.equal('Foo\\Bar');
    });
  });

  describe('stringify()', function() {
    it('should stringify list of family names', function() {
      var result = stringify(['Helvetica Neue', 'Helvetica', 'sans-serif']);

      expect(result).to.equal('"Helvetica Neue", Helvetica, sans-serif');
    });

    it('should stringify list of family names even if single quotes are specified', function() {
      var result = stringify(['Helvetica Neue', 'Helvetica', 'sans-serif'], {quote: "'"});

      expect(result).to.equal("'Helvetica Neue', Helvetica, sans-serif");
    });
  });
});
