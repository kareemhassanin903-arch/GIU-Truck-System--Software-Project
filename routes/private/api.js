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


  // 1) Create a Menu Item (truckOwner)
  // POST /api/v1/menuItem/new
  app.post('/api/v1/menuItem/new', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      const { name, price, description, category } = req.body || {};

      if (!name || price == null || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck not found for this owner' });
      }

      await db('FoodTruck.MenuItems').insert({
        truckId: user.truckId,
        name,
        price,
        description,
        category
        // status & createdAt use defaults
      });

      return res
        .status(200)
        .json({ message: 'menu item was created successfully' });
    } catch (err) {
      console.error('POST /menuItem/new error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


  // 2) View My Truck’s Menu Items (truckOwner)
  // GET /api/v1/menuItem/view
  app.get('/api/v1/menuItem/view', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck not found for this owner' });
      }

      const items = await db('FoodTruck.MenuItems')
        .where({ truckId: user.truckId, status: 'available' })
        .orderBy('itemId', 'asc');

      return res.status(200).json(items);
    } catch (err) {
      console.error('GET /menuItem/view error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });


  // 3) View a Specific Menu Item (truckOwner)
  // GET /api/v1/menuItem/view/:itemId
  app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      const itemId = parseInt(req.params.itemId, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid itemId' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck not found for this owner' });
      }

      const item = await db('FoodTruck.MenuItems')
        .where({ itemId, truckId: user.truckId })
        .first();

      if (!item) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      return res.status(200).json(item);
    } catch (err) {
      console.error('GET /menuItem/view/:itemId error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 4) Edit a Menu Item (truckOwner)
  // PUT /api/v1/menuItem/edit/:itemId
  app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      const itemId = parseInt(req.params.itemId, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid itemId' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck not found for this owner' });
      }

      const { name, price, category, description } = req.body || {};
      const updateData = {};

      if (name != null) updateData.name = name;
      if (price != null) updateData.price = price;
      if (category != null) updateData.category = category;
      if (description != null) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      const updated = await db('FoodTruck.MenuItems')
        .where({ itemId, truckId: user.truckId })
        .update(updateData);

      if (!updated) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      return res
        .status(200)
        .json({ message: 'menu item updated successfully' });
    } catch (err) {
      console.error('PUT /menuItem/edit/:itemId error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 5) Delete a Menu Item (truckOwner)
  // DELETE /api/v1/menuItem/delete/:itemId
  app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      const itemId = parseInt(req.params.itemId, 10);
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid itemId' });
      }

      if (!user.truckId) {
        return res.status(400).json({ error: 'Truck not found for this owner' });
      }

      const updated = await db('FoodTruck.MenuItems')
        .where({ itemId, truckId: user.truckId })
        .update({ status: 'unavailable' });

      if (!updated) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      return res
        .status(200)
        .json({ message: 'menu item deleted successfully' });
    } catch (err) {
      console.error('DELETE /menuItem/delete/:itemId error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 6) View All Available Trucks (customer)
  // GET /api/v1/trucks/view
  app.get('/api/v1/trucks/view', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'customer')) return;

      const trucks = await db('FoodTruck.Trucks')
        .where({ truckStatus: 'available', orderStatus: 'available' })
        .orderBy('truckId', 'asc');

      return res.status(200).json(trucks);
    } catch (err) {
      console.error('GET /trucks/view error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 7) View My Truck Information (truckOwner)
  // GET /api/v1/trucks/myTruck
  app.get('/api/v1/trucks/myTruck', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      if (!user.truckId) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      const truck = await db('FoodTruck.Trucks')
        .where({ truckId: user.truckId })
        .first();

      if (!truck) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      return res.status(200).json(truck);
    } catch (err) {
      console.error('GET /trucks/myTruck error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 8) Update Truck Order Availability (truckOwner)
  // PUT /api/v1/trucks/updateOrderStatus
  app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'truckOwner')) return;

      if (!user.truckId) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      const { orderStatus } = req.body || {};
      if (!VALID_TRUCK_ORDER_STATUS.includes(orderStatus)) {
        return res.status(400).json({ error: 'Invalid orderStatus' });
      }

      const updated = await db('FoodTruck.Trucks')
        .where({ truckId: user.truckId })
        .update({ orderStatus });

      if (!updated) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      return res
        .status(200)
        .json({ message: 'truck order status updated successfully' });
    } catch (err) {
      console.error('PUT /trucks/updateOrderStatus error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 9) View Menu Items for a Specific Truck (customer)
  // GET /api/v1/menuItem/truck/:truckId
  app.get('/api/v1/menuItem/truck/:truckId', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'customer')) return;

      const truckId = parseInt(req.params.truckId, 10);
      if (isNaN(truckId)) {
        return res.status(400).json({ error: 'Invalid truckId' });
      }

      const items = await db('FoodTruck.MenuItems')
        .where({ truckId, status: 'available' })
        .orderBy('itemId', 'asc');

      return res.status(200).json(items);
    } catch (err) {
      console.error('GET /menuItem/truck/:truckId error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 10) Search Menu Items by Category (customer)
  // GET /api/v1/menuItem/truck/:truckId/category/:category
  app.get(
    '/api/v1/menuItem/truck/:truckId/category/:category',
    async (req, res) => {
      try {
        const user = await requireUser(req, res);
        if (!user) return;
        if (!requireRole(user, res, 'customer')) return;

        const truckId = parseInt(req.params.truckId, 10);
        const category = req.params.category;
        if (isNaN(truckId) || !category) {
          return res.status(400).json({ error: 'Invalid parameters' });
        }

        const items = await db('FoodTruck.MenuItems')
          .where({
            truckId,
            status: 'available',
            category
          })
          .orderBy('itemId', 'asc');

        return res.status(200).json(items);
      } catch (err) {
        console.error(
          'GET /menuItem/truck/:truckId/category/:category error',
          err
        );
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  // 11) Add Menu Item to Cart
  // POST /api/v1/cart/new
  app.post('/api/v1/cart/new', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'customer')) return;

      const { itemId, quantity, price } = req.body || {};
      const parsedItemId = parseInt(itemId, 10);
      const parsedQty = parseInt(quantity, 10);

      if (
        isNaN(parsedItemId) ||
        isNaN(parsedQty) ||
        parsedQty <= 0 ||
        price == null
      ) {
        return res.status(400).json({ error: 'Invalid cart data' });
      }

      // Get menu item & its truck
      const menuItem = await db('FoodTruck.MenuItems')
        .where({ itemId: parsedItemId, status: 'available' })
        .first();

      if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      const itemTruckId = menuItem.truckId;

      // Check existing cart items' trucks
      const existingCartItems = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .where('c.userId', user.userId)
        .select('m.truckId');

      const hasDifferentTruck = existingCartItems.some(
        (ci) => ci.truckId !== itemTruckId
      );

      if (hasDifferentTruck) {
        // As per user story example they used "message" key here
        return res
          .status(400)
          .json({ message: 'Cannot order from multiple trucks' });
      }

      await db('FoodTruck.Carts').insert({
        userId: user.userId,
        itemId: parsedItemId,
        quantity: parsedQty,
        price
      });

      return res
        .status(200)
        .json({ message: 'item added to cart successfully' });
    } catch (err) {
      console.error('POST /cart/new error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 12) View Cart
  // GET /api/v1/cart/view
  app.get('/api/v1/cart/view', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'customer')) return;

      const cartItems = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .where('c.userId', user.userId)
        .select(
          'c.cartId',
          'c.userId',
          'c.itemId',
          'm.name as itemName',
          'c.price',
          'c.quantity'
        )
        .orderBy('c.cartId', 'asc');

      return res.status(200).json(cartItems);
    } catch (err) {
      console.error('GET /cart/view error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 13) Delete Item from Cart
  // DELETE /api/v1/cart/delete/:cartId
  app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'customer')) return;

      const cartId = parseInt(req.params.cartId, 10);
      if (isNaN(cartId)) {
        return res.status(400).json({ error: 'Invalid cartId' });
      }

      const deleted = await db('FoodTruck.Carts')
        .where({ cartId, userId: user.userId })
        .del();

      if (!deleted) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      return res
        .status(200)
        .json({ message: 'item removed from cart successfully' });
    } catch (err) {
      console.error('DELETE /cart/delete/:cartId error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 14) Edit Cart Item Quantity
  // PUT /api/v1/cart/edit/:cartId
  app.put('/api/v1/cart/edit/:cartId', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireRole(user, res, 'customer')) return;

      const cartId = parseInt(req.params.cartId, 10);
      const { quantity } = req.body || {};
      const parsedQty = parseInt(quantity, 10);

      if (isNaN(cartId) || isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json({ error: 'Invalid input' });
      }

      const updated = await db('FoodTruck.Carts')
        .where({ cartId, userId: user.userId })
        .update({ quantity: parsedQty });

      if (!updated) {
        return res.status(404).json({ error: 'Cart item not found' });
      }

      return res
        .status(200)
        .json({ message: 'cart updated successfully' });
    } catch (err) {
      console.error('PUT /cart/edit/:cartId error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

















};



module.exports = { handlePrivateBackendApi };
