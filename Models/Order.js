const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: String,
  products: String, // Stored as stringified JSON
  totalAmount: Number,
  orderDate: Date,
  status: String,
});

module.exports = mongoose.model('Order', OrderSchema);
