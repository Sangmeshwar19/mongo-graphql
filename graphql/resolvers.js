const Customer = require('./models/customer');
const Product = require('./models/product');
const Order = require('./models/order');

// Resolver functions
const resolvers = {
  Query: {
    // Query for customer spending
    getCustomerSpending: async (_, { customerId }) => {
      const orders = await Order.aggregate([
        { $match: { customerId } },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$customerId',
            totalSpent: { $sum: { $multiply: ['$products.quantity', '$products.priceAtPurchase'] } },
            averageOrderValue: { $avg: '$totalAmount' },
            lastOrderDate: { $max: '$orderDate' }
          }
        }
      ]);

      const spending = orders[0];

      return {
        customerId,
        totalSpent: spending.totalSpent,
        averageOrderValue: spending.averageOrderValue,
        lastOrderDate: spending.lastOrderDate.toISOString()
      };
    },

    // Query for top-selling products
    getTopSellingProducts: async (_, { limit }) => {
      const topProducts = await Order.aggregate([
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalSold: { $sum: '$products.quantity' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            productId: '$_id',
            name: '$productDetails.name',
            totalSold: 1
          }
        }
      ]);

      return topProducts;
    },

    // Query for sales analytics
    getSalesAnalytics: async (_, { startDate, endDate }) => {
      const salesData = await Order.aggregate([
        { $match: { orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            completedOrders: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        {
          $group: {
            _id: '$productDetails.category',
            revenue: { $sum: '$totalAmount' }
          }
        }
      ]);

      return {
        totalRevenue: salesData[0].totalRevenue,
        completedOrders: salesData[0].completedOrders,
        categoryBreakdown: salesData.map(item => ({
          category: item._id,
          revenue: item.revenue
        }))
      };
    }
  }
};

module.exports = resolvers;
