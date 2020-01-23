module.exports = function (collection, collection_key, total, limit, page){

	var _page = page || 0;
	var obj = {page_info:{total:0, current_page:0, total_pages:0}}

	obj[collection_key] = [];
	if(collection.length){
		obj[collection_key] = collection;
		obj.page_info.total = total;
		obj.page_info.current_page = _page || 1;
		obj.page_info.total_pages = Math.ceil(total / limit);

	}

	return obj;

}