const {Tags} = require('../build/Release/ctags.node');
const es = require('event-stream');

exports.findTags = function(tagsFilePath, tag, options, callback) {
  if (typeof tagsFilePath !== 'string') {
    throw new TypeError('tagsFilePath must be a string');
  }

  if (typeof tag !== 'string') {
    throw new TypeError('tag must be a string');
  }

  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  const {partialMatch, caseInsensitive} = options != null ? options : {};

  const tagsWrapper = new Tags(tagsFilePath);
  tagsWrapper.findTags(tag, partialMatch, caseInsensitive, function(error, tags) {
    tagsWrapper.end();
    return callback?.(error, tags);
  });

  return undefined;
};

exports.createReadStream = function(tagsFilePath, options) {
  if (options == null) { options = {}; }
  if (typeof tagsFilePath !== 'string') {
    throw new TypeError('tagsFilePath must be a string');
  }

  let {chunkSize} = options;
  if (typeof chunkSize !== 'number') { chunkSize = 100; }

  const tagsWrapper = new Tags(tagsFilePath);
  return es.readable(function(count, callback) {
    if (!tagsWrapper.exists()) {
      return callback(new Error(`Tags file could not be opened: ${tagsFilePath}`));
    }

    return tagsWrapper.getTags(chunkSize, (error, tags) => {
      if ((error != null) || (tags.length === 0)) { tagsWrapper.end(); }
      callback(error, tags);
      if ((error != null) || (tags.length === 0)) { return this.emit('end'); }
    });
  });
};
