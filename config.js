
// Configuration variables
const VIDEO_URL = "https://example.com/promo-video.mp4"; // Replace with actual video URL
const CONTACT_URL = "https://example.com/contact"; // Replace with actual contact URL
const QRIS_URL = "https://example.com/qris-image.jpg"; // Replace with actual QRIS image URL

// Pricing
const PRICE_1H = 50000;
const PRICE_7H = 30000;
const MIN_TOPUP = 100000;

// Game list
const GAMES = [
    { id: 'freefire', name: 'Free Fire', icon: 'box' },
    { id: 'ml', name: 'Mobile Legends', icon: 'smartphone' },
    { id: 'cod', name: 'Call of Duty', icon: 'crosshair' },
    { id: 'pubg', name: 'PUBG', icon: 'target' },
    { id: 'honor', name: 'Honor of Kings', icon: 'award' },
    { id: 'roblox', name: 'Roblox', icon: 'square' },
    { id: 'delta', name: 'Delta Force', icon: 'shield' },
    { id: 'efootball', name: 'eFootball', icon: 'flag' },
    { id: 'bloodstrike', name: 'Blood Strike', icon: 'droplet' },
    { id: 'arena', name: 'Arena Breakout', icon: 'map' },
    { id: 'hotel', name: 'Hotel Hideaway', icon: 'home' },
    { id: 'amongus', name: 'Among Us', icon: 'user' }
];

// Login methods
const LOGIN_METHODS = [
    { id: 'google', name: 'Google', icon: 'mail' },
    { id: 'facebook', name: 'Facebook', icon: 'facebook' },
    { id: 'garena', name: 'Garena', icon: 'globe' },
    { id: 'konami', name: 'Konami', icon: 'compass' },
    { id: 'infinite', name: 'Infinite', icon: 'infinity' },
    { id: 'twitter', name: 'Twitter', icon: 'twitter' },
    { id: 'moonton', name: 'Moonton', icon: 'moon' },
    { id: 'apple', name: 'Apple', icon: 'apple' }
];
