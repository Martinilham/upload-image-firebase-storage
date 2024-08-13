import express from "express";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { getDatabase, ref as dbRef, push, set } from "firebase/database";
import multer from "multer";
import config from "../config.js";
import Image from "../models/upload-image.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();


const firebaseApp = initializeApp(config);
const storage = getStorage(firebaseApp);
const database = getDatabase(firebaseApp);
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("filename"), async (req, res) => {
  try {
    const { id, firstName } = req.body;
    if (!id || !firstName || !req.file) {
      return res.status(400).send("Missing required fields");
    }
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `images/${req.file.originalname + "_" + dateTime}`
    );
    const metadata = {
      contentType: req.file.mimetype,
    };
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );


    const downloadURL = await getDownloadURL(snapshot.ref);
    const image = new Image(id, firstName, downloadURL);
    const imagesRef = dbRef(database, "images");
    const newImageRef = push(imagesRef);
    await set(newImageRef, {
      id: image.id,
      firstName: image.firstName,
      gambar: image.gambar,
    });

    console.log("File successfully uploaded.");
    res.send({
      message:
        "File uploaded to Firebase Storage and data saved to Firebase Database",
      image: image,
    });
  } catch (error) {
    console.error("Error uploading file: ", error);
    res.status(500).send("Error uploading file");
  }
});

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + "_" + time;
  return dateTime;
};

export default router;
