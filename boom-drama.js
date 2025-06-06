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
    'https://trickbd.com',
    'https://alibaba.com.com',
    'https://google.com',
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

// Function to show countdown overlay
function showCountdownOverlay(url, type) {
    const overlay = document.createElement('div');
    overlay.id = 'adCountdownOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.color = '#fff';
    overlay.style.fontSize = '24px';
    overlay.style.fontFamily = 'Arial, sans-serif';

    const countdownText = document.createElement('div');
    countdownText.id = 'countdownText';
    countdownText.textContent = '5';
    overlay.appendChild(countdownText);

    document.body.appendChild(overlay);

    let timeLeft = 5;
    const countdown = setInterval(() => {
        timeLeft--;
        countdownText.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            document.body.removeChild(overlay);
            sessionStorage.setItem('adWatched', 'true');
            const returnUrl = sessionStorage.getItem('returnUrl');
            const redirectAfterAd = sessionStorage.getItem('redirectAfterAd');
            const adType = sessionStorage.getItem('adType');
            if (adType === 'video' && returnUrl) {
                window.location.href = returnUrl;
            } else if ((adType === 'download' || adType === 'episode') && redirectAfterAd) {
                window.location.href = redirectAfterAd;
            }
        }
    }, 1000);

    // Prevent back navigation during countdown
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', function() {
        window.history.pushState(null, null, window.location.href);
    });
}

// Redirect Ad Logic for Video Ad, Download, and Episode Switch
function handleAdRedirect(url, type) {
    sessionStorage.setItem('returnUrl', window.location.href);
    sessionStorage.setItem('redirectAfterAd', url);
    sessionStorage.setItem('adType', type); // 'video', 'download', or 'episode'
    sessionStorage.setItem('adStartTime', Date.now().toString());
    showCountdownOverlay(url, type);
}

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

    // Download Button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const url = 'https://gofile.io/sample'; // Replace with your Gofile download link
            handleAdRedirect(url, 'download');
        });
    }

    // Copy Link Button
    const copyLinkBtn = document.querySelector('.share-link button');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyLink);
    }

    // Scroll to Top Button
    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    // Episode Links
    const episodeLinks = document.querySelectorAll('.episode-switcher a');
    if (episodeLinks) {
        episodeLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href');
                handleAdRedirect(url, 'episode');
            });
        });
    }
});
