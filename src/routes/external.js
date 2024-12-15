import express from "express";
import QrController from "../controllers/QrController.js";

const routerext = express.Router()

routerext.route('/send')
    .post(QrController.generateQRext)

routerext.route('/:filename')
    .get(QrController.getqrext);

export default routerext;