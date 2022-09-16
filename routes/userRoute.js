const express = require('express');
const userController = require('../controllers/userController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.get('/me' , userController.getMe);
router.patch(
    '/' , 
    upload.fields([
    {name: 'profilePic', maxcount:1}, 
    {name: 'coverPhoto', maxcount: 1}
    ]), 
    userController.updateProfile
    );


module.exports = router;