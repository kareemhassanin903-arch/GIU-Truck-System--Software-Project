const db = require('../../connectors/db');
// check function getUser in milestone 3 description and session.js
const { getUser } = require('../../utils/session');
// getUser takes only one input of req 
// await getUser(req);

// Valid status sets
const VALID_ORDER_STATUS = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
const VALID_TRUCK_ORDER_STATUS = ['available', 'unavailable'];

// --------- helpers ----------

async function requireUser(req, res) {
  try {
    const user = await getUser(req);
    if (!user || !user.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return user;
  } catch (err) {
    console.error('getUser error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function requireRole(user, res, role) {
  if (user.role !== role) {
    res.status(403).json({ error: 'Forbidden' });
    return false;
  }
  return true;
}

function handlePrivateBackendApi(app) {

  // insert all your private server side end points here
  app.get('/test', async (req, res) => {
    try {
      return res.status(200).send("succesful connection");
    } catch (err) {
      console.log("error message", err.message);
      return res.status(400).send(err.message)
    }
  });































};



module.exports = { handlePrivateBackendApi };
