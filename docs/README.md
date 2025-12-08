# CS346 Semester Project Template

A teaching template for building secure web applications with Node.js, Express, EJS, and PostgreSQL.

## Features

- 🚀 **Node.js 20** + **Express 4** - Modern JavaScript backend
- 🎨 **EJS** - Server-side templating
- 🗄️ **PostgreSQL** - Reliable relational database
- 🔒 **Security First** - Helmet, CSRF protection, secure sessions
- 📝 **Clean Code** - ESLint, Prettier, best practices
- 🎓 **Educational** - Well-documented, instructional code

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd cs346-semester-project-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Project Structure (detailed)

```
.
├── src/
│   ├── server.js                     # Server entry point (starts app)
│   ├── app.js                        # Express app, routes & middleware
│   ├── routes/
│   │   ├── index.js                  # index, register, login routes
│   │   ├── upload.js                 # upload endpoints and file handling
│   │   ├── users.js                  # user-related routes (profile, claims)
│   │   └── buildingHours.js          # API route for building hours proxy
│   ├── controllers/
│   │   ├── indexController.js        # homepage / search helpers
│   │   ├── allItemsController.js     # list & query uploads
│   │   ├── uploadController.js       # upload handling
│   │   ├── userController.js         # user-related actions
│   │   └── buildingHoursController.js# fetch building hours
│   ├── models/
│   │   ├── db.js                     # PostgreSQL pool & query helper
│   │   ├── supabaseClient.js         # public supabase client (anon)
│   │   ├── supabaseAdmin.js          # admin/service-role client
│   │   └── User.js                   # (optional) user model utils
│   ├── views/
│   │   ├── partials/
│   │   │   ├── header.ejs
│   │   │   └── footer.ejs
│   │   ├── layout.ejs
│   │   ├── allResults.ejs
│   │   ├── upload.ejs
│   │   ├── uploadSuccess.ejs
│   │   ├── register.ejs
│   │   ├── login.ejs
│   │   └── error.ejs
│   └── public/
│       ├── css/                      # project stylesheets
│       │   ├── allResults.css
│       │   ├── global.css
│       │   ├── login.css
│       │   ├── register.css
│       │   ├── style.css
│       │   ├── upload.css
│       │   └── uploadSuccess.css
│       ├── js/                       # client-side scripts
│       │   ├── claimAlert.js
│       │   ├── login.js
│       │   ├── main.js
│       │   └── register.js
│       └── uploads/                  # user-uploaded files (gitignored)
│           ├── <hash>                # many uploaded file entries
│           └── ...
├── db/
│   ├── migrate.js                    # runs SQL migrations
│   ├── seed.js                       # runs SQL seeds
│   ├── reset.js                      # reset DB (used with caution)
│   ├── migrations/
│   │   └── 001_create_users_table.sql
│   └── seeds/
│       └── 001_seed_users.sql
├── docs/
│   ├── README.md                     # documentation (this file)
│   ├── SETUP.md                      # setup & environment notes
│   └── ARCHITECTURE.md               # high-level architecture
├── public/                           # public assets used in builds / demo
│   └── uploads/                      # demo uploads (kept for examples)
├── .env.example
├── CONTRIBUTING.md
├── eslint.config.js
├── package.json
├── QUICKSTART.md
├── README.md                         # project README (root)
└── other project files (LICENSE, docs, config)

```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run reset` - Reset database (WARNING: deletes all data!)
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier

## Security Features

- **Helmet**: Sets security-related HTTP headers
- **express-session**: Secure session management with httpOnly cookies
- **csurf**: Cross-Site Request Forgery (CSRF) protection
- **Parameterized SQL**: SQL injection prevention with prepared statements
- **Environment Variables**: Sensitive data kept out of source code

## Documentation

Comprehensive documentation is available in the `docs/` folder:

- [docs/README.md](docs/README.md) - Documentation overview
- [docs/SETUP.md](docs/SETUP.md) - Detailed setup instructions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architecture and design patterns

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Express 4
- **Templating**: EJS
- **Database**: PostgreSQL (with pg driver)
- **Security**: Helmet, express-session, csurf
- **Development**: ESLint, Prettier, Nodemon

## Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [OWASP Security Guide](https://owasp.org/)

## Contributing

This is a teaching template. Feel free to:
- Report issues
- Suggest improvements
- Submit pull requests
- Use it for your own projects

## License

ISC