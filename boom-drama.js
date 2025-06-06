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

// Redirect Ad Logic for Video Ad and Download
function handleAdRedirect(url, type) {
    sessionStorage.setItem('returnUrl', window.location.href);
    sessionStorage.setItem('redirectAfterAd', url);
    sessionStorage.setItem('adType', type); // 'video' or 'download'
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
                    if (returnUrl) {
                        window.location.href = returnUrl;
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

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const watchAdBtn = document.querySelector('.watch-ad-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const adNotice = document.querySelector('.ad-notice');

    // Get the episode download link from the post
    const episodeDownloadLinkElement = document.querySelector('.episode-download-link');
    const episodeDownloadLink = episodeDownloadLinkElement ? episodeDownloadLinkElement.getAttribute('href') : 'https://drive.google.com/sample';

    // Check if ad was watched for video
    const adWatched = sessionStorage.getItem('adWatched');
    const returnUrl = sessionStorage.getItem('returnUrl');
    const adType = sessionStorage.getItem('adType');

    if (adWatched === 'true' && returnUrl && window.location.href === returnUrl) {
        if (adType === 'video' && adNotice) {
            adNotice.style.display = 'none';
        } else if (adType === 'download') {
            const redirectUrl = sessionStorage.getItem('redirectAfterAd');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
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
        downloadBtn.style.display = adWatched === 'true' && adType === 'download' ? 'inline-block' : 'none';
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (adWatched === 'true' && adType === 'download') {
                window.location.href = episodeDownloadLink; // Use the link from the post
            } else {
                handleAdRedirect(episodeDownloadLink, 'download'); // Use the link from the post
            }
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
                handleAdRedirect(url, 'video');
            });
        });
    }
});
