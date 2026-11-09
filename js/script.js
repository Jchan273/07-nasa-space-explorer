document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const fetchBtn = document.getElementById('fetch-btn');
    const galleryContainer = document.getElementById('gallery-container');
    const loadingMessage = document.getElementById('loading-message');
    
    // Modal elements
    const modal = document.getElementById('apod-modal');
    const modalClose = document.getElementById('modal-close');
    const modalMediaContainer = document.getElementById('modal-media-container');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalExplanation = document.getElementById('modal-explanation');

    // Space Facts Array (Extra Credit)
    const spaceFacts = [
        "One day on Venus is longer than one year on Venus! It takes 243 Earth days to rotate once on its axis, but only 225 Earth days to complete an orbit around the Sun.",
        "Neutron stars are so dense that a single teaspoon of neutron star material would weigh about 6 billion tons on Earth.",
        "Because there is no atmosphere in space, the sun appears white, not yellow, and sunsets on Mars are blue.",
        "There are more trees on Earth than stars in the Milky Way galaxy—an estimated 3 trillion trees compared to 100–400 billion stars.",
        "The footprints left by Apollo astronauts on the Moon will likely stay there for millions of years because there is no wind or water erosion."
    ];

    // Initialize Random Space Fact
    function displayRandomFact() {
        const randomIndex = Math.floor(Math.random() * spaceFacts.length);
        document.getElementById('space-fact-text').textContent = spaceFacts[randomIndex];
    }
    displayRandomFact();

    // Set initial date range values (default to last 7 days)
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    startDateInput.value = sevenDaysAgo;
    endDateInput.value = today;

    // Fetch APOD Data on Button Click
    fetchBtn.addEventListener('click', async () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        if (startDate > endDate) {
            alert('Start date cannot be later than end date.');
            return;
        }

        // Show loading state
        loadingMessage.classList.remove('hidden');
        galleryContainer.innerHTML = '';

        try {
            // Using your personal NASA API Key
            const apiKey = 'PbbNtMcGcWjzftCNGpPHjm8GkNPJJQNtMKJBq9cq';
            const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;
            
            const response = await fetch(url);
            const data = await response.json();

            loadingMessage.classList.add('hidden');

            if (data.code === 400 || data.error) {
                galleryContainer.innerHTML = `<p class="placeholder-message">Error: ${data.msg || 'Invalid date range.'}</p>`;
                return;
            }

            renderGallery(data);

        } catch (error) {
            loadingMessage.classList.add('hidden');
            galleryContainer.innerHTML = `<p class="placeholder-message">Failed to fetch space data. Please check your network connection.</p>`;
            console.error('Error fetching APOD data:', error);
        }
    });

    // Render Gallery Cards
    function renderGallery(items) {
        if (!items || items.length === 0) {
            galleryContainer.innerHTML = `<p class="placeholder-message">No space photos found for this date range.</p>`;
            return;
        }

        // Sort items newest first
        items.reverse();

        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('gallery-item');

            const mediaWrapper = document.createElement('div');
            mediaWrapper.classList.add('media-wrapper');

            // Handle Video vs Image entries (Extra Credit)
            if (item.media_type === 'video') {
                const iframe = document.createElement('iframe');
                iframe.src = item.url;
                iframe.title = item.title;
                iframe.loading = 'lazy';
                mediaWrapper.appendChild(iframe);
            } else {
                const img = document.createElement('img');
                img.src = item.url;
                img.alt = item.title;
                img.loading = 'lazy';
                mediaWrapper.appendChild(img);
            }

            const infoDiv = document.createElement('div');
            infoDiv.classList.add('item-info');

            const title = document.createElement('h4');
            title.textContent = item.title;

            const date = document.createElement('span');
            date.classList.add('item-date');
            date.textContent = item.date;

            infoDiv.appendChild(title);
            infoDiv.appendChild(date);

            card.appendChild(mediaWrapper);
            card.appendChild(infoDiv);

            // Open Modal on Click
            card.addEventListener('click', () => {
                openModal(item);
            });

            galleryContainer.appendChild(card);
        });
    }

    // Modal Handling
    function openModal(item) {
        modalMediaContainer.innerHTML = '';

        if (item.media_type === 'video') {
            const iframe = document.createElement('iframe');
            iframe.src = item.url;
            iframe.title = item.title;
            iframe.allowFullscreen = true;
            modalMediaContainer.appendChild(iframe);
        } else {
            const img = document.createElement('img');
            img.src = item.hdurl || item.url;
            img.alt = item.title;
            modalMediaContainer.appendChild(img);
        }

        modalTitle.textContent = item.title;
        modalDate.textContent = item.date;
        modalExplanation.textContent = item.explanation;

        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
        modalMediaContainer.innerHTML = ''; // Stop video playback when closed
    }

    modalClose.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
});
