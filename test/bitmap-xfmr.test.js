const assert = require('chai').assert;
// const expect = require('chai').expect;
const fs = require('fs');
const Bitmap = require('../lib/bitmap-xfmr');

// const filetypes = ['BM', 'BA', 'CI', 'CP', 'IC', 'PT'];

describe('buffer read', function() {

  it ('reads buffer from file', function(done) {
    fs.readFile('palette-bitmap.bmp', (err, buffer) => {
      // console.log(buffer);
      assert(buffer instanceof Buffer);
      done(err);
    });
  });

});

describe('Bitmap constructor', function() {

  let myBmp;
  before(function() {
    myBmp = new Bitmap('palette-bitmap.bmp');
  });

  it('properly extracts bmp file header', function() {
    let expected = JSON.parse(fs.readFileSync('test/palette-bitmap-bmp-file-header.json'));
    let actual = myBmp.bmp_file_header;
    assert.deepEqual(actual, expected);
  });

  it('properly extracts DIB header', function() {
    let expected = JSON.parse(fs.readFileSync('test/palette-bitmap-dib-header.json'));
    let actual = myBmp.dib_header;
    assert.deepEqual(actual, expected);
  });

});