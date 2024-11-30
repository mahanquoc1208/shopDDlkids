const express = require('express')
const { models } = require('../models')
const bcrypt = require('bcrypt')
const {
  SALT_KEY
} = require('../utils')

const router = express.Router()

// Hiển tổng sản phẩm  
router.get('/all/:custumerId', async (req, res) => {
  const { custumerId } = req.params;

  try {
    const customerCart = await models.Cart.findAll({
      where: { custumerId },
      include: [
        {
          model: models.Product,
          as: 'Product',
          attributes: ['name', 'Discount', 'locationPath', 'price', 'Inventory_quantity']
        }
      ]
    });

    // if (!customerCart || customerCart.length === 0) {
    //   return res.status(404).json({ message: 'Customer not found or no items in cart' });
    // }

    // Count the number of unique cart items (based on the number of cart 'id')
    const totalItems = customerCart.length;

    res.json({
      totalItems, // This is the number of unique cart items
      items: customerCart // The full cart data
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
// hiển thị sản phẩm theo user
router.get('/:custumerId', async (req, res) => {
  const { custumerId } = req.params;

  try {
    const customerCart = await models.Cart.findAll({
      where: { custumerId },
      include: [
        {
          model: models.Product, // Join with the Product table
          as: 'Product', // Use the alias defined in associations
          attributes: ['name', 'Discount', 'locationPath', 'price', 'Inventory_quantity'], // Select specific fields
        },
      ],
    });

    // Filter out products with Inventory_quantity = 0
    const filteredCart = customerCart.filter(item => item.Product?.Inventory_quantity > 0);

    res.json(filteredCart);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// xóa sản phẩm trong giỏ hàng
router.delete('/:custumerId/product/:cartId', async (req, res) => {
  const { custumerId, cartId } = req.params;

  try {
    // Find the cart item based on cartId and custumerId
    const cartItem = await models.Cart.findOne({
      where: { id: cartId, custumerId } // Using the cartId to find the specific item
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found for this customer' });
    }

    // Delete the cart item
    await cartItem.destroy();

    res.json({ message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

// thêm sản phẩm giỏ hàng bằng icon
router.post('/add', async (req, res) => {
  const { productId, custumerId, quantity } = req.body;

  try {
    // Kiểm tra nếu các trường bắt buộc bị thiếu
    if (!productId || !custumerId || quantity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Tìm sản phẩm trong giỏ hàng theo productId và custumerId
    const existingCartItem = await models.Cart.findOne({
      where: {
        productId,
        custumerId,
      },
    });

    if (existingCartItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, cập nhật quantity
      existingCartItem.quantity += quantity; // Increase quantity
      existingCartItem.updatedAt = new Date(); // Update the updatedAt timestamp
      await existingCartItem.save(); // Save the changes
      return res.status(200).json(existingCartItem); // Return updated item
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
      const newCartItem = await models.Cart.create({
        productId,
        custumerId,
        quantity,
        status: 0, // Set default status to 1
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json(newCartItem); // Return newly created item
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
// thêm sp vào giỏ hàng "Mua ngay"
router.post('/adds', async (req, res) => {
  const { productId, custumerId, quantity } = req.body;

  try {
    // Kiểm tra nếu các trường bắt buộc bị thiếu
    if (!productId || !custumerId || quantity === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Tìm sản phẩm trong giỏ hàng theo productId và custumerId
    const existingCartItem = await models.Cart.findOne({
      where: {
        productId,
        custumerId,
      },
    });

    if (existingCartItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, cập nhật quantity
      existingCartItem.quantity += quantity; // Increase quantity
      existingCartItem.updatedAt = new Date(); // Update the updatedAt timestamp
      await existingCartItem.save(); // Save the changes
      return res.status(200).json(existingCartItem); // Return updated item
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
      const newCartItem = await models.Cart.create({
        productId,
        custumerId,
        quantity,
        status: 1, // Set default status to 1
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json(newCartItem); // Return newly created item
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
// thêm chi tiết giỏ hàng sp chữ "Mua ngay"
router.post('/addproducts', async (req, res) => {
  const { productId, custumerId, quantity } = req.body;

  try {
    // Kiểm tra nếu các trường bắt buộc bị thiếu
    if (!productId || !custumerId || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ message: 'Missing required fields or invalid quantity' });
    }

    // Tìm sản phẩm trong giỏ hàng theo productId và custumerId
    const existingCartItem = await models.Cart.findOne({
      where: {
        productId,
        custumerId,
      },
    });

    if (existingCartItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, cập nhật quantity
      existingCartItem.quantity += quantity; // Increase quantity
      existingCartItem.updatedAt = new Date(); // Update the updatedAt timestamp
      await existingCartItem.save(); // Save the changes
      return res.status(200).json(existingCartItem); // Return updated item
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
      const newCartItem = await models.Cart.create({
        productId,
        custumerId,
        quantity,
        status: 1, // Set default status to 1
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json(newCartItem); // Return newly created item
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
// thêm sản phẩm giỏ hàng bằng icon chi tiết
router.post('/addproduct', async (req, res) => {
  const { productId, custumerId, quantity } = req.body;

  try {
    // Kiểm tra nếu các trường bắt buộc bị thiếu
    if (!productId || !custumerId || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ message: 'Missing required fields or invalid quantity' });
    }

    // Tìm sản phẩm trong giỏ hàng theo productId và custumerId
    const existingCartItem = await models.Cart.findOne({
      where: {
        productId,
        custumerId,
      },
    });

    if (existingCartItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, cập nhật quantity
      existingCartItem.quantity += quantity; // Increase quantity
      existingCartItem.updatedAt = new Date(); // Update the updatedAt timestamp
      await existingCartItem.save(); // Save the changes
      return res.status(200).json(existingCartItem); // Return updated item
    } else {
      // Nếu sản phẩm chưa có trong giỏ hàng, tạo mới
      const newCartItem = await models.Cart.create({
        productId,
        custumerId,
        quantity,
        status: 0, // Set default status to 0
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json(newCartItem); // Return newly created item
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});
// cập nhật số lượng sản phẩm sau khi thay đổi
router.put('/update-quantity/:cartId', async (req, res) => {
  const { cartId } = req.params;
  const { quantity } = req.body; // New quantity from the request body

  // Check if the quantity is valid
  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ message: 'Invalid quantity value' });
  }

  try {
    // Find the cart item by ID
    const cartItem = await models.Cart.findByPk(cartId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update the quantity
    cartItem.quantity = quantity; // Assuming there is a 'quantity' field
    await cartItem.save();

    res.json({ message: 'Quantity updated successfully', cartItem });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});


module.exports = router
