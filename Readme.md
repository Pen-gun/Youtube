## YouTube Clone API

Backend service that mirrors core YouTube features: user auth, video upload/stream metadata, playlists, likes, comments, subscriptions, and short-form tweets. Built with Express, MongoDB, JWT, multer, and Cloudinary.

### Architecture
- Entry and server bootstrap: [src/index.js](src/index.js#L1-L17) loads env vars, connects Mongo, and starts the Express app.
- Express app and middleware: [src/app.js](src/app.js#L1-L40) configures CORS, JSON/form parsing, static assets, cookies, and mounts all routers under `/api/v1`.
- Database connection: [src/db/connectionToDB.helper.js](src/db/connectionToDB.helper.js#L1-L14) connects to `MONGODB_URL` using `DB_NAME` from [src/constants.js](src/constants.js#L1).
- Authentication guard: [src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js#L1-L22) verifies JWT from httpOnly cookies or `Authorization: Bearer` header.
- File handling: [src/middlewares/multer.middleware.js](src/middlewares/multer.middleware.js#L1-L12) writes uploads to `public/temp`; Cloudinary upload and cleanup live in [src/utils/cloudinary.js](src/utils/cloudinary.js#L1-L27).

### Tech Stack
- Node.js (ES modules) with Express 5
- MongoDB + Mongoose (aggregate pagination for videos/comments)
- JWT auth with httpOnly cookies
- Multer for multipart uploads, Cloudinary for media storage
- CORS, cookie-parser, dotenv, nodemon

### Quick Start
1) Install Node.js ≥18 and MongoDB.
2) Install deps: `npm install`.
3) Create `.env` in the repo root (see Environment).
4) Run the dev server: `npm run dev` (nodemon + dotenv). The app listens on `PORT`.

### Environment
Place these in `.env` at the repo root:

| Key | Purpose |
| --- | --- |
| PORT | Port Express listens on |
| MONGODB_URL | Mongo connection string (without DB name) |
| CLIENT_URL | Allowed CORS origin |
| ACCESS_TOKEN_SECRET | JWT secret for access tokens |
| ACCESS_TOKEN_EXPIRY | Access token TTL (e.g., `15m`) |
| REFRESH_TOKEN_SECRET | JWT secret for refresh tokens |
| REFRESH_TOKEN_EXPIRY | Refresh token TTL (e.g., `7d`) |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |

### Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server with nodemon and dotenv |
| `npm test` | Placeholder |

### Project Structure
```
src/
  index.js           # bootstrap, DB connect, server listen
  app.js             # express config + router mounts
  constants.js       # DB_NAME
  db/
    connectionToDB.helper.js
  middlewares/
    auth.middleware.js
    multer.middleware.js
  utils/
    ApiError.js ApiResponse.js asyncHandler.js cloudinary.js
  models/            # User, Video, Comment, Like, Playlist, Subscription, Tweet
  controllers/       # Business logic per resource
  routes/            # REST routes under /api/v1
public/temp/         # multer scratch space for uploads
```

### Authentication
- Access tokens are accepted from the `accessToken` cookie or `Authorization: Bearer <token>` header; refresh tokens live in `refreshToken` cookie.
- Cookies are issued as httpOnly and secure by login/refresh flows.
- Protected routes use the JWT guard; most write operations require ownership checks in controllers.

### File Uploads & Media
- Multer stores incoming files under `public/temp`.
- Media is uploaded to Cloudinary; the local temp file is deleted after upload.
- Video uploads expect both `video` and `thumbnail` parts; image uploads use `avatar` or `coverImage` fields.

### API Overview (Base: `/api/v1`)

#### Users
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | /users/register | none | multipart `avatar` (required) + `coverImage` (optional); body `fullName`, `username`, `email`, `password` |
| POST | /users/login | none | body `email` or `username`, `password`; sets access/refresh cookies |
| POST | /users/logout | access token | Clears refresh token in DB and cookies |
| POST | /users/refresh-token | refresh token | Issues new access/refresh cookies |
| POST | /users/change-password | access token | body `oldPassword`, `newPassword`, `confirmPassword` |
| GET | /users/get-current-user | access token | Returns current user sans password |
| PATCH | /users/update-account | access token | body `fullName`/`username`/`email` |
| PATCH | /users/update-avatar | access token | multipart `avatar` |
| PATCH | /users/update-cover-image | access token | multipart `coverImage` |
| GET | /users/get-user-channel-profile/:username | optional | Aggregated profile + subscriber counts |
| GET | /users/get-watch-history | access token | Populates watched videos and owners |

#### Videos
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | /videos | none | Query: `page`, `limit`, `query` (title/description), `sortBy`, `order`, `userId` |
| POST | /videos | access token | multipart `video` + `thumbnail`; body `title`, `description` |
| GET | /videos/:videoId | none | Fetch single video |
| DELETE | /videos/:videoId | access token | Owner only |
| PATCH | /videos/:videoId | access token | Toggle `isPublished` (owner only) |
| PATCH | /videos/update-video/:videoId | access token | Optional `thumbnail`, `title`, `description` (owner only) |

#### Comments
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | /comment/:videoId | access token | body `comment` |
| GET | /comment/:videoId | none | Lists comments with owner data |
| DELETE | /comment/:commentId | access token | Owner only |
| PATCH | /comment/:commentId | access token | body `content`, owner only |

#### Likes
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | /likes | access token | Toggle like; body `itemId`, `itemType` (`comment`\|`video`\|`tweet`) |
| GET | /likes | none | Query `itemId`, `itemType`; returns likers |

#### Subscriptions
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | /subscriptions/:channelId | access token | Toggle subscribe/unsubscribe |
| GET | /subscriptions/:channelId | none | Returns subscriber count |

#### Playlists (all require access token)
| Method | Path | Notes |
| --- | --- | --- |
| GET | /playlists/:playlistId | Playlist with owner and videos |
| GET | /playlists | First 10 playlists with owner summary |
| GET | /playlists/user/:userId | All playlists for user |
| PUT | /playlists/:videoId | Body `playlistId`; add video (owner only) |
| DELETE | /playlists/:videoId | Body `playlistId`; remove video (owner only) |
| DELETE | /playlists/d/:playlistId | Delete playlist (owner only) |
| POST | /playlists | Body `name`, `description` |

#### Tweets
| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | /tweets | access token | body `content` |
| GET | /tweets/:userId | none | User tweets |
| DELETE | /tweets/:tweetId | access token | Owner only |
| PUT | /tweets/:tweetId | access token | Update `content`, owner only |

### Error & Response Format
- Successful responses use `ApiResponse` `{ statusCode, data, message, success }`.
- Errors throw `ApiError` with `statusCode` and `message`; async handlers centralize propagation.

### Development Notes
- Static assets served from `/public`.
- Default DB name is `youtube_clone` from constants.
- JSON and URL-encoded payloads are limited to 10mb.
