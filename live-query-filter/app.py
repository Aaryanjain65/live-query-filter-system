
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Load catalog
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, "live_filter_catalog.json")

with open(FILE_PATH, "r", encoding="utf-8") as file:
    catalog = json.load(file)


# Home API
@app.route("/")
def home():
    return jsonify({
        "message": "Live Query Filter API is running!",
        "total_records": len(catalog),
        "status": "success"
    })


# Get all categories
@app.route("/api/categories")
def categories():
    category_list = sorted(set(
        item["category"] for item in catalog
    ))

    return jsonify({
        "status": "success",
        "categories": category_list
    })


# Search and filter API
@app.route("/api/search")
def search():
    query = request.args.get("search", "").strip().lower()
    category = request.args.get("category", "").strip()

    try:
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
    except ValueError:
        return jsonify({
            "error": "Page and limit must be integers"
        }), 400

    if page < 1 or limit < 1 or limit > 100:
        return jsonify({
            "error": "Invalid page or limit"
        }), 400

    results = catalog

    # Search by title, category and level
    if query:
        results = [
            item for item in results
            if query in item["title"].lower()
            or query in item["category"].lower()
            or query in item["level"].lower()
        ]

    # Multiple category filtering
    if category:
        selected = [
            c.strip().lower()
            for c in category.split(",")
        ]

        results = [
            item for item in results
            if item["category"].lower() in selected
        ]

    # Pagination
    total = len(results)
    total_pages = (total + limit - 1) // limit
    start = (page - 1) * limit
    end = start + limit

    paginated_data = results[start:end]

    return jsonify({
        "status": "success",
        "total_records": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
        "results": paginated_data
    })


if __name__ == "__main__":
    app.run(debug=True)

