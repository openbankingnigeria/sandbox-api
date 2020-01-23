const obval = require('mlar')('obval'); 
module.exports = (product) => {
    const normalized = obval.exclude(['id','createdAt','updatedAt', 'productType', 'deletedAt']).from(product);
    normalized.productId = (product.id + '').padStart(10, 0);
    return normalized;
}