# Intraone ISP Website

![Express.js](https://img.shields.io/badge/Express.js-4.x-brightgreen) ![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange) ![GAE](https://img.shields.io/badge/Google%20App%20Engine-Deployed-blue)

Welcome to **Intraone**, a modern internet service provider (ISP) platform that makes managing internet subscriptions seamless and intuitive for both customers and administrators. Built for scalability and ease of maintenance, Intraone combines powerful backend technology with a user-friendly frontend interface.

---

## 🌐 Project Overview

**For Customers:**

* Create accounts and securely log in.
* Browse available internet packages.
* Subscribe to preferred packages.
* View and manage active subscriptions in real time.

**For Admins:**

* Manage customer data and accounts.
* Publish and maintain announcements for users.
* Monitor and manage all transactions in the system.

Whether you’re a customer looking for a reliable ISP or an admin managing operations, Intraone provides the tools you need.

---

## 🚀 Tech Stack

* **Backend:** [Express.js](https://expressjs.com/) — Fast, minimalist web framework for Node.js
* **Database:** [Firebase Realtime Database](https://firebase.google.com/docs/database) — Lightning-fast cloud-hosted NoSQL database with real-time syncing
* **Hosting/Deployment:** [Google App Engine (GAE)](https://cloud.google.com/appengine) — Fully managed platform for scalable applications

---

## 🔧 Backend Architecture

The server follows a modular MVC pattern for better separation of concerns and maintainability.

### Entry Point

* `server.js` → Initializes Express, middleware, and routes.

### Configuration

* `config/firebaseConfig.js` → Handles Firebase Realtime Database connection setup.

### Models

Located in the `models/` folder, these files encapsulate database interactions for different entities:

* `adminModel.js`
* `announcementModel.js`
* `pelangganModel.js` (customers)
* `tempTransaksiModel.js` (temporary transactions)
* `transaksiModel.js` (completed transactions)

### Controllers

Located in the `controllers/` folder, these manage the business logic for each API endpoint.

### Routes

Located in the `routes/` folder:

* `/api/admin` → Admin-specific operations
* `/api/announcements` → Manage public announcements
* `/api/pelanggan` → Customer-related operations
* `/api/tempTransaksi` → Temporary transactions handling
* `/api/transaksi` → Processing and finalizing transactions

All routes connect to Firebase to persist and fetch data in real time.

---

## 📂 Project Structure

```
Intraone-main/
  ├── server/
  │     ├── config/
  │     ├── controllers/
  │     ├── models/
  │     ├── routes/
  │     ├── server.js
  │     ├── package.json
  ├── public/
  │     ├── css/
  │     ├── js/
  │     ├── html pages
  ├── app.yaml
  └── README.md
```

---

## 🚢 Deployment

Intraone is designed for deployment on **Google App Engine** using `app.yaml` configuration:

Example `app.yaml`:

```yaml
runtime: nodejs18
instance_class: F2
handlers:
  - url: /
    static_files: public/index.html
    upload: public/index.html
  - url: /(.*)
    static_files: public/\1
    upload: public/(.*)
  - url: /api/.*
    script: auto
```

Deploy with:

```bash
gcloud app deploy app.yaml
```

GAE ensures high availability and auto-scaling based on traffic.

---

## 💻 Running Locally

To test Intraone locally:

1. Clone the repository:

```bash
git clone <repo-url>
cd Intraone-main/server
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase credentials inside `config/firebaseConfig.js`.

4. Start the server:

```bash
node server.js
```

The server runs on the port specified in `server.js`. Navigate to `http://localhost:<PORT>` to view the application.

---

## 📜 License

This project is open-source and available under the MIT License.

Enjoy using Intraone!
