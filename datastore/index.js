const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

// load bluebird module for asynchronous task
const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    // specify the path with the unique id as it name
    let filePath = path.join(exports.dataDir, `${id}.txt`);

    console.log('file path => ', filePath)

    // write to the file with only the text
    fs.writeFile(filePath, text, (error) => {
      if(error) {
        callback(error);
      } else {
        callback(null, {id, text });
      }
    });
  });
};

exports.readAll = (callback) => {
  // look through the directory call dataDir
  fs.readdir(exports.dataDir, (error, files) => {
    if(error) {
      throw ('No such data file');
    }

    // map through the files
    let data = _.map(files, (file) => {

      // find the file name that end with .txt
      console.log('file => ', file)

      let id = path.basename(file, '.txt');

      // get the file path
      let filePath = path.join(exports.dataDir, file);

      console.log('file path in readall => ', filePath)

      // return all file with its id and text
      return readFilePromise(filePath).then(fileData => {
        return {
          id: id,
          text: fileData.toString()
        };
      });
    });

    // apply all the callback to all the data file
    Promise.all(data)
      .then(items => callback(null, items), error => callback(error));
  });
};

exports.readOne = (id, callback) => {
  // grab the file path based off of id
  let filePath = path.join(exports.dataDir, `${id}.txt`)

  // read the file
  fs.readFile(filePath, (error, fileData) => {
    if(error) {
      callback(error);
    } else {
      callback(null, { id, text: fileData.toString() });
    }
  })
};

exports.update = (id, text, callback) => {
  // grab the file path by the id
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  // update the file
  fs.writeFile(filePath, text, (error) => {
    if(error) {
      callback(error);
    } else {
      callback(null, { id, text });
    }
  });
};

exports.delete = (id, callback) => {
  // grab the file path by the id
  let filePath = path.join(exports.dataDir, `${id}.txt`);

  // remove the file using fs.unlink
  fs.unlink(filePath, (error) => {
    callback(error)
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
