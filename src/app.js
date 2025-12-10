import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json(
    {
        limit: '10mb',
    }
))
app.use(express.urlencoded({
    extended: true,
    limit: '10mb',
}))
app.use(express.static('public'))
app.use(cookieParser())

//route import
import userRouter from './routes/user.routes.js';
import videoRouter from './routes/video.route.js';
import commentRouter from './routes/comment.route.js';
import tweetRouter from './routes/tweet.route.js';
import likeRouter from './routes/like.route.js';
import subscriptionRouter from './routes/subscription.route.js';
import playlistRouter from './routes/playlist.route.js';

//route declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/videos', videoRouter);
app.use('/api/v1/comment', commentRouter);
app.use('/api/v1/tweets', tweetRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/playlists', playlistRouter);
export default app;