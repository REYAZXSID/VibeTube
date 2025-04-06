const apiKey = 'AIzaSyAB_oYP0GmT7NLhpoeb2574T9giQ4yj28k';
const player = document.getElementById('player'); // Direct reference to iframe
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsDiv = document.getElementById('results');
const favoritesList = document.getElementById('favoritesList');
const progressBar = document.getElementById('progress');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function searchMusic() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        showError('Please enter a search term.');
        return;
    }

    showLoading(true);
    hideError();
    resultsDiv.innerHTML = '';

    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoEmbeddable=true&q=${encodeURIComponent(query)}+music&key=${apiKey}&maxResults=30`)
        .then(response => {
            if (!response.ok) throw new Error('API request failed');
            return response.json();
        })
        .then(data => {
            showLoading(false);
            if (data.error || !data.items || data.items.length === 0) {
                showError('No results found or API error occurred.');
            } else {
                displayResults(data.items);
            }
        })
        .catch(error => {
            showLoading(false);
            showError('Failed to fetch results. Check your connection or try again.');
            console.error('Fetch Error:', error);
        });
}

function displayResults(items) {
    resultsDiv.innerHTML = '';
    items.forEach((item, index) => {
        const videoId = item.id.videoId;
        const title = item.snippet.title;
        const thumbnail = item.snippet.thumbnails.medium.url;

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <img src="${thumbnail}" alt="${title}">
            <p>${title}</p>
            <button onclick="addToFavorites('${videoId}', '${title}', '${thumbnail}', event)">💌</button>
        `;
        resultItem.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                playVideo(videoId);
            }
        });
        resultsDiv.appendChild(resultItem);

        // Fade-in animation
        setTimeout(() => {
            resultItem.style.animation = `fadeIn 0.5s ease forwards`;
        }, index * 100);
    });
}

function playVideo(videoId) {
    player.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    hideError(); // Clear any previous errors
    // Reset progress bar since we can’t track it easily without the API
    progressBar.style.width = '0%';
}

function togglePlayPause() {
    // Since we’re using iframe src, we can’t directly control play/pause without the API.
    // Show a message to use YouTube’s built-in controls.
    showError('Use the video player controls for play/pause.');
}

function stopVideo() {
    player.src = ''; // Stop by clearing the iframe src
    progressBar.style.width = '0%';
}

function addToFavorites(videoId, title, thumbnail, event) {
    event.stopPropagation();
    if (!favorites.some(fav => fav.videoId === videoId)) {
        favorites.push({ videoId, title, thumbnail });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function removeFromFavorites(videoId, event) {
    event.stopPropagation();
    favorites = favorites.filter(fav => fav.videoId !== videoId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

function displayFavorites() {
    favoritesList.innerHTML = '';
    favorites.forEach((fav, index) => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <img src="${fav.thumbnail}" alt="${fav.title}">
            <p>${fav.title}</p>
            <button onclick="removeFromFavorites('${fav.videoId}', event)">🐧</button>
        `;
        favoriteItem.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                playVideo(fav.videoId);
            }
        });
        favoritesList.appendChild(favoriteItem);

        // Fade-in animation
        setTimeout(() => {
            favoriteItem.style.animation = `fadeIn 0.5s ease forwards`;
        }, index * 100);
    });
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    errorDiv.style.display = 'none';
}

// Load favorites on page load
displayFavorites();

// Clear player on initial load
player.src = '';