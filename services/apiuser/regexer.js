module.exports = function (val, regex, optional_message) {
  if(!val) return;
  if(regex.test(val)) throw new Error(optional_message || "Validation failed");
}