import express from "express";
import session from "express-session";
import shortlinkController from "./src/controllers/shortlinkController.js";
import routerShortlink from './src/routes/shortlink.js';
import routerAccount from "./src/routes/account.js";
import routerQr from "./src/routes/qrRoutes.js";
import path from 'path';
import { __dirname } from "./path.js";
import { checkAuth } from "./src/middleware/checkAuth.js";
import routerLinktree from "./src/routes/linktree.js";
import { loginSession } from "./src/middleware/loginSessionMid.js";
import { log } from "console";

const PORT = 8000;
const app = express();

app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));



app.use(express.json());

app.use('/shortlink', routerShortlink);

app.use('/assets', express.static(path.join(__dirname, 'src', 'views', 'assets')));

app.use('/account', routerAccount);

app.use('/qr',loginSession, routerQr);

app.use('/linktree',  routerLinktree);


app.listen(PORT, () => {
    console.log(`Server utama running at port ${PORT}`);
});

app.get('/',checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'views', 'index.html'));
})

app.get('/:id', shortlinkController.firstRedirect);



