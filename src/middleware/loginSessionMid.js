export const loginSession = (req, res, next) => {
    if (req.session.email) {
        return next();
    } else {
        return res.redirect('/account/login');
    }
};