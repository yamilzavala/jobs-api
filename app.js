require('dotenv').config();
require('express-async-errors');
const express = require('express');

// Extra security packages
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

const app = express();

// Middleware de seguridad y CORS
app.set('trust proxy', 1);
app.use(cors({
  origin: '*', // Cambia esto a ['http://localhost:3000'] en producción
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000 // Hasta 1,000 solicitudes por IP por hora
}));
app.use(express.json());
app.use(helmet());
app.use(xss());

// Swagger
const swaggerUI = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
});
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Database connection
const connectDB = require('./db/connect');

// Routes
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', require('./middleware/authentication'), jobsRoutes);

// Error handling
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Start server
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
