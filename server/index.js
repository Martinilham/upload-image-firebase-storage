import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from "./routes/user-routes.js";
import uploadImage from "./routes/upload-image.js";
dotenv.config();


const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.json());
app.use(cors())


app.use(uploadImage);
app.use(userRoutes);

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
