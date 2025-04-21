const express = require('express')
const middlewares = require('./middlewares/global')
const userRouter = require('./routes/user');
const cuisineRouter = require('./routes/cuisine');
const boxRouter = require('./routes/box');
const subscriptionRouter = require('./routes/subscription');
const customerRouter = require('./routes/customer');
const orderRouter = require('./routes/order');
const couponRouter = require('./routes/coupons');
const holidayRouter = require('./routes/holiday');
const pincodeRouter = require('./routes/pincode');
const paymentRouter = require('./routes/payment');
const analyticsRouter = require('./routes/analytics');
const webhook = require('./routes/webhook');
const { API_VERSION } = require('./constants')


//Database 
const db = require('./db/sequelize');

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err))

// imports all the models here 
require('./models');
db.sync();


const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(middlewares)

const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('Server is up')
})

// user routes
app.use(`/api/${API_VERSION.V1}/users`, userRouter)
app.use(`/api/${API_VERSION.V1}/cuisines`, cuisineRouter)
app.use(`/api/${API_VERSION.V1}/boxes`, boxRouter)
app.use(`/api/${API_VERSION.V1}/subscriptions`, subscriptionRouter)
app.use(`/api/${API_VERSION.V1}/customers`, customerRouter)
app.use(`/api/${API_VERSION.V1}/orders`, orderRouter)
app.use(`/api/${API_VERSION.V1}/coupons`, couponRouter)
app.use(`/api/${API_VERSION.V1}/holidays`, holidayRouter)
app.use(`/api/${API_VERSION.V1}/pincodes`, pincodeRouter)
app.use(`/api/${API_VERSION.V1}/payments`, paymentRouter)
app.use(`/api/${API_VERSION.V1}/analytics`, analyticsRouter)
app.use(`/webhook`, webhook)


// error handler
app.use((err, req, res, next) => {
  console.log(" error ", err.stack)
  const stack = process.env.NODE_ENV === "development" ? err.stack : undefined
  res.status(500)
    .json({
      success: false,
      message: err.message || "Internal Server Error",
      stack
    })
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})