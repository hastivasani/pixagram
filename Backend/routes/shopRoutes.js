const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const upload  = require("../middleware/upload");
const ctrl    = require("../controllers/shopController");

// Products
router.get("/products/categories",         ctrl.getCategories);
router.get("/products/mine",               protect, ctrl.getMyProducts);
router.get("/products",                    ctrl.getProducts);
router.get("/products/:id",                ctrl.getProduct);
router.post("/products",                   protect, upload.array("images", 5), ctrl.createProduct);
router.put("/products/:id",                protect, upload.array("images", 5), ctrl.updateProduct);
router.delete("/products/:id",             protect, ctrl.deleteProduct);
router.post("/products/:id/review",        protect, ctrl.addReview);

// Cart
router.get("/cart",                        protect, ctrl.getCart);
router.post("/cart",                       protect, ctrl.addToCart);
router.put("/cart/:productId",             protect, ctrl.updateCartItem);
router.delete("/cart/:productId",          protect, ctrl.removeFromCart);
router.delete("/cart",                     protect, ctrl.clearCart);

// Orders
router.post("/orders",                     protect, ctrl.createOrder);
router.get("/orders",                      protect, ctrl.getMyOrders);
router.get("/orders/:id",                  protect, ctrl.getOrder);
router.post("/orders/:id/cancel",          protect, ctrl.cancelOrder);
router.get("/seller/orders",               protect, ctrl.getSellerOrders);
router.put("/seller/orders/:id/status",    protect, ctrl.updateOrderStatus);

module.exports = router;
