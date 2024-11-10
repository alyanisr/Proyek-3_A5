import express from "express";
const routerAccount = express.Router();
import accountController from '../controllers/accountController.js';
import shortlinkController from "../controllers/shortlinkController.js";
import { requireAuthotp } from "../middleware/authMiddleware.js";
import path from 'path';
import { __dirname } from '../../path.js';


routerAccount.route('/send')
    .post(accountController.kirim_otp)

routerAccount.route('/verify',)
    .post(accountController.verifikasi)

routerAccount.route('/vmail')
    .get(accountController.verif_viamail)

routerAccount.route('/linlogic')
    .post(accountController.login)

routerAccount.route('/aktivasi')
    .get(accountController.loginfe)

routerAccount.route('/verifikasi')
    .get(requireAuthotp,accountController.veriffe)

routerAccount.route('/get-email')
    .get(accountController.getEmailFromSession);

routerAccount.route('/login')
    .get(accountController.logon)

routerAccount.route('/forgot-password')
    .get(accountController.forgpass)
    .post(accountController.lgcforgpass)

routerAccount.route('/logout')
    .get(accountController.logout)
export default routerAccount;