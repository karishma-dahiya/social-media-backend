const express = require('express');
const { User, Post, Comment, FriendRequest } = require('../models/schema');
const router = express.Router();


//List of all the users

router.get('/users', async (req, res) => {
    try {
        
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json(err);
    }
});


// User registration

router.post('/users', async (req, res) => {
    try {
        //check for existing email
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }
        //create new user
        const newUser = await User.create(req.body);
        res.json(newUser);

    } catch (err) {
        res.status(500).json({ err: 'failed to register' });
    }
});


//Send friend requests

router.post('/users/requests', async (req, res) => {
    try { 
        const { sender, receiver } = req.body;

        const senderId = await User.findById(sender);
        const receiverId = await User.findById(receiver);

        if (!senderId || !receiverId) {
            return res.status(400).json({ error: 'Invalid sender or receiver ID' });
        }

        const request = await FriendRequest.create({ sender, receiver });
        res.json(request);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send friend request' });
    } 
});

// Receive friend requests

router.get('/users/:id/requests', async (req, res) => {
    try {
        const id = req.params.id;
        const requests = await FriendRequest.find({ receiver: id, status: 'pending' }).populate('sender', 'username', 'email');
        res.json(requests);
    } catch (err) {
        res.status(500).json("Error receiving requests");
   }
});

//Accept requests

router.put('/requests/:id/accept', async (req, res) => {
    try {
        const id = req.parms.id;
        const request = await FriendRequest.findByIdAndUpdate(id, { status: 'accepted' });
        res.json(request);
    } catch (err) {
        res.status(500).json('Failed to accept request');
   }
});

//Reject Requests

router.put('/requests/:id/accept', async (req, res) => {
    try {
        const id = req.parms.id;
        const request = await FriendRequest.findByIdAndUpdate(id, { status: 'rejected' });
        res.json(request);
    } catch (err) {
        res.status(500).json('Failed to reject request');
   }
});

//Create a post

router.post('/posts', async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});


//posts by friends

router.get(':id/posts/friends', async (req, res) => {
    try {
        const userid = req.params.id;
        const user = await User.findById(userid).populate('friends');
        const friendId = user.friends.map(friend => friend._id);

        const posts = await Post.find({ user: { $in: friendId } });
        res.json(posts);
    } catch (err) {
        res.status(500).json('Error fetching posts');
    }
});

//posts by friends' comments

router.get(':id/posts/comments', async (req, res) => {
    try {
        const userid = req.params.id;
        const user = await User.findById(userid).populate('friends');
        const friendId = user.friends.map(friend => friend._id);

        const posts = await Post.find({ 'comments.user': { $in: friendId } });
        res.json(posts);
    } catch (err) {
        res.status(500).json('Error fetching posts');
    }
});

//make a comment

router.post('/posts/:id/comments', async (req, res) => {
    try {
        const postId = req.params.id;
        const newComment = await Comment.create({ post: postId, ...req.body });
        res.json(newComment);
    } catch (err) {
        res.status(500).json('Error creating comment');
    }
});

//fetch all comments on a post

router.get('/posts/:id/comments', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId).populate('comments');
        if (!post) {
            return res.json('Post not found')
        }
        const comments = post.comments;
        res.json(comments);
    } catch (err) {
        res.status(500).json('Error fetching comments');
    }
});

module.exports = router;