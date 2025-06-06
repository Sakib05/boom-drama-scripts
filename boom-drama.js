// Debug to confirm script is loading
console.log('Script loaded successfully at ' + new Date().toLocaleString());

// Multiple Ad Links
const adLinks = [
    'https://google.com',
    'https://alibaba.com',
    'https://trickbd.com',
    'https://example.com/ad4'
];

// Function to get a random ad link
function getRandomAdLink() {
    console.log('Getting random ad link...');
    const now = Date.now();
    const oneDayInMs = 24 * 60 * 60 * 1000;
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
    console.log('Selected ad:', selectedAd.link);
    return selectedAd.link;
}

// Redirect Ad Logic
function handleAdRedirect(url, type) {
    console.log('Handling ad redirect for:', url, 'Type:', type);
    localStorage.setItem('returnUrl', window.location.href);
    localStorage.setItem('redirectAfterAd', url);
    localStorage.setItem('adType', type);
    localStorage.setItem('adStartTime', Date.now().toString());
    console.log('Stored in localStorage:', {
        returnUrl: localStorage.getItem('returnUrl'),
        redirectAfterAd: localStorage.getItem('redirectAfterAd'),
        adType: localStorage.getItem('adType'),
        adStartTime: localStorage.getItem('adStartTime')
    });
    const adUrl = getRandomAdLink();
    console.log('Redirecting to ad:', adUrl);
    window.location.href = adUrl;
}

// Ad Page Countdown Logic
window.addEventListener('load', function() {
    const adStartTime = localStorage.getItem('adStartTime');
    if (adStartTime && adLinks.some(link => {
        try {
            return window.location.href.includes(new URL(link).hostname);
        } catch (e) {
            console.error('Invalid ad link:', link, e);
            return false;
        }
    })) {
        console.log('On ad page, starting countdown...');
        let timeLeft = 5;
        const countdown = setInterval(() => {
            console.log('Time left:', timeLeft);
            timeLeft--;
            if (timeLeft <= 0) {
                clearInterval(countdown);
                const elapsedTime = (Date.now() - parseInt(adStartTime)) / 1000;
                console.log('Elapsed time:', elapsedTime, 'seconds');
                if (elapsedTime >= 5) {
                    localStorage.setItem('adWatched', 'true');
                    console.log('Ad watched, redirecting back...');
                    const returnUrl = localStorage.getItem('returnUrl');
                    if (returnUrl) {
                        console.log('Returning to:', returnUrl);
                        window.location.href = returnUrl;
                    } else {
                        console.log('No return URL found');
                    }
                } else {
                    console.log('Elapsed time less than 5 seconds, ad not counted as watched');
                }
            }
        }, 1000);

        window.history.pushState(null, null, window.location.href);
        window.addEventListener('popstate', function() {
            window.history.pushState(null, null, window.location.href);
        });
    }
});

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing event listeners...');
    setTimeout(() => {
        const watchAdBtn = document.querySelector('.watch-ad-btn');
        const downloadBtn = document.querySelector('.download-btn');
        const adNotice = document.querySelector('.ad-notice');

        const episodeDownloadLinkElement = document.querySelector('.episode-download-link');
        if (!episodeDownloadLinkElement) {
            console.error('No episode download link element found in the post');
            return;
        }
        const episodeDownloadLink = episodeDownloadLinkElement.getAttribute('href');
        if (!episodeDownloadLink) {
            console.error('No episode download link href found');
            return;
        }
        console.log('Episode Download Link:', episodeDownloadLink);

        console.log('Initial localStorage check:', {
            adWatched: localStorage.getItem('adWatched'),
            returnUrl: localStorage.getItem('returnUrl'),
            redirectAfterAd: localStorage.getItem('redirectAfterAd'),
            adType: localStorage.getItem('adType')
        });

        const adWatched = localStorage.getItem('adWatched');
        const returnUrl = localStorage.getItem('returnUrl');
        const adType = localStorage.getItem('adType');

        if (adWatched === 'true' && returnUrl && window.location.href === returnUrl) {
            console.log('Ad watched, processing redirect...');
            if (adType === 'video' && adNotice) {
                adNotice.style.display = 'none';
            } else if (adType === 'download') {
                const redirectUrl = localStorage.getItem('redirectAfterAd');
                console.log('Redirecting to:', redirectUrl);
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    console.error('No redirect URL found in localStorage');
                }
            }
            localStorage.removeItem('adWatched');
            localStorage.removeItem('returnUrl');
            localStorage.removeItem('redirectAfterAd');
            localStorage.removeItem('adType');
            localStorage.removeItem('adStartTime');
        }

        if (watchAdBtn) {
            watchAdBtn.addEventListener('click', function() {
                handleAdRedirect(window.location.href, 'video');
            });
        }

        if (downloadBtn) {
            downloadBtn.style.display = adWatched === 'true' && adType === 'download' ? 'inline-block' : 'none';
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Download button clicked, adWatched:', adWatched, 'adType:', adType);
                if (adWatched === 'true' && adType === 'download') {
                    console.log('Ad already watched, redirecting to:', episodeDownloadLink);
                    window.location.href = episodeDownloadLink;
                } else {
                    handleAdRedirect(episodeDownloadLink, 'download');
                }
            });
        }
    }, 1000); // Delay to ensure DOM is fully loaded
});
