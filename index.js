const express = require('express')
const middlewares = require('./middlewares/global')
// const { errorHandler } = require('./middlewares/errorHandler');
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

const port = 5000

app.get('/', (req, res) => {
  res.send('Server is up')
})

app.use(`/api/${API_VERSION.V1}/users`, userRouter)

// app.use(errorHandler)
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