const fs = require('fs');

// constructor for a Color object we can use to manipulate colors
function Color(red, green, blue, alpha) {
  this.red = red;
  this.green = green;
  this.blue = blue;
  this.alpha = alpha;
}

// PalettePixel is a single number representing an index in the color table
function PalettePixel(ct_idx) {
  this.ct_idx = ct_idx;
}

// NonpalettePixel is three numbers representing RGB color components of that pixel
function NonpalettePixel(r, g, b) {
  this.red = r;
  this.green = g;
  this.blue = b;
}

// constructor for a Bitmap object we initialize by reading the specified .bmp file
function Bitmap(filename, cb) {
  // TODO: convert to async readFile()
  let self = this;
  fs.readFile(filename, (err, data) => {
    if (err) return cb(err);
    self.buffer = data;
    self.bmp_file_header = {
      ftype: self.buffer.slice(0,2).toString(),
      fsize: self.buffer.readUInt32LE(2),
      reserved1: self.buffer.readUInt16LE(6),
      reserved2: self.buffer.readUInt16LE(8),
      img_data_offs: self.buffer.readUInt32LE(10)
    };

    self.dib_header = {};
    self.dib_header.dib_hdr_size = self.buffer.readUInt32LE(14);

    if (self.dib_header.dib_hdr_size == 40) { self.dib_header.dib_hdr_type = 'BITMAPINFOHEADER'; }

    if (self.dib_header.dib_hdr_type === 'BITMAPINFOHEADER') {
      self.dib_header.img_width = self.buffer.readUInt32LE(18);
      self.dib_header.img_height = self.buffer.readUInt32LE(22);
      self.dib_header.n_colorplanes = self.buffer.readUInt16LE(26);
      self.dib_header.bits_per_pixel = self.buffer.readUInt16LE(28);
      self.dib_header.compression_method = self.buffer.readUInt32LE(30);
      self.dib_header.img_size = self.buffer.readUInt32LE(34);
      self.dib_header.hres = self.buffer.readUInt32LE(38);
      self.dib_header.vres = self.buffer.readUInt32LE(42);
      self.dib_header.n_cols_palette = self.buffer.readUInt32LE(46);
      self.dib_header.n_cols_important = self.buffer.readUInt32LE(50);
    }
    else {
      throw Error('DIB header type not supported.');
    }

    if (self.dib_header.bits_per_pixel === 8) self.palette = true;
    else self.palette = false;
    // or...
    // self.palette = (self.dib_header.bits_per_pixel === 8);

    self.color_table = [];
    let color_tbl_offs = 14 + self.dib_header.dib_hdr_size;
    for (let i = color_tbl_offs; i < self.bmp_file_header.img_data_offs; i += 4) {
      let color_tbl_idx = Math.round((i - color_tbl_offs) / 4);
      self.color_table[color_tbl_idx] = new Color(
        self.buffer.readUInt8(i+2),  // red
        self.buffer.readUInt8(i+1),  // green
        self.buffer.readUInt8(i),    // blue
        self.buffer.readUInt8(i+3)   // alpha
      );
    }

    let pixel_idx = self.bmp_file_header.img_data_offs;
    self.imageData = [];
    for (let row = 0; row < self.dib_header.img_height; row++) {
      for (let col = 0; col < self.dib_header.img_width; col++) {
        if (self.palette) {
          self.imageData.push(new PalettePixel(self.buffer.readUInt8(pixel_idx)));
          pixel_idx += 1;
        }
        else {
          let b = self.buffer.readUInt8(pixel_idx);
          let g = self.buffer.readUInt8(pixel_idx + 1);
          let r = self.buffer.readUInt8(pixel_idx + 2);
          self.imageData.push(new NonpalettePixel(r, g, b));
          pixel_idx += 3;
        }
      }
    }
    return cb(null);
  });
}

