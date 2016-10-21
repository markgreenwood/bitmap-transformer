const assert = require('chai').assert;
const expect = require('chai').expect;
const fs = require('fs');
const Bitmap = require('../lib/bitmap-xfmr');

const filetypes = ['BM', 'BA', 'CI', 'CP', 'IC', 'PT'];

describe('buffer read', function() {

  it ('reads buffer from file', function(done) {
    fs.readFile('palette-bitmap.bmp', (err, buffer) => {
      console.log(buffer);
      assert(buffer instanceof Buffer);
      done(err);
    });
  });

});

describe('constructor', function() {

  let myBmp;
  before(function() {
    myBmp = new Bitmap('palette-bitmap.bmp');
  });

  it('extracts file type from the bmp file header', function() {
    expect(myBmp.bmp_file_header.ftype).to.be.oneOf(filetypes);
  });

  it('extracts correct image size', function() {
    assert.equal(myBmp.dib_header.img_size, (myBmp.bmp_file_header.fsize - myBmp.bmp_file_header.img_data_offs));
  });

});