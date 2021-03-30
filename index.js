const express = require('express')
const middlewares = require('./middlewares/global')
const userRouter = require('./routes/user');
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