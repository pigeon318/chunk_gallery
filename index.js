const BACKEND_URL = 'http://82.33.96.128:3000';

let currentUser = '';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${BACKEND_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    currentUser = username;
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    if (!data.canUpload) {
      document.getElementById('uploadBtn').style.display = 'none';
      document.getElementById('imageUpload').style.display = 'none';
    }
    loadGallery();
  } else {
    alert('Login failed!');
  }
});

document.getElementById('uploadBtn').addEventListener('click', async () => {
  const file = document.getElementById('imageUpload').files[0];
  if (!file) return alert('Select a file');
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('username', currentUser);

  const res = await fetch(`${BACKEND_URL}/upload`, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();
  if (data.success) {
    alert('Upload successful!');
    loadGallery();
  } else {
    alert('Upload failed');
  }
});

async function loadGallery() {
  const res = await fetch(`${BACKEND_URL}/gallery`);
  const data = await res.json();
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';

  data.images.forEach(filename => {
    const imgBox = document.createElement('div');
    const img = document.createElement('img');
    img.src = `${BACKEND_URL}/uploads/${filename}`;
    img.alt = filename;
    imgBox.appendChild(img);

    if (currentUser === 'pigeon_dev') {
      const delBtn = document.createElement('button');
      delBtn.innerText = 'Delete';
      delBtn.className = 'delete-btn';
      delBtn.onclick = () => deleteImage(filename);
      imgBox.appendChild(delBtn);
    }

    gallery.appendChild(imgBox);
  });
}

async function deleteImage(filename) {
  const res = await fetch(`${BACKEND_URL}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser, filename })
  });

  const data = await res.json();
  if (data.success) {
    alert('Deleted!');
    loadGallery();
  } else {
    alert('Delete failed');
  }
}
