import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getBooks, borrowBook } from '../../services/api';

const getPdfUrl = (url) => {
  if (!url) return null;
  if (url.toLowerCase().endsWith('.pdf')) return url;
  return url + '.pdf';
};

const CATEGORIES = ['All','Fiction','Non-Fiction','Science','Technology','History','Biography','Self-Help','Mystery','Romance','Fantasy','Horror','Children','Academic','Other'];

export default function UserLibrary() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getBooks({ search, category, page, limit: 12 });
      setBooks(data.books);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const handleBorrow = async (book) => {
    setBorrowing(book._id);
    try {
      await borrowBook(book._id);
      toast.success(`"${book.title}" borrowed! Due in 14 days 📚`);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(null);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">📚 Library</h2>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{total} books available</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input placeholder="Search title, author, ISBN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>}
        </div>
      </div>

      <div className="filters-bar">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-chip ${category === c ? 'active' : ''}`} onClick={() => { setCategory(c); setPage(1); }}>{c}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No books found</h3>
          <p>Try a different search or category</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book._id} className="book-card">
              <div className="book-cover" onClick={() => setSelected(book)} style={{ cursor: 'pointer' }}>
                {book.coverImage
                  ? <img src={book.coverImage} alt={book.title} />
                  : <span style={{ fontSize: '3rem' }}>📖</span>
                }
              </div>
              <div className="book-info">
                <div className="book-title" onClick={() => setSelected(book)} style={{ cursor: 'pointer' }}>{book.title}</div>
                <div className="book-author">{book.author}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span className="book-badge badge-category">{book.category}</span>
                  <span className={`book-badge ${book.availableCopies > 0 ? 'badge-available' : 'badge-unavailable'}`}>
                    {book.availableCopies > 0 ? `${book.availableCopies} left` : 'Unavailable'}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm btn-full"
                  onClick={() => handleBorrow(book)}
                  disabled={book.availableCopies === 0 || borrowing === book._id}
                >
                  {borrowing === book._id ? '⏳' : book.availableCopies === 0 ? '📵 Unavailable' : '📖 Borrow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3 className="modal-title">📖 Book Details</h3>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
              {selected.coverImage
                ? <img src={selected.coverImage} alt="" style={{ width: 100, height: 140, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                : <div style={{ width: 100, height: 140, background: 'var(--gradient-accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', flexShrink: 0 }}>📖</div>
              }
              <div>
                <h3 style={{ fontFamily: 'var(--font-main)', marginBottom: '0.5rem' }}>{selected.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>by {selected.author}</p>
                <span className="book-badge badge-category" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>{selected.category}</span>
                {selected.publisher && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Publisher: {selected.publisher}</p>}
                {selected.publishedYear && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Year: {selected.publishedYear}</p>}
                {selected.language && <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Language: {selected.language}</p>}
              </div>
            </div>
            {selected.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>{selected.description}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {selected.pdfFile && (
                <a href={getPdfUrl(selected.pdfFile)} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ flex: 1 }}>📄 Read PDF</a>
              )}
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={selected.availableCopies === 0 || borrowing === selected._id}
                onClick={() => { handleBorrow(selected); setSelected(null); }}
              >
                {selected.availableCopies === 0 ? '📵 Unavailable' : '📖 Borrow Book'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
