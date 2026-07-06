if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('¡Modo sin internet activado!', reg))
            .catch(err => console.error('Error offline', err));
    });
}
let puntosGrafico = JSON.parse(localStorage.getItem('lsv_puntos')) || [100, 110, 105, 120, 125, 130, 135];
let precisionActual = localStorage.getItem('lsv_precision') || "94.2";
let rendimientoActual = localStorage.getItem('lsv_rendimiento') || "135";
let nombreUsuario = localStorage.getItem('lsv_nombre_usuario') || "Usuario";
let inicialesUsuario = localStorage.getItem('lsv_iniciales_usuario') || "LS";
const etiquetasGrafico = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];

window.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('val-precision')) document.getElementById('val-precision').innerText = precisionActual + (precisionActual.includes('%') ? '' : '%');
    if(document.getElementById('val-rendimiento')) document.getElementById('val-rendimiento').innerText = rendimientoActual + (rendimientoActual.toUpperCase().includes('M') ? '' : 'M');
    if(document.getElementById('input-precision')) document.getElementById('input-precision').value = parseFloat(precisionActual);
    if(document.getElementById('input-grafico')) document.getElementById('input-grafico').value = rendimientoActual.replace('M', '');
    actualizarPantallaPerfil();
});
function actualizarPantallaPerfil() {
    if(document.getElementById('lbl-saludo-perfil')) document.getElementById('lbl-saludo-perfil').innerText = nombreUsuario;
    if(document.getElementById('avatar-preview')) document.getElementById('avatar-preview').innerText = inicialesUsuario;
    if(document.getElementById('input-nombre-perfil')) document.getElementById('input-nombre-perfil').value = nombreUsuario;
    if(document.getElementById('input-iniciales-perfil')) document.getElementById('input-iniciales-perfil').value = inicialesUsuario;
}
function reproducirSonidoExito() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctxAudio = new AudioContext();
        const oscilador = ctxAudio.createOscillator();
        const ganancia = ctxAudio.createGain();
        oscilador.type = 'sine';
        oscilador.frequency.setValueAtTime(523.25, ctxAudio.currentTime);
        oscilador.frequency.exponentialRampToValueAtTime(880, ctxAudio.currentTime + 0.15);
        ganancia.gain.setValueAtTime(0.1, ctxAudio.currentTime);
        ganancia.gain.exponentialRampToValueAtTime(0.01, ctxAudio.currentTime + 0.3);
        oscilador.connect(ganancia);
        ganancia.connect(ctxAudio.destination);
        oscilador.start();
        oscilador.stop(ctxAudio.currentTime + 0.3);
    } catch(e) { console.log("Audio bloqueado temporalmente."); }
}

window.addEventListener('load', () => {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hidden');
            reproducirSonidoExito();
        }, 2000);
    }
});
function guardarPerfil() {
    const nuevoNombre = document.getElementById('input-nombre-perfil').value.trim();
    const nuevasIniciales = document.getElementById('input-iniciales-perfil').value.trim().toUpperCase();
    if(nuevoNombre === "" || nuevasIniciales === "") return;
    nombreUsuario = nuevoNombre; inicialesUsuario = nuevasIniciales;
    localStorage.setItem('lsv_nombre_usuario', nombreUsuario);
    localStorage.setItem('lsv_iniciales_usuario', inicialesUsuario);
    actualizarPantallaPerfil();
    reproducirSonidoExito();
    alert('¡Perfil actualizado!');
}
function inicializarGrafico() {
    const canvas = document.getElementById('graficoVision'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 30; const anchoGrafico = canvas.width - padding * 2; const altoGrafico = canvas.height - padding * 2;
    
    ctx.strokeStyle = '#222222'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (altoGrafico / 4) * i;
        ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(canvas.width - padding, y); ctx.stroke();
    }
    ctx.strokeStyle = '#00E6FF'; ctx.lineWidth = 3; ctx.shadowBlur = 8; ctx.shadowColor = '#00E6FF';
    ctx.beginPath();
    const pasoX = anchoGrafico / (puntosGrafico.length - 1);
    puntosGrafico.forEach((punto, index) => {
        const x = padding + index * pasoX; const y = canvas.height - padding - (punto / 200) * altoGrafico;
        if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke(); ctx.shadowBlur = 0;
    
    puntosGrafico.forEach((punto, index) => {
        const x = padding + index * pasoX; const y = canvas.height - padding - (punto / 200) * altoGrafico;
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#AAAAAA'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(etiquetasGrafico[index], x, canvas.height - 10);
    });
}
function actualizarDatosAplicación() {
    const nuevaPrecision = document.getElementById('input-precision').value;
    const nuevoValorGrafico = document.getElementById('input-grafico').value;
    document.getElementById('val-precision').innerText = nuevaPrecision + '%';
    document.getElementById('val-rendimiento').innerText = nuevoValorGrafico + 'M';
    puntosGrafico[puntosGrafico.length - 1] = Number(nuevoValorGrafico);
    localStorage.setItem('lsv_puntos', JSON.stringify(puntosGrafico));
    localStorage.setItem('lsv_precision', nuevaPrecision);
    localStorage.setItem('lsv_rendimiento', nuevoValorGrafico);
    inicializarGrafico(); reproducirSonidoExito();
    alert('¡Datos guardados!');
}
function cambiarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('onclick').includes(tabId)) button.classList.add('active');
    });
    if (tabId === 'sec-datos') setTimeout(inicializarGrafico, 50);
}
function activarNav(element, tabId) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(section => section.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if (tabId === 'sec-datos') setTimeout(inicializarGrafico, 50);
}