require('dotenv').config();
require('express-async-errors');
const express = require('express');

//extra security packages
const cors = require('cors');
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

const app = express();

//connect db
const connectDB = require('./db/connect');

// routers
const authRoutes = require('./routes/auth')
const jobsRoutes = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authenticateUser = require('./middleware/authentication')

//extra 
app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100 //Limit each IP to 100 requests per `window`
}))
app.use(express.json());
app.use(helmet())
app.use(cors())
app.use(xss())

app.get('/', (req, res) => {
  res.send('jobs api')
})
// routes
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/jobs', authenticateUser, jobsRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    //db connect
    await connectDB(process.env.MONGO_URI)
    app.listen(port, console.log(`Listening in port ${port}`))
  } catch (error) {
    console.log(error)
  }
}

start()




