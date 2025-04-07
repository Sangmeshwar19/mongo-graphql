// const mongoose = require('mongoose');
// const Customer = require('./Models/Customer');  // Adjust the path accordingly

// // Connect to MongoDB (adjust URL to your MongoDB instance)
// mongoose.connect('mongodb://localhost:27017/ecommerce', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('Connected to MongoDB');
//     const newCustomer = new Customer({
//       name: 'John Doe',
//       email: 'john.doe@example.com',
//       age: 30,
//       location: 'New York',
//       gender: 'Male',
//     });

//     return newCustomer.save();
//   })
//   .then(customer => {
//     console.log('Customer saved:', customer);
//     mongoose.disconnect();
//   })
//   .catch(err => {
//     console.error('Error:', err);
//     mongoose.disconnect();
//   });
