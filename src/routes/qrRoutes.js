import express from "express";
const routerQr = express.Router();
import multer from "multer";
import QrController from "../controllers/QrController.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

routerQr.route("/generateQR")
    .post(upload.single("logo"), QrController.generateQRCode);

routerQr.route("/")
    .get(QrController.qrmain);

routerQr.route("/saveqr")
    .post(QrController.saveQR);

routerQr.route("/show")
    .get(QrController.pickQR);

routerQr.route("/delete/:id")
    .delete(QrController.deleteQR)

routerQr.route("/update")
    .patch(QrController.updateqr)


export default routerQr;
