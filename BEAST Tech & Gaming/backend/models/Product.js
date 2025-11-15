const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling']
  },
  brand: {
    type: String,
    required: true,
    enum: ['intel', 'amd', 'nvidia', 'asus', 'msi', 'gigabyte', 'corsair', 'seasonic']
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  images: [String],
  specifications: Map,
  description: String,
  compatibility: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);