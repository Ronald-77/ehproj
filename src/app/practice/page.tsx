"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { FaSearch, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa";

// Mock Data
const EVENTS = [
  { id: "jan", name: "January Event" },
  { id: "feb", name: "February Event" },
  { id: "mar", name: "March Event" },
  { id: "apr", name: "April Event" },
  { id: "may", name: "May Event" },
];

const CATEGORIES = ["All", "Forensics", "Cryptography", "Web Exploitation", "Reverse Engineering", "Pwn"];

type Challenge = {
  id: string;
  title: string;
  category: string;
  eventId: string;
  points: number;
  difficulty: "Easy" | "Medium" | "Hard";
  solved?: boolean;
};

// Generate mock challenges for different events
const MOCK_CHALLENGES: Challenge[] = Array.from({ length: 150 }).map((_, i) => ({
  id: `chal-${i}`,
  title: `Challenge ${i + 1}`,
  category: CATEGORIES[Math.floor(Math.random() * (CATEGORIES.length - 1)) + 1], // Random category (excluding "All")
  eventId: EVENTS[Math.floor(Math.random() * EVENTS.length)].id,
  points: [100, 200, 300, 400, 500][Math.floor(Math.random() * 5)],
  difficulty: ["Easy", "Medium", "Hard"][Math.floor(Math.random() * 3)] as "Easy" | "Medium" | "Hard",
  solved: Math.random() > 0.8,
}));

const ITEMS_PER_PAGE = 9;

export default function PracticePage() {
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEventBoxOpen, setIsEventBoxOpen] = useState(false);

  // Filter challenges
  const filteredChallenges = MOCK_CHALLENGES.filter((challenge) => {
    const matchesEvent = challenge.eventId === selectedEvent;
    const matchesCategory = selectedCategory === "All" || challenge.category === selectedCategory;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEvent && matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const currentChallenges = filteredChallenges.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const currentEventName = EVENTS.find(e => e.id === selectedEvent)?.name || "Select Event";

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header & Filters */}
            <div className="mb-8">
              <div className="mb-6 flex items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Practice Arena
                </h1>

                <span className="text-2xl text-white/20">/</span>

                {/* Event Selector */}
                <div className="relative">
                  <button
                    onClick={() => setIsEventBoxOpen(!isEventBoxOpen)}
                    className="group flex items-center gap-2 rounded-lg py-1 text-2xl font-bold text-[#077c8a] transition hover:text-[#099aa8]"
                  >
                    <span>{currentEventName}</span>
                    {isEventBoxOpen ? <FaChevronUp className="text-sm opacity-50" /> : <FaChevronDown className="text-sm opacity-50" />}
                  </button>

                  {/* Dropdown Content */}
                  {isEventBoxOpen && (
                    <div className="absolute left-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl ring-1 ring-black/5">
                      <div className="p-1">
                        {EVENTS.map((event) => (
                          <button
                            key={event.id}
                            onClick={() => {
                              setSelectedEvent(event.id);
                              setIsEventBoxOpen(false); // Close on select
                              setCurrentPage(1);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                              selectedEvent === event.id
                                ? "bg-[#077c8a]/10 text-[#077c8a]"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            {event.name}
                            {selectedEvent === event.id && <div className="h-1.5 w-1.5 rounded-full bg-[#077c8a]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        selectedCategory === cat
                          ? "bg-white/15 text-white ring-1 ring-white/20"
                          : "bg-transparent text-white/40 hover:bg-white/5 hover:text-white/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-[#077c8a] focus:outline-none focus:ring-1 focus:ring-[#077c8a]"
                  />
                </div>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {currentChallenges.length > 0 ? (
                currentChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-[#077c8a]/50 hover:bg-white/10"
                  >
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                            challenge.difficulty === "Easy"
                              ? "bg-green-500/10 text-green-400"
                              : challenge.difficulty === "Medium"
                              ? "bg-yellow-500/10 text-yellow-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {challenge.difficulty}
                        </span>
                        <span className="text-sm font-medium text-[#077c8a]">{challenge.points} pts</span>
                      </div>

                      <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[#077c8a] transition-colors">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>{challenge.category}</span>
                      </div>
                    </div>

                    {challenge.solved && (
                      <div className="mt-4 flex justify-end">
                        <span className="text-green-500 text-xs font-bold uppercase tracking-widest">Solved</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
                  <p className="text-lg font-medium text-white/60">No challenges found</p>
                  <p className="text-sm text-white/40">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaChevronLeft />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`h-10 w-10 rounded-lg border text-sm font-medium transition ${
                          currentPage === page
                            ? "border-[#077c8a] bg-[#077c8a] text-white"
                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    (page === currentPage - 2 && page > 1) ||
                    (page === currentPage + 2 && page < totalPages)
                  ) {
                    return (
                      <span key={page} className="text-white/40">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
