module.exports = function (byrefobj, lookupobj, keystolookup) {

  keystolookup.forEach( key => {
    if(lookupobj[key]) {
      byrefobj[key] = lookupobj[key];
    }
  })

}
//to use for edits and the likes just do, upsert(model_instance, params, ['email', 'id', 'opop'])
//can even add a callback should in case you need to do stuff on each assignment