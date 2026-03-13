# Η Ακρόπολη – Εκπαιδευτικό Λογισμικό

An interactive educational web application about the Acropolis of Athens, developed for the University of Piraeus. Users can register, log in, study three chapters covering history, monuments, and architecture, complete quizzes, track their progress, and unlock a final challenge.

## Features

- User registration and login
- Three educational chapters with embedded videos and resources
- Chapter quizzes, a final quiz, and a challenge quiz
- Progress tracking per user

## Requirements

- [Node.js](https://nodejs.org/)
- MySQL (e.g. via XAMPP or MySQL Workbench)

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ekpaideutiko_logismiko-master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Import the database**
   Open MySQL and run:
   ```bash
   mysql -u root -p < acropolis.sql
   ```

4. **Create a `.env` file** in the project root:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=acropolis_edu
   ```

5. **Start the server**
   ```bash
   node user.js
   ```

6. **Open the app**
   Go to [http://localhost:3000](http://localhost:3000) in your browser.
