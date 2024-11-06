const express = require('express');
const path = require('path')
const bodyParser = require('body-parser');
const { auth, requiresAuth } = require('express-openid-connect');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 3000;

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000',
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    clientSecret: process.env.CLIENT_SECRET,
};

app.use(auth(config));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'scripts')));

app.use(express.static(path.join(__dirname, 'scripts')));
app.use('/style', express.static(path.join(__dirname, 'style')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/authorized', requiresAuth(), (req, res) => {
    const isChecked = req.query.authorize === 'true';

    const userRole = req.oidc.user[`https://${process.env.AUTH0_DOMAIN}roles`] || [];
    const isAdmin = userRole.includes('admin');

    if(isChecked && !isAdmin){
        return res.redirect('/access_denied.html');
    }

    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
})

app.get('/admin', requiresAuth(), (req, res) => {
    const userRole = req.oidc.user[`https://${process.env.AUTH0_DOMAIN}roles`] || [];
    const isAdmin = userRole.includes('admin');

    if (!isAdmin) {
        return res.redirect('/access_denied.html');
    }
    res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

// Ako je uključena sanitizacija (checkBox), korisnikov unos će biti sanitiziran tako da se svaki od znakova <, >, " i ' biti zamijenjeni s njihovim HTML entitetima,
// tj. neće biti interpretirani kao dio HTML ili JavaScript naredbe nego kao običan tekst,
// ako je sanitizacija isključena korisnik / napadač nema nikakva ograničenja vezana uz unos te može neovlašteno pristupati informacijama.

// Iako postoji i sanitizacija na frontend dijelu aplikacije, postoje načini da napadač zaobiđe tu zaštitu pa ovaj dio služi kao dodatna prepreka.
app.post('/submit', (req, res) =>{
    let text = req.body.comm;
    const sanitize = req.body.sanitize;

    if(sanitize){
        text = text.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    res.redirect(`/xss.html?text=${encodeURIComponent(text)}`);
})

app.get('/userProfile', (req, res) => {
    if(req.oidc.isAuthenticated()){
        res.json(req.oidc.user);
    }else{
        res.status(401).json({error: 'Unauthorized'});
    }
});

// Na auth0 su napravljene dvije uloge, uloga user i admin, te su iste dodane u app_metadata  korisnika.
// Zatim je dodan na Post Login trigger custom funkcija koja nakon što se korisnik ulogira stvara custom token koji uz ostale podatke o njemu sada sadrži i njegove uloge.
// Nakon što ovih izmjena  je stvar samo očitanja informacija (uloga) iz odgovora i izvršavanje odgovarajućih funkcija.

app.get('/userRole', (req, res) => {
    if(req.oidc.isAuthenticated()){
        const userRole = req.oidc.user[`https://${process.env.AUTH0_DOMAIN}roles`] || [];
        //console.log(req.oidc.user);
        //console.log(userRole);
        res.json({roles: userRole});
    }else{
        res.status(401).json({error: 'Unauthorized'});
    }
})
app.get('/favicon.ico', (req, res) => res.status(204).end());

// app.get('/scripts/home_script.js', (req, res) => {
//     console.log('Request for home_script.js received');
//     res.sendFile(path.join(__dirname, 'scripts', 'home_script.js'));
// });



try {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} catch (error) {
    console.error('Error starting server:', error);
}
