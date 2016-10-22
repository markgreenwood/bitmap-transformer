const fs = require('fs');

// constructor for a Color object we can use to manipulate colors
function Color(red, green, blue, alpha) {
  this.red = red;
  this.green = green;
  this.blue = blue;
  this.alpha = alpha;
}

// constructor for a Bitmap object we initialize by reading the specified .bmp file
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
      this.buffer.readUInt8(i+2),  // red
      this.buffer.readUInt8(i+1),  // green
      this.buffer.readUInt8(i),    // blue
      this.buffer.readUInt8(i+3)   // alpha
    );
  }

  let pixel_idx = this.bmp_file_header.img_data_offs;
  this.pixel = [];

  // create image as an array of arrays (faux 2D array)
  for (let i = 0; i < this.dib_header.img_height; i++) {
    this.pixel[i] = [];
    for (let j = 0; j < this.dib_header.img_width; j++) {
      this.pixel[i][j] = this.buffer.readUInt8(pixel_idx);
      pixel_idx++;
    }
  }
}

// my_bmp = new Bitmap(...)
// my_bmp.transform('redder');

Bitmap.prototype.transform = function (xfmr) {
  let xfrms = {
    'redder': this.redderImage,
    'greener': this.greenerImage,
    'bluer': this.bluerImage,
    'invert': this.invertColors
  };

  xfrms[xfmr].call(this);
};

Bitmap.prototype.redderImage = function(factor) {
  factor = factor || 1;
  for (let i = 0; i < this.color_table.length; i++) {
    this.color_table[i].red = Math.min(this.color_table[i].red * factor, 255);
  }
};

Bitmap.prototype.greenerImage = function(factor) {
  factor = factor || 1;
  for (let i = 0; i < this.color_table.length; i++) {
    this.color_table[i].green = Math.min(this.color_table[i].green * factor, 255);
  }
};

Bitmap.prototype.bluerImage = function(factor) {
  factor = factor || 1;
  for (let i = 0; i < this.color_table.length; i++) {
    this.color_table[i].blue = Math.min(this.color_table[i].blue * factor, 255);
  }
};

Bitmap.prototype.invertColors = function() {
  for (let i = 0; i < this.color_table.length; i++) {
    this.color_table[i].red = 255 - this.color_table[i].red;
    this.color_table[i].blue = 255 - this.color_table[i].blue;
    this.color_table[i].green = 255 - this.color_table[i].green;
  }
};

Bitmap.prototype.copyColorTable = function() {
  return this.color_table.map(function(color) {
    return { red: color.red, green: color.green, blue: color.blue, alpha: color.alpha };
  });
};

Bitmap.prototype.updateBufferColorTable = function() {
  let color_tbl_offs = 14 + this.dib_header.dib_hdr_size;
  for (let i = 0; i < this.color_table.length; i++) {
    let buffer_idx = Math.round(color_tbl_offs + (4 * i));
    this.buffer.writeUInt8(this.color_table[i].blue, buffer_idx);
    this.buffer.writeUInt8(this.color_table[i].green, buffer_idx+1);
    this.buffer.writeUInt8(this.color_table[i].red, buffer_idx+2);
    this.buffer.writeUInt8(this.color_table[i].alpha, buffer_idx+3);
  }
};

Bitmap.prototype.writeBufferToFile = function (outfile) {
  fs.writeFileSync(outfile, this.buffer);
};

module.exports = Bitmap;