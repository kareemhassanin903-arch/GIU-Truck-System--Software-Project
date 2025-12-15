const db = require('../../connectors/db');
const { getSessionToken } = require('../../utils/session');

function handlePublicFrontEndView(app) {
  
    app.get('/', function(req, res) {
        return res.render('login');
      });
    
      app.get('/register', async function(req, res) {
        return res.render('register');
      });

      // Logout route - clears session and redirects to login
      app.get('/logout', async function(req, res) {
        const sessionToken = getSessionToken(req);
        
        if (sessionToken) {
          try {
            // Delete the session from the database
            await db('FoodTruck.Sessions').where('token', sessionToken).del();
          } catch (e) {
            console.log('Error deleting session:', e.message);
          }
        }
        
        // Clear the cookie and redirect to login
        return res.clearCookie('session_token').redirect('/');
      });
}  
  
module.exports = {handlePublicFrontEndView};
  