const graphql = require('graphql');
const { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLID, GraphQLNonNull } = graphql;

const Customer = require('../Models/Customer');
const Product = require('../Models/product');
const Order = require('../Models/order');

const CustomerSpendingType = new GraphQLObjectType({
  name: 'CustomerSpending',
  fields: () => ({
    customerId: { type: GraphQLString },
    totalSpent: { type: GraphQLFloat },
    averageOrderValue: { type: GraphQLFloat },
    lastOrderDate: { type: GraphQLString },
  }),
});

const TopProductType = new GraphQLObjectType({
  name: 'TopProduct',
  fields: () => ({
    productId: { type: GraphQLString },
    name: { type: GraphQLString },
    totalSold: { type: GraphQLInt },
  }),
});

const CategoryRevenueType = new GraphQLObjectType({
  name: 'CategoryRevenue',
  fields: () => ({
    category: { type: GraphQLString },
    revenue: { type: GraphQLFloat },
  }),
});

const SalesAnalyticsType = new GraphQLObjectType({
  name: 'SalesAnalytics',
  fields: () => ({
    totalRevenue: { type: GraphQLFloat },
    completedOrders: { type: GraphQLInt },
    categoryBreakdown: { type: new GraphQLList(CategoryRevenueType) },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    getCustomerSpending: {
      type: CustomerSpendingType,
      args: { customerId: { type: new GraphQLNonNull(GraphQLID) } },
      async resolve(parent, args) {
        console.log("args", args);
        const customerOrders = await Order.find({ customerId: args.customerId, status: 'completed' });
        console.log('customerOrders', customerOrders);

        if (customerOrders.length === 0) return null;

        const totalSpent = customerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const averageOrderValue = totalSpent / customerOrders.length;
        const lastOrderDate = customerOrders.reduce((latest, order) =>
          new Date(order.orderDate) > new Date(latest) ? order.orderDate : latest, customerOrders[0].orderDate);

        return {
          customerId: args.customerId,
          totalSpent,
          averageOrderValue,
          lastOrderDate,
        };
      },
    },

    getTopSellingProducts: {
      type: new GraphQLList(TopProductType),
      args: { limit: { type: new GraphQLNonNull(GraphQLInt) } },
      async resolve(parent, args) {
        const orders = await Order.find({ status: 'completed' });
        const productMap = {};

        orders.forEach(order => {
          let products = [];
          try {
            products = JSON.parse(order.products.replace(/'/g, '"'));
          } catch (e) {
            console.error('Error parsing products JSON', e);
          }

          products.forEach(item => {
            if (!productMap[item.productId]) {
              productMap[item.productId] = 0;
            }
            productMap[item.productId] += item.quantity;
          });
        });

        const topProducts = Object.entries(productMap)
          .map(([productId, totalSold]) => ({ productId, totalSold }))
          .sort((a, b) => b.totalSold - a.totalSold)
          .slice(0, args.limit);

        const results = [];
        for (const product of topProducts) {
          const productInfo = await Product.findById(product.productId);
          if (productInfo) {
            results.push({
              productId: product.productId,
              name: productInfo.name,
              totalSold: product.totalSold,
            });
          }
        }

        return results;
      },
    },

    getSalesAnalytics: {
      type: SalesAnalyticsType,
      args: {
        startDate: { type: new GraphQLNonNull(GraphQLString) },
        endDate: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(_, { startDate, endDate }) {
        console.log("startDate:", startDate);
        console.log("endDate:", endDate);
    
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Confirm if dates are valid
        if (isNaN(start) || isNaN(end)) {
          throw new Error("Invalid date format. Must be ISO string.");
        }
    
        // Find all completed orders in date range
        const orders = await Order.find({
          status: 'completed',
          $expr: {
            $and: [
              { $gte: [{ $toDate: "$orderDate" }, new Date(startDate)] },
              { $lte: [{ $toDate: "$orderDate" }, new Date(endDate)] }
            ]
          }
        });
        
    
        console.log('Found Orders:', orders.length);
    
        let totalRevenue = 0;
        const categoryRevenueMap = {};
        const completedOrders = orders.length;
    
        for (const order of orders) {
          let products = [];
    
          try {
            products = JSON.parse(order.products.replace(/'/g, '"'));
          } catch (e) {
            console.error('Error parsing products JSON for order:', order._id, e);
            continue; // skip this order
          }
    
          totalRevenue += order.totalAmount;
    
          for (const item of products) {
            try {
              const product = await Product.findById(item.productId);
              if (product) {
                if (!categoryRevenueMap[product.category]) {
                  categoryRevenueMap[product.category] = 0;
                }
                categoryRevenueMap[product.category] += item.quantity * item.priceAtPurchase;
              }
            } catch (e) {
              console.error('Error fetching product:', item.productId, e);
            }
          }
        }
    
        const categoryBreakdown = Object.entries(categoryRevenueMap).map(([category, revenue]) => ({
          category,
          revenue,
        }));
    
        return {
          totalRevenue,
          completedOrders,
          categoryBreakdown,
        };
      },
    },
    
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
