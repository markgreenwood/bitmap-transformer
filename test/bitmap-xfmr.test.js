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

  it('constructs an empty Bitmap object and throws error if you try to use it before reading a file', function() {
    // let testBmp = new Bitmap();
    // expect(testBmp.transform('redder', 2)).to.throw(Error);
  });

});

describe('Bitmap constructor with palette bitmap', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('palette-bitmap.bmp', done);
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

describe('Bitmap constructor with non-palette bitmap', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('non-palette-bitmap.bmp', done);
  });

  it('properly extracts bmp file header on non-palette bitmap file', function() {
    let expected = JSON.parse(fs.readFileSync('test/non-palette-bitmap-bmp-file-header.json'));
    let actual = myBmp.bmp_file_header;
    assert.deepEqual(actual, expected);
  });

  it('properly extracts DIB header on non-palette bitmap file', function() {
    let expected = JSON.parse(fs.readFileSync('test/non-palette-bitmap-dib-header.json'));
    let actual = myBmp.dib_header;
    assert.deepEqual(actual, expected);
  });

});

describe('updateBufferImageData', function() {

  let myBmp;
  before(function(done) {
    myBmp = new Bitmap('non-palette-bitmap.bmp', done);
  });

  it('doesn\'t corrupt file when called on unmodified image data', function() {
    let ref_buffer = fs.readFileSync('non-palette-bitmap.bmp');
    myBmp.updateBufferImageData();
    let actual = myBmp.buffer;
    assert.deepEqual(actual, ref_buffer);
  });
  
});

describe('updateBufferColorTable', function() {

  let myBmp;
  before(function(done) {
    myBmp = new Bitmap('palette-bitmap.bmp', done);
  });

  it('doesn\'t corrupt file when called on unmodified color table', function() {
    let ref_buffer = fs.readFileSync('palette-bitmap.bmp');
    myBmp.updateBufferColorTable();
    let actual = myBmp.buffer;
    assert.deepEqual(actual, ref_buffer);
  });
  
});

describe('palette invertColors transform', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('palette-bitmap.bmp', done);
  });

  it('inverts the color table', function() {
    let initColorTbl = myBmp.copyColorTable();
    myBmp.invertColors();
    let actual = myBmp.copyColorTable();
    let expected = initColorTbl.map(function(color) {
      return {
        red: 255 - color.red,
        blue: 255 - color.blue,
        green: 255 - color.green,
        alpha: color.alpha
      };
    });
    assert.deepEqual(actual, expected);
  });

});

describe('palette redder x3 transform', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('palette-bitmap.bmp', done);
  });

  it('matches buffer from golden chicken test/palette-redder3.bmp', function() {
    let ref_buffer = fs.readFileSync('test/palette-redder3.bmp');
    myBmp.transform('redder', 3);
    let actual = myBmp.buffer;
    assert.deepEqual(actual, ref_buffer);
  });

});

describe('palette bluer x2 transform', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('palette-bitmap.bmp', done);
  });

  it('matches buffer from golden chicken test/palette-bluer2.bmp', function() {
    let ref_buffer = fs.readFileSync('test/palette-bluer2.bmp');
    myBmp.transform('bluer', 2);
    let actual = myBmp.buffer;
    assert.deepEqual(actual, ref_buffer);
  });

});

describe('non-palette greener x3 transform', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('non-palette-bitmap.bmp', done);
  });

  it('matches buffer from golden chicken test/non-palette-greener3.bmp', function() {
    let ref_buffer = fs.readFileSync('test/non-palette-greener3.bmp');
    myBmp.transform('greener', 3);
    let actual = myBmp.buffer;
    assert.deepEqual(actual, ref_buffer);
  });

});

describe('non-palette invertColors transform', function() {

  let myBmp;
  before(function(done) {
    // TODO: convert to async constructor
    myBmp = new Bitmap('non-palette-bitmap.bmp', done);
  });

  it('inverts the color table', function() {
    let initImgData = myBmp.copyImageData();
    myBmp.invertColors();
    let actual = myBmp.copyImageData();
    let expected = initImgData.map(function(color) {
      return {
        red: 255 - color.red,
        blue: 255 - color.blue,
        green: 255 - color.green,
      };
    });
    assert.deepEqual(actual, expected);
  });

});