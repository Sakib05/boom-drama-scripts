// Debug to confirm script is loading
console.log('Script loaded successfully at ' + new Date().toLocaleString());

// Scroll to Top
window.onscroll = function() {
    let scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    }
};

function scrollToTop() {
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Multiple Ad Links for Video Ad
const adLinks = [
    'https://example.com/ad1',
    'https://example.com/ad2',
    'https://example.com/ad3',
    'https://example.com/ad4'
];

// Function to get a random ad link that hasn't been used in the last 24 hours
function getRandomAdLink() {
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    let availableAds = [];
    for (let i = 0; i < adLinks.length; i++) {
        const adKey = `adUsed_${i}`;
        const lastUsed = localStorage.getItem(adKey);
        if (!lastUsed || (now - parseInt(lastUsed) > oneDayInMs)) {
            availableAds.push({ index: i, link: adLinks[i] });
        }
    }
    if (availableAds.length === 0) {
        for (let i = 0; i < adLinks.length; i++) {
            localStorage.removeItem(`adUsed_${i}`);
            availableAds.push({ index: i, link: adLinks[i] });
        }
    }
    const randomIndex = Math.floor(Math.random() * availableAds.length);
    const selectedAd = availableAds[randomIndex];
    localStorage.setItem(`adUsed_${selectedAd.index}`, now.toString());
    return selectedAd.link;
}

// Redirect Ad Logic for Video Ad, Download, and Episode Switch
function handleAdRedirect(url, type) {
    sessionStorage.setItem('returnUrl', window.location.href);
    sessionStorage.setItem('redirectAfterAd', url);
    sessionStorage.setItem('adType', type); // 'video', 'download', or 'episode'
    sessionStorage.setItem('adStartTime', Date.now().toString());
    const adUrl = getRandomAdLink();
    window.location.href = adUrl;
}

// Ad Page Countdown Logic (Simulated in the script for the ad page)
window.addEventListener('load', function() {
    const adStartTime = sessionStorage.getItem('adStartTime');
    if (adStartTime && adLinks.some(link => window.location.href.includes(new URL(link).hostname))) {
        let timeLeft = 5;
        const countdown = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                const elapsedTime = (Date.now() - parseInt(adStartTime)) / 1000;
                if (elapsedTime >= 5) {
                    sessionStorage.setItem('adWatched', 'true');
                    const returnUrl = sessionStorage.getItem('returnUrl');
                    const adType = sessionStorage.getItem('adType');
                    const redirectAfterAd = sessionStorage.getItem('redirectAfterAd');
                    if (adType === 'video' && returnUrl) {
                        window.location.href = returnUrl;
                    } else if ((adType === 'download' || adType === 'episode') && redirectAfterAd) {
                        window.location.href = redirectAfterAd;
                    }
                }
            }
        }, 1000);

        // Prevent back navigation from skipping the ad
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function() {
            window.history.pushState(null, null, window.location.href);
        });
    }
});

// Share Popup Toggle
function toggleSharePopup() {
    console.log('Toggling share popup'); // Debug
    let popup = document.querySelector('.share-popup');
    if (popup) {
        popup.classList.toggle('active');
    } else {
        console.log('Share popup not found');
    }
}

// Copy Link
function copyLink() {
    let linkInput = document.querySelector('.share-link input');
    if (linkInput) {
        linkInput.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    }
}

// Extract Gofile Link from Post Content
function extractGofileLink() {
    const postContent = document.querySelector('.episode-player')?.innerHTML || '';
    const gofileRegex = /https:\/\/gofile\.io\/d\/[a-zA-Z0-9]+/g;
    const match = postContent.match(gofileRegex);
    return match ? match[0] : null;
}

// Set Thumbnail on Homepage
function setThumbnails() {
    const dramaCards = document.querySelectorAll('.drama-card');
    dramaCards.forEach(card => {
        const postUrl = card.querySelector('a').getAttribute('href');
        fetch(postUrl)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const thumbnailUrlDiv = doc.querySelector('.thumbnail-url');
                if (thumbnailUrlDiv) {
                    const thumbnailUrl = thumbnailUrlDiv.textContent.trim();
                    const img = card.querySelector('img');
                    if (img && thumbnailUrl) {
                        img.src = thumbnailUrl;
                    }
                }
            })
            .catch(err => console.log('Error fetching post for thumbnail:', err));
    });
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const watchAdBtn = document.querySelector('.watch-ad-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const adNotice = document.querySelector('.ad-notice');

    // Check if ad was watched for video
    const adWatched = sessionStorage.getItem('adWatched');
    const returnUrl = sessionStorage.getItem('returnUrl');
    const adType = sessionStorage.getItem('adType');

    if (adWatched === 'true' && returnUrl && window.location.href === returnUrl) {
        if (adType === 'video' && adNotice) {
            adNotice.style.display = 'none';
        }
        sessionStorage.removeItem('adWatched');
        sessionStorage.removeItem('returnUrl');
        sessionStorage.removeItem('redirectAfterAd');
        sessionStorage.removeItem('adType');
        sessionStorage.removeItem('adStartTime');
    }

    // Watch Ad Button for Video
    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', function() {
            handleAdRedirect(window.location.href, 'video');
        });
    }

    // Download Button with Gofile Link
    if (downloadBtn) {
        const gofileLink = extractGofileLink();
        if (gofileLink) {
            downloadBtn.setAttribute('href', '#'); // Default to prevent direct click
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (adWatched === 'true') {
                    window.location.href = gofileLink;
                } else {
                    handleAdRedirect(gofileLink, 'download');
                }
            });
        } else {
            downloadBtn.style.display = 'none'; // Hide if no Gofile link found
        }
    }

    // Copy Link Button
    const copy
