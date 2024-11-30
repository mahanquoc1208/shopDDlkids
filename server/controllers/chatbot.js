const express = require('express')
const { models } = require('../models')
const {
  SALT_KEY
} = require('../utils');
const Chatbox = require('../models/chatbox');
const Customer = require('../models/customer');

const router = express.Router()

// Hiển tin nhắn  
// Hiển thị tin nhắn  
router.get('/', async (req, res) => {
  try {
      // Fetch all records from the Chatbox table, ordered by createdAt in descending order,
      // and include related customer data only
      const chatboxes = await Chatbox.findAll({
          order: [['createdAt', 'DESC']],
          include: [{
              model: models.Customer,  // Chỉ lấy dữ liệu từ bảng Customer
              attributes: ['email', 'fullName'],  // Chỉ lấy các thuộc tính email và fullName từ bảng Customer
          }],
      });

      // Restructure the data to include Customer attributes at the same level
      const formattedChatboxes = chatboxes.map(chatbox => {
          return {
              id: chatbox.id,
              name: chatbox.name,
              custumerID: chatbox.custumerID,
              userID: chatbox.userID,
              content: chatbox.content,
              status: chatbox.status,
              createdAt: chatbox.createdAt,
              updatedAt: chatbox.updatedAt,
              email: chatbox.Customer?.email || null,  // Chỉ lấy email từ Customer
              fullName: chatbox.Customer?.fullName || null,  // Chỉ lấy fullName từ Customer
          };
      });

      // Send the results as a response
      res.status(200).json(formattedChatboxes);
  } catch (error) {
      console.error('Error fetching chatbox data:', error);
      res.status(500).json({ error: 'An error occurred while retrieving chatbox data.' });
  }
});

  // thêm tin nhắn cho khách hàng
  router.post('/', async (req, res) => {
    try {
      const { custumerID, userID, content, status = 1 } = req.body; // Set default status to 1
  
      // Check if an entry with the same custumerID exists
      const existingEntry = await Chatbox.findOne({ where: { custumerID } });
  
      let name;
  
      if (existingEntry) {
        // Use the same name if custumerID already exists
        name = existingEntry.name;
      } else {
        // Find the highest current "CTXX" name and increment
        const lastEntry = await Chatbox.findOne({
          order: [['createdAt', 'DESC']],
        });
  
        if (lastEntry && lastEntry.name.startsWith('CT')) {
          // Extract the number part and increment it
          const lastNumber = parseInt(lastEntry.name.slice(2), 10);
          name = `CT${String(lastNumber + 1).padStart(2, '0')}`;
        } else {
          // Start from "CT01" if no prior entries or pattern not followed
          name = 'CT01';
        }
      }
  
      // Create the new chatbox entry
      const newChatbox = await Chatbox.create({
        name,
        custumerID,
        userID: userID || null, // Allow userID to be null
        content,
        status,
      });
  
      // Send the newly created entry as a response
      res.status(201).json(newChatbox);
    } catch (error) {
      console.error('Error creating chatbox entry:', error);
      res.status(500).json({ error: 'An error occurred while creating chatbox entry.' });
    }
  });
  

  // hiển thị tin nhắn theo khách hàng
  router.get('/client/:id', async (req, res) => {
    try {
      // Retrieve id from the URL parameters
      const { id } = req.params;
  
      // Check if id is provided
      if (!id) {
        return res.status(400).json({ error: 'id is required.' });
      }
  
      // Fetch records that match the id, ordered by createdAt in descending order
      const chatboxes = await Chatbox.findAll({
        where: { custumerID: id }, // Assuming custumerID is still the column name in your database
        order: [['createdAt', 'ASC']],
      });
  
      // Send the results as a response
      res.status(200).json(chatboxes);
    } catch (error) {
      console.error('Error fetching chatbox data by id:', error);
      res.status(500).json({ error: 'An error occurred while retrieving chatbox data.' });
    }
  });
  
  // hiển thị tin nhắn cho quản lý xem 
    // hiển thị tin nhắn theo mỗi khách hàng
    router.get('/:name', async (req, res) => {
      try {
        // Retrieve name from the URL parameters
        const { name } = req.params;
    
        // Check if name is provided
        if (!name) {
          return res.status(400).json({ error: 'name is required.' });
        }
    
        // Fetch records that match the name, ordered by createdAt in descending order
        const chatboxes = await Chatbox.findAll({
          where: { name: name }, // Assuming name is the column name in your database
          order: [['createdAt', 'ASC']],
        });
    
        // Send the results as a response
        res.status(200).json(chatboxes);
      } catch (error) {
        console.error('Error fetching chatbox data by name:', error);
        res.status(500).json({ error: 'An error occurred while retrieving chatbox data.' });
      }
    });
// thêm Tin nhắn cho quản lý hay ai đó là người nhắn trường hợp rep tin nhắn
router.post('/all/', async (req, res) => {
  try {
    const { userID, content, name } = req.body; // Extract relevant fields from request body

    // Set custumerID to null and status to 1
    const custumerID = null; // Make custumerID null
    const status = 1; // Set default status to 1

    // Prepare the new chatbox entry data
    const newChatboxData = {
      name, // Set name to null as it is not required
      custumerID, // custumerID is null
      userID: userID || null, // Allow userID to be null
      content,
      status, // Status is set to 1
    };

    // Log the values being added
    console.log('Creating new chatbox entry:', newChatboxData);

    // Create the new chatbox entry
    const newChatbox = await Chatbox.create(newChatboxData);

    // Send the newly created entry as a response
    res.status(201).json(newChatbox);
  } catch (error) {
    console.error('Error creating chatbox entry:', error);
    res.status(500).json({ error: 'An error occurred while creating chatbox entry.' });
  }
});


module.exports = router
