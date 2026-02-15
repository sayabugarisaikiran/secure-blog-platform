// ============================================================
// Admin Panel — JavaScript
// ============================================================
// Handles login, registration, post creation, and post management
// Uses JWT tokens stored in localStorage
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// ===== Auth State =====

function checkAuth() {
    const token = localStorage.getItem('blogToken');
    const user = JSON.parse(localStorage.getItem('blogUser') || 'null');

    if (token && user) {
        showDashboard(user);
    }
}

function showDashboard(user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('adminName').textContent = user.username;
    loadAdminPosts();
}

function logout() {
    localStorage.removeItem('blogToken');
    localStorage.removeItem('blogUser');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

// ===== Login =====

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    errorEl.style.display = 'none';

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || 'Login failed';
            errorEl.style.display = 'block';
            return;
        }

        localStorage.setItem('blogToken', data.data.token);
        localStorage.setItem('blogUser', JSON.stringify(data.data.user));
        showDashboard(data.data.user);

    } catch (err) {
        errorEl.textContent = 'Connection error. Is the backend running?';
        errorEl.style.display = 'block';
    }
}

// ===== Register =====

function toggleRegister() {
    const form = document.getElementById('registerForm');
    const btn = document.getElementById('toggleRegBtn');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.textContent = 'Back to Login';
    } else {
        form.style.display = 'none';
        btn.textContent = 'Create Account';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const errorEl = document.getElementById('registerError');

    errorEl.style.display = 'none';

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role }),
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.message || 'Registration failed';
            errorEl.style.display = 'block';
            return;
        }

        localStorage.setItem('blogToken', data.data.token);
        localStorage.setItem('blogUser', JSON.stringify(data.data.user));
        showDashboard(data.data.user);

    } catch (err) {
        errorEl.textContent = 'Connection error. Is the backend running?';
        errorEl.style.display = 'block';
    }
}

// ===== Create Post =====

async function handleCreatePost(e) {
    e.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const status = document.getElementById('postStatus').value;
    const msgEl = document.getElementById('createPostMsg');
    const token = localStorage.getItem('blogToken');

    try {
        const res = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content, status }),
        });

        const data = await res.json();

        if (!res.ok) {
            msgEl.className = 'form-error';
            msgEl.textContent = data.message || 'Failed to create post';
            msgEl.style.display = 'block';
            return;
        }

        // Success
        msgEl.className = 'form-success';
        msgEl.textContent = `Post "${title}" created successfully!`;
        msgEl.style.display = 'block';

        // Reset form
        document.getElementById('postTitle').value = '';
        document.getElementById('postContent').value = '';

        // Refresh posts list
        loadAdminPosts();

        // Hide message after 3 seconds
        setTimeout(() => { msgEl.style.display = 'none'; }, 3000);

    } catch (err) {
        msgEl.className = 'form-error';
        msgEl.textContent = 'Connection error';
        msgEl.style.display = 'block';
    }
}

// ===== Load Admin Posts =====

async function loadAdminPosts() {
    const token = localStorage.getItem('blogToken');
    const listEl = document.getElementById('adminPostsList');

    try {
        const res = await fetch(`${API_BASE}/posts/admin/all`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
            listEl.innerHTML = '<p class="muted">Failed to load posts</p>';
            return;
        }

        if (data.data.posts.length === 0) {
            listEl.innerHTML = '<p class="muted">No posts yet. Create your first one above!</p>';
            return;
        }

        listEl.innerHTML = data.data.posts.map(post => `
      <div class="admin-post-item">
        <div class="admin-post-info">
          <h4>${escapeHtml(post.title)}</h4>
          <span class="meta">
            <span class="post-status ${post.status}">${post.status}</span>
            &nbsp;•&nbsp; ${formatDate(post.createdAt)}
            &nbsp;•&nbsp; by ${post.author ? post.author.username : 'Unknown'}
          </span>
        </div>
        <div class="admin-post-actions">
          <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">Delete</button>
        </div>
      </div>
    `).join('');

    } catch (err) {
        listEl.innerHTML = '<p class="muted">Connection error</p>';
    }
}

// ===== Delete Post =====

async function deletePost(id) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const token = localStorage.getItem('blogToken');

    try {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (res.ok) {
            loadAdminPosts();
        }
    } catch (err) {
        alert('Failed to delete post');
    }
}

// ===== Utilities =====

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
