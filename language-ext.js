const langExts = {
  ".c": "c",
  ".css": "css",
  ".go": "go",
  ".groovy": "groovy",
  ".java": "java",
  ".js": "javascript",
  ".json": "json",
  ".properties": "properties",
  ".py": "python"
}

module.exports = function (value, type = 'ext') {
  if (type == 'ext') {
    if (langExts[value])
      return langExts[value]
    return "markup"
  }
  return ''
};
