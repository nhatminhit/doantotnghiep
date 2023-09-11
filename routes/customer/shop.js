var express = require('express');
var router = express.Router();
const auth = require('../../controllers/auth');
const shop = require('../../controllers/customer/shop');

router.get('/', shop.store);
router.get('/newproduct', shop.newProduct);
router.get('/price-high-to-low', shop.priceHighToLow);
router.get('/price-low-to-high', shop.priceLowToHigh);
router.get('/product', shop.getProductByPerpage);
router.post('/filter', shop.filterProduct);
router.get('/detail/id=:id', shop.detailProduct);
router.post('/comment', auth.authen, shop.feedbackProduct);
router.get('/wishlist', auth.authen, shop.favorite);
router.get('/product/favorite', shop.favoriteProduct);
router.get('/product/deleteFavorite', shop.deleteFavoriteProduct);
router.get('/wishlist/delete/id=:id', shop.deleteWishlist);
router.get('/addCart/id=:id', shop.addProductCart);
router.get('/product/criteria', shop.criteriaProduct);

module.exports = router;
