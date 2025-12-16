const db = require('../../connectors/db');
const { getSessionToken, getUser } = require('../../utils/session');
const axios = require('axios');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

function handlePrivateFrontEndView(app) {

    app.get('/dashboard', async (req, res) => {
        const user = await getUser(req);
        if (user.role === 'truckOwner') {
            return res.redirect('/ownerDashboard');
        }
        // role of customer
        return res.render('customerHomepage', {
            name: user.name,
            user: user,
            isCustomer: user.role === 'customer'
        });
    });

    // Customer routes
    app.get('/trucks', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'customer') {
            return res.redirect('/dashboard');
        }
        return res.render('trucks', {
            user: user,
            isCustomer: true
        });
    });

    app.get('/truckMenu/:truckId', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'customer') {
            return res.redirect('/dashboard');
        }
        const truckId = parseInt(req.params.truckId, 10);
        if (isNaN(truckId)) {
            return res.status(400).send('Invalid truck ID');
        }
        return res.render('truckMenu', {
            truckId: truckId,
            user: user,
            isCustomer: true
        });
    });

    app.get('/cart', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'customer') {
            return res.redirect('/dashboard');
        }
        return res.render('cart', {
            user: user,
            isCustomer: true
        });
    });

    app.get('/myOrders', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'customer') {
            return res.redirect('/dashboard');
        }
        return res.render('myOrders', {
            user: user,
            isCustomer: true
        });
    });

    // Owner routes
    app.get('/ownerDashboard', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('ownerDashboard', { name: user.name });
    });

    app.get('/menuItems', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('menuItems');
    });

    app.get('/addMenuItem', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('addMenuItem');
    });

    app.get('/truckOrders', async (req, res) => {
        const user = await getUser(req);
        if (user.role !== 'truckOwner') {
            return res.redirect('/dashboard');
        }
        return res.render('truckOrders');
    });

    app.get('/testingAxios', async (req, res) => {
        try {
            const result = await axios.get(`http://localhost:${PORT}/test`);
            return res.status(200).send(result.data);
        } catch (error) {
            console.log("error message", error.message);
            return res.status(400).send(error.message);
        }
    });
}

module.exports = { handlePrivateFrontEndView };
