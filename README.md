# Pixagram - Full Stack Instagram Clone

A fully dynamic, real-time Instagram-like application with MongoDB persistence.

## Features ✨

- **Authentication**: JWT-based secure login/register
- **Posts**: Upload images/videos with captions, like, comment
- **Stories**: 24-hour auto-expiring stories
- **Reels**: Vertical video feed with likes and comments
- **Messages**: Real-time chat with typing indicators
- **Notifications**: Live notifications for likes, comments, follows
- **Profile**: Edit profile, follow/unfollow users
- **Explore**: Discover new posts and users
- **Search**: Real-time user search

## Tech Stack 🛠️

### Frontend
- React.js (Vite)
- Tailwind CSS
- Socket.io Client
- Axios
- React Router
- Context API

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT Authentication
- Multer (file upload)
- Cloudinary (media storage)
- bcryptjs (password hashing)

## Installation 📦

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or MongoDB Atlas)
- Cloudinary account (free tier works)

### 1. Clone & Install Dependencies

```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Edit `Backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pixagram
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:5173

# Get these from cloudinary.com (free account)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start MongoDB

Make sure MongoDB is running:
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas connection string in MONGO_URI
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
App runs on http://localhost:5173

## How It Works 🔄

### Data Persistence
- **All uploads are saved to MongoDB** via Cloudinary
- Posts, Stories, Reels → Uploaded to Cloudinary → URL saved in MongoDB
- User data, comments, likes, messages → Directly in MongoDB
- **Refresh-safe**: Everything persists in database

### Real-time Features
- Socket.io connection on user login
- Live notifications when someone likes/comments
- Real-time chat with typing indicators
- New posts appear instantly in followers' feeds
- Online/offline status indicators

## API Endpoints 🌐

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:id` - Get user profile
- `GET /api/users/username/:username` - Get profile by username
- `PUT /api/users/profile` - Update profile (with avatar upload)
- `POST /api/users/follow/:id` - Follow/unfollow user
- `GET /api/users/search?q=query` - Search users
- `GET /api/users/suggested` - Get suggested users

### Posts
- `POST /api/posts` - Create post (with media upload)
- `GET /api/posts/feed` - Get feed posts
- `GET /api/posts/explore` - Get explore posts
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Comment on post
- `DELETE /api/posts/:id` - Delete post

### Stories
- `POST /api/stories` - Create story (with media upload)
- `GET /api/stories` - Get stories from followed users
- `POST /api/stories/:id/view` - Mark story as viewed

### Reels
- `POST /api/reels` - Create reel (with video upload)
- `GET /api/reels` - Get all reels
- `POST /api/reels/:id/like` - Like/unlike reel
- `POST /api/reels/:id/comment` - Comment on reel

### Messages
- `POST /api/messages` - Send message (with optional image)
- `GET /api/messages` - Get conversation list
- `GET /api/messages/:userId` - Get conversation with user

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/read-all` - Mark all as read

## Database Schema 📊

### Collections
- `users` - User accounts and profiles
- `posts` - Image/video posts with likes and comments
- `comments` - Comments on posts/reels
- `stories` - 24-hour stories (auto-expire)
- `reels` - Video reels
- `messages` - Private messages
- `notifications` - User notifications

## Project Structure 📁

```
pixagram/
├── Backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/           # Business logic
│   ├── middleware/            # Auth & upload middleware
│   ├── models/                # Mongoose schemas
│   ├── routes/                # API routes
│   ├── utils/                 # Helper functions
│   ├── server.js              # Express + Socket.io server
│   └── .env                   # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/        # React components
    │   ├── pages/             # Page components
    │   ├── Context/           # Context providers
    │   ├── services/          # API service layer
    │   ├── utils/             # Helper functions
    │   └── App.jsx            # Main app component
    └── package.json

```

## Usage Tips 💡

1. **First Time Setup**: Register a new account
2. **Upload Content**: Use the Create button to upload posts/stories/reels
3. **Follow Users**: Search and follow other users to see their content
4. **Real-time Chat**: Click Messages to start chatting
5. **Notifications**: Bell icon shows live notifications

## Troubleshooting 🔧

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check MONGO_URI in .env

**Cloudinary Upload Error:**
- Verify Cloudinary credentials in .env
- Check file size (max 50MB)

**Socket.io Not Working:**
- Check CLIENT_URL in backend .env matches frontend URL
- Ensure both servers are running

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing 🤝

Feel free to submit issues and enhancement requests!

## License 📄

MIT License - feel free to use this project for learning and development.

---

**Built with ❤️ using MERN Stack + Socket.io + Cloudinary**
