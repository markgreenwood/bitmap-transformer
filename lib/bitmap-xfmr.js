const fs = require('fs');

function Color(red, green, blue, alpha) {
  this.red = red;
  this.green = green;
  this.blue = blue;
  this.alpha = alpha;
}

function Bitmap(filename) {
  this.buffer = fs.readFileSync(filename);
  this.bmp_file_header = {
    ftype: this.buffer.slice(0,2).toString(),
    fsize: this.buffer.readUInt32LE(2),
    reserved1: this.buffer.readUInt16LE(6),
    reserved2: this.buffer.readUInt16LE(8),
    img_data_offs: this.buffer.readUInt32LE(10)
  };

  this.dib_header = {};
  this.dib_header.dib_hdr_size = this.buffer.readUInt32LE(14);

  if (this.dib_header.dib_hdr_size == 40) { this.dib_header.dib_hdr_type = 'BITMAPINFOHEADER'; }

  if (this.dib_header.dib_hdr_type === 'BITMAPINFOHEADER') {
    this.dib_header.img_width = this.buffer.readUInt32LE(18);
    this.dib_header.img_height = this.buffer.readUInt32LE(22);
    this.dib_header.n_colorplanes = this.buffer.readUInt16LE(26);
    this.dib_header.bits_per_pixel = this.buffer.readUInt16LE(28);
    this.dib_header.compression_method = this.buffer.readUInt32LE(30);
    this.dib_header.img_size = this.buffer.readUInt32LE(34);
    this.dib_header.hres = this.buffer.readUInt32LE(38);
    this.dib_header.vres = this.buffer.readUInt32LE(42);
    this.dib_header.n_cols_palette = this.buffer.readUInt32LE(46);
    this.dib_header.n_cols_important = this.buffer.readUInt32LE(50);
  }
  else {
    throw Error('DIB header type not supported.');
  }

  this.color_table = [];
  let color_tbl_offs = 14 + this.dib_header.dib_hdr_size;
  for (let i = color_tbl_offs; i < this.bmp_file_header.img_data_offs; i += 4) {
    let color_tbl_idx = Math.round((i - color_tbl_offs) / 4);
    this.color_table[color_tbl_idx] = new Color(
      this.buffer.readInt8(i+2),  // red
      this.buffer.readInt8(i+1),  // green
      this.buffer.readInt8(i),    // blue
      this.buffer.readInt8(i+3)   // alpha
    );
  }

  let pixel_idx = this.bmp_file_header.img_data_offs;
  this.pixel = [];

  // console.log('pixel_idx: ' + pixel_idx);
  // create image as an array of arrays (faux 2D array)
  for (let i = 0; i < this.dib_header.img_height; i++) {
    this.pixel[i] = [];
    for (let j = 0; j < this.dib_header.img_width; j++) {
      this.pixel[i][j] = this.buffer.readInt8(pixel_idx);
      pixel_idx++;
    }
  }
}

Bitmap.transform = function (xfmrFunc) {
  // TODO: fill in function
};

module.exports = Bitmap;