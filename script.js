const firebaseConfig = {
    apiKey: "AIzaSyDgLYZLFCF8yiQ-58Z1wmMC-MczxwyItw0",
    authDomain: "m-legacy-5cf2b.firebaseapp.com",
    databaseURL: "https://m-legacy-5cf2b-default-rtdb.firebaseio.com",
    projectId: "m-legacy-5cf2b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const cv = document.getElementById('mainCanvas');
const ctx = cv.getContext('2d');
const mover = document.getElementById('mover');
const viewport = document.getElementById('viewport');

const blockW = 60, blockH = 40, cols = 100, rows = 200; 
cv.width = cols * blockW; cv.height = rows * blockH;

let scale = 0.1, pX = 0, pY = 0, isDown = false, startX, startY, pixels = {};

function render() {
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.strokeStyle = "#ccc"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= cols; i++) { ctx.beginPath(); ctx.moveTo(i * blockW, 0); ctx.lineTo(i * blockW, cv.height); ctx.stroke(); }
    for (let j = 0; j <= rows; j++) { ctx.beginPath(); ctx.moveTo(0, j * blockH); ctx.lineTo(cv.width, j * blockH); ctx.stroke(); }

    Object.values(pixels).forEach(p => {
        if (p.imageUrl) {
            const img = new Image(); img.crossOrigin = "anonymous"; img.src = p.imageUrl;
            img.onload = () => { ctx.drawImage(img, p.x, p.y, blockW, blockH); };
        }
    });
}

function updateUI() { mover.style.transform = `translate(${pX}px, ${pY}px) scale(${scale})`; }

function searchPlot() {
    const id = parseInt(document.getElementById('searchInput').value);
    if (id < 1 || id > 20000 || isNaN(id)) return alert("Plot ID range: 1-20000");
    const row = Math.floor((id - 1) / cols), col = (id - 1) % cols;
    const tX = col * blockW, tY = row * blockH;
    scale = 1.2;
    pX = (viewport.clientWidth / 2) - (tX * scale) - (blockW * scale / 2);
    pY = (viewport.clientHeight / 2) - (tY * scale) - (blockH * scale / 2);
    updateUI();
}

viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(scale * (e.deltaY > 0 ? 0.9 : 1.1), 0.03), 5);
    updateUI();
}, { passive: false });

viewport.onmousedown = (e) => { isDown = true; startX = e.clientX - pX; startY = e.clientY - pY; };
window.onmouseup = () => { isDown = false; };
window.onmousemove = (e) => { if (isDown) { pX = e.clientX - startX; pY = e.clientY - startY; updateUI(); } };

function copyVal(v) { navigator.clipboard.writeText(v).then(() => alert("Copied!")); }

db.ref('pixels').on('value', s => {
    pixels = s.val() || {};
    document.getElementById('sold-count').innerText = Object.keys(pixels).length;
    document.getElementById('rem-count').innerText = 20000 - Object.keys(pixels).length;
    render();
});
updateUI();