Bitmap.prototype.transform = function (xfrm, ...args) {
  let xfrms = {
    'redder': this.redderImage,
    'greener': this.greenerImage,
    'bluer': this.bluerImage,
    'invert': this.invertColors,
    'grayscale': this.grayScale
  };
  if (!xfrms.hasOwnProperty(xfrm)) throw Error('Transform "' + xfrm + '" not supported.');
  xfrms[xfrm].call(this, args);
  if (this.palette) {
    this.updateBufferColorTable();
  }
  else {
    this.updateBufferImageData();
  }
};

Bitmap.prototype.redderImage = function(factor) {
  factor = factor || 1;
  if (this.palette) {
    for (let i = 0; i < this.color_table.length; i++) {
      this.color_table[i].red = Math.min(this.color_table[i].red * factor, 255);
    }
  }
  else {
    for (let i = 0; i < this.imageData.length; i++) {
      this.imageData[i].red = Math.min(this.imageData[i].red * factor, 255);
    }
  }
};

Bitmap.prototype.greenerImage = function(factor) {
  factor = factor || 1;
  if (this.palette) {
    for (let i = 0; i < this.color_table.length; i++) {
      this.color_table[i].green = Math.min(this.color_table[i].green * factor, 255);
    }
  }
  else {
    for (let i = 0; i < this.imageData.length; i++) {
      this.imageData[i].green = Math.min(this.imageData[i].green * factor, 255);
    }
  }
};

Bitmap.prototype.bluerImage = function(factor) {
  factor = factor || 1;
  if (this.palette) {
    for (let i = 0; i < this.color_table.length; i++) {
      this.color_table[i].blue = Math.min(this.color_table[i].blue * factor, 255);
    }
  }
  else {
    for (let i = 0; i < this.imageData.length; i++) {
      this.imageData[i].blue = Math.min(this.imageData[i].blue * factor, 255);
    }
  }
};

Bitmap.prototype.invertColors = function() {
  if (this.palette) {
    for (let i = 0; i < this.color_table.length; i++) {
      this.color_table[i].red = 255 - this.color_table[i].red;
      this.color_table[i].blue = 255 - this.color_table[i].blue;
      this.color_table[i].green = 255 - this.color_table[i].green;
    }
  }
  else {
    for (let i = 0; i < this.imageData.length; i++) {
      this.imageData[i].red = 255 - this.imageData[i].red;
      this.imageData[i].blue = 255 - this.imageData[i].blue;
      this.imageData[i].green = 255 - this.imageData[i].green;
    }
  }
};

Bitmap.prototype.grayScale = function(factor) {
  if (this.palette) {
    for (let i = 0; i < this.color_table.length; i++) {
      this.color_table[i].red = Math.min(this.color_table[i].red * factor, 255);
      this.color_table[i].blue = Math.min(this.color_table[i].blue * factor, 255);
      this.color_table[i].green = Math.min(this.color_table[i].green * factor, 255);
    }
  }
  else {
    for (let i = 0; i < this.imageData.length; i++) {
      this.imageData[i].red = Math.min(this.imageData[i].red * factor, 255);
      this.imageData[i].blue = Math.min(this.imageData[i].blue * factor, 255);
      this.imageData[i].green = Math.min(this.imageData[i].green * factor, 255);
    }    
  }
};

Bitmap.prototype.copyColorTable = function() {
  return this.color_table.map(function(color) {
    return { red: color.red, green: color.green, blue: color.blue, alpha: color.alpha };
  });
};

Bitmap.prototype.copyImageData = function() {
  return this.imageData.map(function(color) {
    return { red: color.red, green: color.green, blue: color.blue };
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

Bitmap.prototype.updateBufferImageData = function() {
  let img_idx = this.bmp_file_header.img_data_offs;
  for (let i = 0; i < this.imageData.length; i++) {
    this.buffer.writeUInt8(this.imageData[i].blue, img_idx);
    this.buffer.writeUInt8(this.imageData[i].green, img_idx+1);
    this.buffer.writeUInt8(this.imageData[i].red, img_idx+2);
    img_idx += 3;
  }
};

Bitmap.prototype.writeBufferToFile = function (outfile, cb) {
  fs.writeFile(outfile, this.buffer, function(err) {
    return cb(err);
  });
};

module.exports = Bitmap;