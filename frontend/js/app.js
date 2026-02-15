// ============================================================
// Blog Frontend — Main JavaScript
// ============================================================
// Fetches published posts from the API and renders them
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

async function loadPosts() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const postsGrid = document.getElementById('postsGrid');
    const noPosts = document.getElementById('noPosts');
    const apiStatus = document.getElementById('apiStatus');
    const statusDot = apiStatus.querySelector('.status-dot');
    const statusText = apiStatus.querySelector('.status-text');

    // Show loading, hide others
    loading.style.display = 'block';
    error.style.display = 'none';
    postsGrid.style.display = 'none';
    noPosts.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/posts`);

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();

        // Update API status
        statusDot.classList.add('connected');
        statusText.textContent = 'API Connected';

        loading.style.display = 'none';

        if (data.data.posts.length === 0) {
            noPosts.style.display = 'block';
            return;
        }

        // Render posts
        postsGrid.innerHTML = data.data.posts.map(post => `
      <article class="post-card" onclick="viewPost(${post.id})">
        <div class="post-meta">
          <span class="post-author">✍️ ${post.author ? post.author.username : 'Unknown'}</span>
          <span>•</span>
          <span>${formatDate(post.createdAt)}</span>
        </div>
        <h3>${escapeHtml(post.title)}</h3>
        <p class="post-excerpt">${escapeHtml(post.content)}</p>
      </article>
    `).join('');

        postsGrid.style.display = 'grid';

    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'block';
        document.getElementById('errorMessage').textContent = err.message;

        // Update API status
        statusDot.classList.add('error');
        statusText.textContent = 'API Error';
    }
}

function viewPost(id) {
    // For now, just show an alert. In a full app, this would navigate to a post page.
    alert(`Post #${id} — Full post view coming in the next phase!`);
}

// ===== Utility Functions =====

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
