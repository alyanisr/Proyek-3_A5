import express from "express";
import QrController from "../controllers/QrController.js";

const routerext = express.Router()

routerext.route('/send')
    .get(QrController.generateQRext)

routerext.route('/tes/:filename')
    .get(QrController.tes);

export default routerext;