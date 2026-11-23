
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search, Clock, Star, Heart, X, SlidersHorizontal,
  Download, ArrowUpDown, BookOpen, ChevronLeft,
  ChevronRight, RefreshCw, Trash2, Command, Sparkles
} from "lucide-react";

const API = "http://127.0.0.1:5000";
const LIMIT = 9;

function HighlightText({ text = "", query = "" }) {
  const value = String(text);
  if (!query.trim()) return value;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = value.split(new RegExp(`(${escaped})`, "ig"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="rounded bg-orange-400/30 px-0.5 text-orange-200">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem("arcticFavorites") || "[]");
  } catch {
    return [];
  }
}

function exportCSV(items) {
  if (!items.length) return;

  const headers = ["ID", "Title", "Category", "Level", "Duration", "Rating"];
  const rows = items.map(item => [
    item.id,
    item.title,
    item.category,
    item.level,
    item.durationMinutes,
    item.rating
  ]);

  const csv = [headers, ...rows]
    .map(row =>
      row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "arcticfind-resources.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("rating");
  const [activeResource, setActiveResource] = useState(null);
  const [favorites, setFavorites] = useState(readFavorites);
  const [showFavorites, setShowFavorites] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("arcticFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const handleShortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === "Escape") setActiveResource(null);
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then(response => {
        if (!response.ok) throw new Error("Could not load categories");
        return response.json();
      })
      .then(data => setCategories(data.categories || []))
      .catch(() => setError("Unable to connect to the backend."));
  }, []);

  useEffect(() => {
    if (showFavorites) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          search,
          category: selectedCategories.join(","),
          page: String(page),
          limit: String(LIMIT)
        });

        const response = await fetch(`${API}/api/search?${params}`, {
          signal: controller.signal
        });

        if (!response.ok) throw new Error("Search request failed");

        const data = await response.json();
        setResults(data.results || []);
        setTotal(data.total_records || 0);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Could not load resources. Check whether the backend is running.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, selectedCategories, page, showFavorites]);

  const toggleCategory = category => {
    setSelectedCategories(current =>
      current.includes(category)
        ? current.filter(item => item !== category)
        : [...current, category]
    );
    setPage(1);
  };

  const toggleFavorite = item => {
    setFavorites(current =>
      current.some(favorite => favorite.id === item.id)
        ? current.filter(favorite => favorite.id !== item.id)
        : [...current, item]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setPage(1);
    setSort("rating");
    setShowFavorites(false);
  };

  const removeAllFavorites = () => {
    if (window.confirm("Remove all saved favorites?")) {
      setFavorites([]);
    }
  };

  const visibleResults = useMemo(() => {
    const list = showFavorites ? [...favorites] : [...results];

    return list.sort((a, b) => {
      if (sort === "title") return (a.title || "").localeCompare(b.title || "");
      if (sort === "duration") return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [results, favorites, showFavorites, sort]);

  const handleExport = useCallback(() => {
    exportCSV(visibleResults);
  }, [visibleResults]);

  return (
    <div className="min-h-screen bg-[#0B1720] text-[#E7F1F4]">
      <header className="border-b border-white/10 bg-[#10212B]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-300">
              <Sparkles size={25} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide">
                Arctic<span className="text-cyan-400">Find</span>
              </h1>
              <p className="text-xs text-slate-400">Smart Resource Discovery</p>
            </div>
          </div>

          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
              showFavorites
                ? "border-pink-400 bg-pink-400/15 text-pink-300"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <Heart size={17} />
            Favorites ({favorites.length})
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <section className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
            <Sparkles size={15} /> Discover. Learn. Grow.
          </div>

          <h2 className="text-4xl font-black leading-tight md:text-6xl">
            Find Your Next
            <span className="block text-cyan-400">Learning Resource.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Explore useful resources across development, design, analytics and security.
          </p>
        </section>

        <section className="mx-auto mb-8 max-w-3xl">
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/20 bg-[#102B35] px-4 py-4 shadow-lg shadow-cyan-950/20 focus-within:border-cyan-400">
            <Search className="shrink-0 text-cyan-400" size={22} />
            <input
              ref={searchRef}
              value={search}
              onChange={event => {
                setSearch(event.target.value);
                setPage(1);
                setShowFavorites(false);
              }}
              placeholder="Search resources, skills, categories..."
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={19} className="text-slate-400 hover:text-white" />
              </button>
            )}
            <span className="hidden items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-500 sm:flex">
              <Command size={12} /> K
            </span>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-white/10 bg-[#10212B] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={19} className="text-cyan-400" />
              <h3 className="font-bold">Filter by Category</h3>
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-orange-300 hover:text-orange-200"
            >
              <RefreshCw size={14} /> Reset Filters
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  selectedCategories.includes(category)
                    ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold">
              {showFavorites ? "Your Favorites" : "Explore Resources"}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {showFavorites
                ? `${favorites.length} saved resources`
                : `${total} resources found`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#10212B] px-3 py-2">
              <ArrowUpDown size={15} className="text-cyan-400" />
              <select
                value={sort}
                onChange={event => setSort(event.target.value)}
                className="bg-transparent text-sm outline-none"
              >
                <option className="bg-[#10212B]" value="rating">Top Rated</option>
                <option className="bg-[#10212B]" value="title">Title A-Z</option>
                <option className="bg-[#10212B]" value="duration">Shortest Duration</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              disabled={!visibleResults.length}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-[#071820] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download size={16} /> Export CSV
            </button>

            {showFavorites && favorites.length > 0 && (
              <button
                onClick={removeAllFavorites}
                className="flex items-center gap-2 rounded-xl border border-red-400/30 px-3 py-2.5 text-sm text-red-300 hover:bg-red-400/10"
              >
                <Trash2 size={15} /> Remove All
              </button>
            )}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-400" />
            <p className="text-sm text-slate-400">Finding resources...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-400/15 px-4 py-2 text-sm text-red-200"
            >
              Try Again
            </button>
          </div>
        ) : visibleResults.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#10212B] px-5 py-16 text-center">
            <BookOpen className="mx-auto mb-4 text-slate-500" size={40} />
            <h3 className="text-xl font-bold">No Resources Found</h3>
            <p className="mt-2 text-sm text-slate-400">
              Try another search or reset your filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-cyan-500 px-5 py-2.5 font-bold text-[#071820]"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleResults.map(item => {
              const isFavorite = favorites.some(favorite => favorite.id === item.id);

              return (
                <article
                  key={item.id}
                  onClick={() => setActiveResource(item)}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-[#102B35] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-950/30"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                      {item.category}
                    </span>
                    <button
                      onClick={event => {
                        event.stopPropagation();
                        toggleFavorite(item);
                      }}
                      aria-label="Toggle favorite"
                      className={`rounded-full p-2 transition ${
                        isFavorite
                          ? "bg-pink-400/15 text-pink-400"
                          : "text-slate-500 hover:bg-pink-400/10 hover:text-pink-400"
                      }`}
                    >
                      <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <h3 className="mb-3 min-h-14 text-lg font-bold leading-snug group-hover:text-cyan-300">
                    <HighlightText text={item.title} query={search} />
                  </h3>

                  <div className="mb-5 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      {item.level}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      <Clock size={13} /> {item.durationMinutes} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="flex items-center gap-1 text-sm text-orange-300">
                      <Star size={15} fill="currentColor" /> {item.rating ?? "N/A"}
                    </span>
                    <span className="text-sm font-semibold text-cyan-300">
                      View Details →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {!showFavorites && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(current => current - 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-30"
            >
              <ChevronLeft size={17} /> Previous
            </button>

            <span className="rounded-xl bg-cyan-400/10 px-4 py-2.5 text-sm text-cyan-300">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(current => current + 1)}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-30"
            >
              Next <ChevronRight size={17} />
            </button>
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-white/10 bg-[#10212B] px-5 py-6 text-center">
        <p className="font-bold text-cyan-400">ArcticFind</p>
        <p className="mt-1 text-xs text-slate-500">
          Smart Resource Discovery Platform
        </p>
      </footer>

      {activeResource && (
        <div
          onClick={() => setActiveResource(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div
            onClick={event => event.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-cyan-400/20 bg-[#102B35] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <span className="rounded-lg bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
                {activeResource.category}
              </span>
              <button
                onClick={() => setActiveResource(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <h2 className="text-2xl font-black">
              <HighlightText text={activeResource.title} query={search} />
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">Difficulty</p>
                <p className="mt-1 font-bold">{activeResource.level}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">Duration</p>
                <p className="mt-1 font-bold">{activeResource.durationMinutes} minutes</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">Rating</p>
                <p className="mt-1 flex items-center gap-1 font-bold text-orange-300">
                  <Star size={15} fill="currentColor" />
                  {activeResource.rating ?? "N/A"}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">Resource ID</p>
                <p className="mt-1 font-bold">{activeResource.id}</p>
              </div>
            </div>

            <button
              onClick={() => toggleFavorite(activeResource)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-pink-400/30 bg-pink-400/10 py-3 font-bold text-pink-300 hover:bg-pink-400/20"
            >
              <Heart
                size={18}
                fill={favorites.some(item => item.id === activeResource.id) ? "currentColor" : "none"}
              />
              {favorites.some(item => item.id === activeResource.id)
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
