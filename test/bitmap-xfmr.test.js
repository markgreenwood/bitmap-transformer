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

  it('properly extracts bmp file header on palette bitmap file', function() {
    let expected = JSON.parse(fs.readFileSync('test/palette-bitmap-bmp-file-header.json'));
    let actual = myBmp.bmp_file_header;
    assert.deepEqual(actual, expected);
  });

  it('properly extracts DIB header on palette bitmap file', function() {
    let expected = JSON.parse(fs.readFileSync('test/palette-bitmap-dib-header.json'));
    let actual = myBmp.dib_header;
    assert.deepEqual(actual, expected);
  });

});

describe('invertColors transform', function() {

  let myBmp;
  before(function() {
    myBmp = new Bitmap('palette-bitmap.bmp');
  });

  it('inverts the color table', function() {
    let initColorTbl = myBmp.getColorTable();
    myBmp.invertColors();
    let actual = myBmp.getColorTable();
    let expected = initColorTbl.forEach(function(color) {
      return {
        red: 255 - color.red,
        blue: 255 - color.blue,
        green: 255 - color.green
      };
    });
    console.log('actual: ', actual);
    console.log('expected: ', expected);
    assert.deepEqual(actual, expected);
  });

});