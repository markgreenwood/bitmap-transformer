# Bitmap transformer

## API

### Constructor

```myBmp = new Bitmap(filename, [callback(err, data)]);```

Construct a new Bitmap from the data in filename.

### Transformer

```myBmp.transform(label, [arguments])```

Transform the bitmap where label is one of the available transforms:
 - 'redder' makes the image redder by a specified factor
 - 'bluer' makes the image bluer...
 - 'greener' makes the image greener...
 - 'invert' inverts the colors in the image (i.e. new_color = 255 - old_color)
 - 'grayscale' makes the image grayer by a specified factor

Example:

```
myBmp.transform('redder', 3);
myBmp.writeBufferToFile('images/redder3.bmp', (err) => {
  console.log(err || 'Done!'); 
});
```

### Save to file

```myBmp.writeBufferToFile(filename, [callback(err, data)])```

Write the Bitmap object's buffer out to a .bmp file.