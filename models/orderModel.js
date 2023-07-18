const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
    },
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'canceled',
      'cancelPending',
      'returnPending',
      'returned',
    ],
    default: 'pending',
  },
  orderNumber: { type: Number },
  date: {
    type: Date,
    default: Date.now,
  },

});


const autoIncrementPlugin = (schema, options) => {
  const { field = 'orderNumber', startAt = 1 } = options;

  schema.pre('save', async function (next) {
    try {
      if (!this[field]) {
        const lastOrder = await this.constructor.findOne({}, field).sort({ [field]: -1 }).exec();
        const newOrderNumber = lastOrder ? lastOrder[field] + 1 : startAt;
        this[field] = newOrderNumber;
      }
      next();
    } catch (error) {
      next(error);
    }
  });
};

orderSchema.plugin(autoIncrementPlugin, { field: 'orderNumber', startAt: 1000 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
