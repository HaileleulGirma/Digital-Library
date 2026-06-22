import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Document {
  id: number;
  title: string;
  uploaded_by: string;
  role_access: string[];
  uploaded_at: string;
}

// NEW: Interface for the User table
interface SystemUser {
  id: number;
  email: string;
  role: string;
}

export const Library: React.FC = () => {
  const { token, role, email, logout } = useAuth();
  
  // State for Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['admin', 'editor', 'viewer']);
  
  // NEW: State for Users and UI Tabs
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [currentTab, setCurrentTab] = useState<'documents' | 'users'>('documents');

  const canUpload = role === 'admin' || role === 'editor';
  const canDelete = role === 'admin';

  useEffect(() => {
    fetchDocs();
    if (role === 'admin') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchDocs = async () => {
    try {
      const res = await fetch('http://localhost:8000/documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  // NEW: Fetch Users (Admin Only)
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Ensure 'admin' is always pushed to the backend, even if the state somehow missed it
    const finalRoles = selectedRoles.includes('admin') ? selectedRoles : [...selectedRoles, 'admin'];

    try {
      const res = await fetch('http://localhost:8000/documents', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          title: newTitle,
          role_access: finalRoles 
        })
      });
      
      if (res.ok) {
        setNewTitle('');
        setSelectedRoles(['admin', 'editor', 'viewer']); 
        fetchDocs();
      } else {
        alert("Upload failed. Check permissions.");
      }
    } catch (err) {
      console.error("Failed to upload document", err);
    }
  };

  const handleRoleToggle = (roleToToggle: string) => {
    // FIX 1: Prevent the 'admin' role from ever being toggled off in state
    if (roleToToggle === 'admin') return; 

    setSelectedRoles(prev => 
      prev.includes(roleToToggle)
        ? prev.filter(r => r !== roleToToggle)
        : [...prev, roleToToggle]
    );
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`http://localhost:8000/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDocs();
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0 }}>Digital Library</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ backgroundColor: '#e3f2fd', color: '#1565c0', padding: '5px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px' }}>
            Role: {role?.toUpperCase()}
          </span>
          <span style={{ color: '#555' }}>{email}</span>
          <button 
            onClick={logout}
            style={{ padding: '8px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* NEW: Admin Tab Navigation */}
      {role === 'admin' && (
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setCurrentTab('documents')}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: currentTab === 'documents' ? '#007bff' : '#e9ecef', color: currentTab === 'documents' ? 'white' : 'black' }}
          >
            Manage Documents
          </button>
          <button 
            onClick={() => setCurrentTab('users')}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: currentTab === 'users' ? '#007bff' : '#e9ecef', color: currentTab === 'users' ? 'white' : 'black' }}
          >
            Manage Users
          </button>
        </div>
      )}

      {currentTab === 'documents' ? (
        <>
          {canUpload ? (
            <form onSubmit={handleUpload} style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <h3 style={{ marginTop: 0 }}>Upload New Document</h3>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input 
                  type="text" 
                  placeholder="Enter document title..." 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  required 
                  style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Upload
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '14px' }}>
                <strong style={{ color: '#555' }}>Visible to:</strong>
                {['admin', 'editor', 'viewer'].map(r => {
                  const isAdminRole = r === 'admin';
                  return (
                    <label key={r} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: isAdminRole ? 'not-allowed' : 'pointer', color: isAdminRole ? '#999' : '#000' }}>
                      <input 
                        type="checkbox" 
                        // FIX 1: Admin is always checked and visually disabled
                        checked={isAdminRole || selectedRoles.includes(r)}
                        disabled={isAdminRole}
                        onChange={() => handleRoleToggle(r)}
                      />
                      {r.charAt(0).toUpperCase() + r.slice(1)} {isAdminRole && '(Locked)'}
                    </label>
                  );
                })}
              </div>
            </form>
          ) : (
            <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '4px', border: '1px solid #ffeeba' }}>
              <strong>View Only:</strong> Your current role ({role}) does not have permission to upload documents.
            </div>
          )}

          <h3>Document Repository</h3>
          {documents.length === 0 ? (
            <p style={{ color: '#666' }}>No documents available in the library.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Uploaded By</th>
                  <th style={{ padding: '12px' }}>Access Roles</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', color: '#666' }}>#{doc.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{doc.title}</td>
                    <td style={{ padding: '12px', color: '#555' }}>{doc.uploaded_by}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {doc.role_access.map(r => (
                          <span key={r} style={{ fontSize: '11px', padding: '3px 6px', backgroundColor: '#e2e3e5', borderRadius: '3px', color: '#383d41' }}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {canDelete ? (
                        <button 
                          onClick={() => handleDelete(doc.id)} 
                          style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Delete
                        </button>
                      ) : (
                        <span style={{ color: '#aaa', fontSize: '12px', fontStyle: 'italic' }}>Restricted</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        // FIX 2: Admin User Management View
        <>
          <h3>System Users</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px' }}>User ID</th>
                <th style={{ padding: '12px' }}>Email Address</th>
                <th style={{ padding: '12px' }}>System Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', color: '#666' }}>#{u.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: u.role === 'admin' ? '#ffebee' : '#e8f5e9', color: u.role === 'admin' ? '#c62828' : '#2e7d32', borderRadius: '4px', fontWeight: 'bold' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};