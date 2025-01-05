# ChitChat

A realtime chat application with 3 distinct sections (public, private and group).

## Features

- Public chat/Private Chat/Group Chat/Mail support
- Realtime mail support for invitation/requesting
- Real time messaging
- Online/Offline tracking
- User authentication powered by NextAuth
- Emoji support
- Can react to a message (only in Public and Private)
- Infinite Scrolling for chat history
- Realtime Private Message and Mail notification
- Random Chatboard wallpaper background for private and group chat upon creation
- Profile Card for User and Group Details

## Tech Stack

**Client:** NextTs, Socket.io-client, Zustand, React Query, Tailwind, NextAuth, Uploadthing

**Server:** Socket.io-server, Mongoose, Express

## Optimizations

Using parallel routes for the private and group message, implementing use infinite scrolling, using aggregation for the complex query, using debouncing and lastly indexing.

## Installation

1. Clone my repository:

```bash
git clone https://github.com/Mana1010/ChitChat.git
```

2. Navigate to the project directory:

```bash
cd ChitChat
```

3. Install dependencies:

```bash
npm install
```

4. Set up environment variables:

- Create a .env file in the root directory
- Add the following variables:

```bash
For Client:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
# UPLOADTHING_TOKEN=
# UPLOADTHING_SECRET=
# UPLOADTHING_APP_ID=

For Server:
# MONGODB KEY
MONGO_URI=
# CLOUDINARY KEY
CLOUDINARY_CLOUD_NAME =
CLOUDINARY_API_KEY =
CLOUDINARY_API_SECRET =

```

5. Start the development server:

```bash
npm run dev
```
