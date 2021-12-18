const express = require('express');
const router = express.Router();


const authorController = require('../controllers/authorController');
const blogController = require('../controllers/blogController')
const authorAuth = require('../middlewares/authorAuth')


// CREATE AUTHOR API-------------1
router.post('/authors', authorController.registerAuthor);

// GENERATE TOKEN AUTHOR API ----2
router.post('/login', authorController.loginAuthor);

// CREATE BLOG API---------------3
router.post('/blogs', authorAuth, blogController.createBlog);

// GET LIST OF BLOGS-------------4
router.get('/blogs', authorAuth, blogController.listBlog);

// FIND BLOG DATA AND UPDATE ----5
router.put('/blogs/:blogId', authorAuth, blogController.updateBlog);

// DELETE BLOG DATA BY ID-------6
router.delete('/blogs/:blogId', authorAuth, blogController.deleteBlogByID);

// DELETE BLOG DATA BY PARAMS----7
router.delete('/blogs', authorAuth, blogController.deleteBlogByParams);



module.exports = router;