const assert = require('chai').assert;

describe('buffer read', function() {
  it ('reads buffer from file', function(done) {
    fs.readFile('non-palette-bitmap.bmp', (err, buffer) => {
      assert(buffer instanceof Buffer);
      done(err);
    });
  }
});