const BACKEND_URL = 'http://82.33.96.128:3000/';
let currentUser = null;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const loginError = document.getElementById('loginError');

  const res = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const result = await res.json();

  if (result.success) {
    currentUser = result.username;
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('welcome').textContent = `Welcome, ${currentUser}!`;

    if (currentUser === 'pigeon_dev') {
      document.getElementById('uploadForm').classList.remove('hidden');
    }

    loadGallery();
  } else {
    loginError.textContent = result.error || 'Login failed';
  }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const file = document.getElementById('imageFile').files[0];
  const status = document.getElementById('uploadStatus');
  if (!file) return status.textContent = 'No file selected.';

  const formData = new FormData();
  formData.append('image', file);
  formData.append('username', currentUser);

  try {
    const res = await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (result.success) {
      status.textContent = 'Upload successful!';
      loadGallery();
    } else {
      status.textContent = 'Upload failed: ' + (result.error || '');
    }
  } catch (err) {
    status.textContent = 'Upload error: ' + err.message;
  }
});

async function loadGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = 'Loading...';

  try {
    const res = await fetch(`${BACKEND_URL}/gallery`);
    const urls = await res.json();
    gallery.innerHTML = '';

    if (urls.length === 0) {
      gallery.innerHTML = '<p>No images yet.</p>';
      return;
    }

    urls.forEach(fullPath => {
      const img = document.createElement('img');
      img.src = `${BACKEND_URL}${fullPath}`;
      img.style.display = 'block';

      const wrapper = document.createElement('div');
      wrapper.appendChild(img);

      if (currentUser === 'pigeon_dev') {
        const btn = document.createElement('button');
        btn.textContent = '🗑️ Delete';
        btn.style.marginTop = '5px';

        btn.onclick = async () => {
          const filename = fullPath.split('/').pop();

          const res = await fetch(`${BACKEND_URL}/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, username: currentUser })
          });

          const result = await res.json();
          if (result.success) {
            loadGallery();
          } else {
            alert('Failed to delete: ' + result.error);
          }
        };

        wrapper.appendChild(btn);
      }

      gallery.appendChild(wrapper);
    });
  } catch (err) {
    gallery.innerHTML = 'Failed to load gallery.';
  }
}
