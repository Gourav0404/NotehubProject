import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

import { router } from "./src/routes/user.route.js";

app.use("/api/v1/user", router)

app.get('/', (req, res) => {
  res.send('this is our backend home page !!');
})


app.use((err, req, res, next) => {
  console.error("Error middleware caught:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

export { app };