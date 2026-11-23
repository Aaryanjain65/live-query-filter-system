# ❄️ ArcticFind – Smart Resource Discovery Platform

**ArcticFind** is a full-stack resource discovery platform that helps users explore and find learning resources through live search, category filters, sorting, and favorites.

🌐 **Live Demo:** https://live-query-filter-system-eight.vercel.app/

⚙️ **Backend API:** https://arcticfind-api.onrender.com/

---

## 🚀 Features

- **Live Search:** Search resources by keywords.
- **Category Filtering:** Filter resources by multiple categories.
- **Sorting:** Sort resources by rating, title, and duration.
- **Favorites:** Save and manage favorite resources.
- **Pagination:** Browse resources across multiple pages.
- **Search Highlighting:** Highlight matching search keywords.
- **CSV Export:** Export resource data into CSV format.
- **Responsive UI:** Modern interface for different screen sizes.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Tailwind CSS
- Vite
- Lucide React

### Backend
- Python
- Flask
- Flask-CORS
- JSON Data Storage

### Deployment
- Vercel – Frontend
- Render – Backend
- GitHub – Version Control

## 📂 Project Structure

```text
live-query-filter-system/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── live-query-filter/
│   ├── app.py
│   ├── requirements.txt
│   └── live_filter_catalog.json
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Aaryanjain65/live-query-filter-system.git
cd live-query-filter-system
```

### 2. Start the Backend

```bash
cd live-query-filter
python -m venv venv
```

Activate the virtual environment on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start Flask:

```bash
python app.py
```

Backend runs at:

`http://127.0.0.1:5000`

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API status |
| GET | `/api/categories` | Get categories |
| GET | `/api/search` | Search and filter resources |

Example:

```text
/api/search?search=python&category=Development&page=1&limit=9
```

## 🌍 Live Deployment

- **Frontend:** https://live-query-filter-system-eight.vercel.app/
- **Backend:** https://arcticfind-api.onrender.com/

## 👨‍💻 Developer

**Aaryan Jain**

GitHub: https://github.com/Aaryanjain65

---

⭐ If you find this project useful, consider giving it a star!

**Built with React.js, Flask and Python.**