import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getBooks, addBook, updateBook, deleteBook, getBookPdfUrl } from '../../services/api';

const CATEGORIES = ['Fiction','Non-Fiction','Science','Technology','History','Biography','Self-Help','Mystery','Romance','Fantasy','Horror','Children','Academic','Other'];
const EMPTY_FORM = { title:'', author:'', isbn:'', category:'Fiction', description:'', totalCopies:1, publisher:'', publishedYear:'', language:'English' };

function BookModal({ book, onClose, onSave }) {
  const [form, setForm] = useState(book ? { ...book, totalCopies: book.totalCopies } : EMPTY_FORM);
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!book;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined) fd.append(k, v); });
      if (coverFile) fd.append('coverImage', coverFile);
      if (pdfFile) fd.append('pdfFile', pdfFile);
      if (isEdit) {
        await updateBook(book._id, fd);
        toast.success('Book updated! ✏️');
      } else {
        await addBook(fd);
        toast.success('Book added! 📚');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? '✏️ Edit Book' : '➕ Add New Book'}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input name="title" className="form-input" value={form.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Author *</label>
              <input name="author" className="form-input" value={form.author} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select name="category" className="form-select" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Copies *</label>
              <input type="number" name="totalCopies" className="form-input" min="1" value={form.totalCopies} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ISBN</label>
              <input name="isbn" className="form-input" value={form.isbn} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Publisher</label>
              <input name="publisher" className="form-input" value={form.publisher} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Published Year</label>
              <input type="number" name="publishedYear" className="form-input" value={form.publishedYear} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <input name="language" className="form-input" value={form.language} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">📷 Cover Image</label>
              <label className="file-upload-area">
                <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files[0])} />
                {coverFile ? `✅ ${coverFile.name}` : isEdit && book.coverImage ? '🔄 Replace cover' : '📷 Upload cover image'}
              </label>
            </div>
            <div className="form-group">
              <label className="form-label">📄 PDF File</label>
              <label className="file-upload-area">
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])} />
                {pdfFile ? `✅ ${pdfFile.name}` : isEdit && book.pdfFile ? '🔄 Replace PDF' : '📄 Upload PDF'}
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : isEdit ? '✏️ Update' : '➕ Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | book object

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getBooks({ search, category, page, limit: 10 });
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

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      await deleteBook(book._id);
      toast.success('Book deleted');
      fetchBooks();
    } catch {
      toast.error('Failed to delete book');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">📚 Book Management</h2>
        <button className="btn btn-primary" onClick={() => setModal('add')}>➕ Add Book</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 200 }}>
          <span>🔍</span>
          <input placeholder="Search by title, author, ISBN..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No books found</h3>
              <p>Add your first book using the button above</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Title & Author</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>PDF</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book._id}>
                    <td>
                      {book.coverImage
                        ? <img src={book.coverImage} alt="" style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6 }} />
                        : <div style={{ width: 40, height: 52, borderRadius: 6, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📖</div>
                      }
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{book.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{book.author}</div>
                    </td>
                    <td><span className="book-badge badge-category">{book.category}</span></td>
                    <td>
                      <span style={{ color: book.availableCopies > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {book.availableCopies}/{book.totalCopies}
                      </span>
                    </td>
                    <td>
                      {book.hasPdf
                        ? <a href={getBookPdfUrl(book._id)} target="_blank" rel="noreferrer" className="btn btn-sm btn-secondary">📄 View</a>
                        : <span style={{ color: 'var(--text-muted)' }}>—</span>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setModal(book)}>✏️</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(book)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {total > 10 && (
          <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total: {total} books</span>
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <BookModal
          book={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchBooks(); }}
        />
      )}
    </div>
  );
}
