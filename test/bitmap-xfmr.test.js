const assert = require('chai').assert;
const expect = require('chai').expect;
const fs = require('fs');
const bm = require('../lib/bitmap-xfmr.js');

const filetypes = ['BM', 'BA', 'CI', 'CP', 'IC', 'PT'];

describe('buffer read', function() {

  it ('reads buffer from file', function(done) {
    fs.readFile('palette-bitmap.bmp', (err, buffer) => {
      assert(buffer instanceof Buffer);
      done(err);
    });
  });

  it('extracts header info from the bitmap buffer', function() {
    expect(bm.bitmap_file_header.file_type).to.be.oneOf(filetypes);
  }); 
});