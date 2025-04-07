# Node.js + MongoDB + GraphQL Project

## 1. Clone the Repository

git clone https://github.com/Sangmeshwar19/mongo-graphql.git
cd mongo-graphql


## 2. Install Dependencies

npm install --legacy-peer-deps

## 3. Create `.env` File

Create a `.env` file in the root folder and add:

MONGO_URI=mongodb://localhost:27017/your-database-name 
PORT=5000



## 4. Start the Server

nodemon index.js


GraphQL playground:  
http://localhost:5000/graphql

---

## 5. Example GraphQL Queries

### Get Top Selling Products
{
  "query": "query { getTopSellingProducts(limit: 5) { productId name totalSold } }"
}



### Get Customer Spending

{
  "query": "query { getCustomerSpending(customerId: \"e7d22fe7-bee5-4507-bcb8-8b4b999dc9fd\") { customerId totalSpent averageOrderValue lastOrderDate } }"
}


### Get Sales Analytics

{
  "query": "query { getSalesAnalytics(startDate: \"2025-01-01T10:35:58\", endDate: \"2025-12-31T23:59:59\") { totalRevenue completedOrders categoryBreakdown { category revenue } } }"
}


