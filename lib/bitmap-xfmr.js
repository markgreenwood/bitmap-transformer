function Bitmap(filename) {
  this.buffer = fs.readFileSync(filename);
  this.bmp_file_header = {
    ftype: this.buffer.slice(0,2).toString(),
    fsize: this.buffer.readUInt32LE(2),
    reserved1: this.buffer.readUInt16LE(6),
    reserved2: this.buffer.readUInt16LE(8),
    img_data_offs: this.buffer.readUInt32LE(10)
  };
  this.dib_header = {
    dib_hdr_size: this.buffer.readUInt32LE(14),
    img_width: this.buffer.readUInt32LE(18),
    img_height: this.buffer.readUInt32LE(22),
    n_colorplanes: this.buffer.readUInt16LE(26),
    bits_per_pixel: this.buffer.readUInt16LE(28),
    compression_method: this.buffer.readUInt32LE(30),
    img_size: this.buffer.readUInt32LE(34),
    hres: this.buffer.readUInt32LE(38),
    vres: this.buffer.readUInt32LE(42),
    n_cols_palette: this.buffer.readUInt32LE(46),
    n_cols_important: this.buffer.readUInt32LE(50)
  };
}

module.exports = Bitmap;