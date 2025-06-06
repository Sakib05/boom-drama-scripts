// Debug to confirm script is loading
console.log('Script loaded successfully at ' + new Date().toLocaleString());

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
    return selectedAd.link;
}

// Redirect Ad Logic for Video Ad and Download
function handleAdRedirect(url, type) {
    console.log('Handling ad redirect for:', url, 'Type:', type);
    sessionStorage.setItem('returnUrl', window.location.href);
    sessionStorage.setItem('redirectAfterAd', url);
    sessionStorage.setItem('adType', type);
    sessionStorage.setItem('adStartTime', Date.now().toString());
    console.log('Stored in sessionStorage:', {
        returnUrl: sessionStorage.getItem('returnUrl'),
        redirectAfterAd: sessionStorage.getItem('redirectAfterAd'),
        adType: sessionStorage.getItem('adType'),
        adStartTime: sessionStorage.getItem('adStartTime')
    });
    const adUrl = getRandomAdLink();
    console.log('Redirecting to ad:', adUrl);
    window.location.href = adUrl;
}

// Ad Page Countdown Logic
window.addEventListener('load', function() {
    const adStartTime = sessionStorage.getItem('adStartTime');
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
                    sessionStorage.setItem('adWatched', 'true');
                    console.log('Ad watched, redirecting back...');
                    const returnUrl = sessionStorage.getItem('returnUrl');
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
    const watchAdBtn = document.querySelector('.watch-ad-btn');
    const downloadBtn = document.querySelector('.download-btn');
    const adNotice = document.querySelector('.ad-notice');

    const episodeDownloadLinkElement = document.querySelector('.episode-download-link');
    const episodeDownloadLink = episodeDownloadLinkElement ? episodeDownloadLinkElement.getAttribute('href') : null;
    if (!episodeDownloadLink) {
        console.error('No episode download link found in the post');
        return;
    }
    console.log('Episode Download Link:', episodeDownloadLink);

    console.log('Initial sessionStorage check:', {
        adWatched: sessionStorage.getItem('adWatched'),
        returnUrl: sessionStorage.getItem('returnUrl'),
        redirectAfterAd: sessionStorage.getItem('redirectAfterAd'),
        adType: sessionStorage.getItem('adType')
    });

    const adWatched = sessionStorage.getItem('adWatched');
    const returnUrl = sessionStorage.getItem('returnUrl');
    const adType = sessionStorage.getItem('adType');

    if (adWatched === 'true' && returnUrl && window.location.href === returnUrl) {
        console.log('Ad watched, processing redirect...');
        if (adType === 'video' && adNotice) {
            adNotice.style.display = 'none';
        } else if (adType === 'download') {
            const redirectUrl = sessionStorage.getItem('redirectAfterAd');
            console.log('Redirecting to:', redirectUrl);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                console.error('No redirect URL found in sessionStorage, using fallback:', episodeDownloadLink);
                window.location.href = episodeDownloadLink;
            }
        }
        sessionStorage.clear();
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

    // ... (rest of the code for share popup, copy link, scroll to top, episode links remains the same)
});
