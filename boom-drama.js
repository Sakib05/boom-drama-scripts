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

// Redirect Ad Logic for Download Button and Episodes
function handleRedirectAd(url) {
    const adUrl = getRandomAdLink();
    window.location.href = adUrl;
    setTimeout(() => {
        window.location.href = url;
    }, 5000);
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

// Redirect Ad Logic for Video Ad
function handleVideoAd() {
    sessionStorage.setItem('returnUrl', window.location.href);
    const adUrl = getRandomAdLink();
    window.location.href = adUrl;
    setTimeout(() => {
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) {
            window.location.href = returnUrl;
        }
    }, 5000);
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
    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', handleVideoAd);
    }

    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleRedirectAd('https://drive.google.com/sample');
        });
    }

    const copyLinkBtn = document.querySelector('.share-link button');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyLink);
    }

    const scrollToTopBtn = document.querySelector('.scroll-to-top');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    const episodeLinks = document.querySelectorAll('.episode-switcher a');
    if (episodeLinks) {
        episodeLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const url = this.getAttribute('href');
                handleRedirectAd(url);
            });
        });
    }

    // Check if ad was watched
    const returnUrl = sessionStorage.getItem('returnUrl');
    if (returnUrl && window.location.href === returnUrl) {
        const adNotice = document.querySelector('.ad-notice');
        if (adNotice) {
            adNotice.style.display = 'none';
        }
        sessionStorage.removeItem('returnUrl');
    }
});