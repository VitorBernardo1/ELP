import * as THREE from 'three';
import { timelineData } from './data.js';

// --- ELEMENTOS DO DOM ---
// Container principal da linha do tempo
const timelineContainer = document.querySelector('.timeline-section'); 
// Canvas que está DENTRO do container
const canvas = document.getElementById('bg'); 
const knowledgeSelect = document.getElementById('knowledge-select');
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoYear = document.getElementById('info-year');
const infoDescription = document.getElementById('info-description');
const closeBtn = document.getElementById('close-btn');

// --- SETUP BÁSICO DA CENA ---
const scene = new THREE.Scene();
// MODIFICADO: Aspect ratio baseado no container
const camera = new THREE.PerspectiveCamera(75, timelineContainer.clientWidth / timelineContainer.clientHeight, 0.1, 1000); 
const renderer = new THREE.WebGLRenderer({ canvas: canvas }); // Usando o canvas existente

// MODIFICADO: Tamanho do renderer baseado no container
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(timelineContainer.clientWidth, timelineContainer.clientHeight);

camera.position.set(2, 0, 5);

// --- ILUMINAÇÃO, EIXO, GRUPO E FUNÇÕES AUXILIARES ---
// (Nenhuma mudança aqui, o código é o mesmo de antes)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(ambientLight, pointLight);
const timelineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1000, 12);
const timelineMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const timelineAxis = new THREE.Mesh(timelineGeometry, timelineMaterial);
timelineAxis.rotation.x = Math.PI / 2;
scene.add(timelineAxis);
let eventsGroup = new THREE.Group();
scene.add(eventsGroup);
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
// ... (função createTextSprite também permanece a mesma) ...
function createTextSprite(message, parameters) {
    const fontface = parameters.fontface || 'Arial'; const fontsize = parameters.fontsize || 18; const textColor = parameters.textColor || { r: 255, g: 255, b: 255, a: 1.0 }; const canvas = document.createElement('canvas'); const context = canvas.getContext('2d'); context.font = `Bold ${fontsize}px ${fontface}`; const metrics = context.measureText(message); canvas.width = metrics.width; canvas.height = fontsize; context.font = `Bold ${fontsize}px ${fontface}`; context.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${textColor.a})`; context.fillText(message, 0, fontsize * 0.8); const texture = new THREE.Texture(canvas); texture.needsUpdate = true; const spriteMaterial = new THREE.SpriteMaterial({ map: texture }); const sprite = new THREE.Sprite(spriteMaterial); sprite.scale.set(canvas.width / 50, canvas.height / 50, 1.0); return sprite;
}

// --- LÓGICA DA LINHA DO TEMPO (sem alterações) ---
let cameraTargetZ = 5;
function generateTimeline(category) { /* ... (código igual ao anterior) ... */ 
    eventsGroup.children.forEach(child => child.geometry.dispose()); eventsGroup.clear(); const data = timelineData[category].sort((a, b) => a.year - b.year); if (!data || data.length === 0) return; const years = data.map(e => e.year); const minYear = Math.min(...years); const maxYear = Math.max(...years); const zStart = 0; const zEnd = -200; data.forEach((event, index) => { const zPos = mapRange(event.year, minYear, maxYear, zStart, zEnd); const geometry = new THREE.SphereGeometry(0.3, 24, 24); const material = new THREE.MeshStandardMaterial({ color: 0xc0392b }); const sphere = new THREE.Mesh(geometry, material); const yPos = index % 2 === 0 ? 1 : -1; sphere.position.set(0, yPos, zPos); sphere.userData = event; const textSprite = createTextSprite(`${event.year} - ${event.title}`, { fontsize: 24 }); textSprite.position.set(0, yPos + 0.5, zPos); eventsGroup.add(sphere); eventsGroup.add(textSprite); });
}

// --- INTERAÇÃO (MODIFICADA) ---
function onWheel(event) {
    event.preventDefault(); // Impede a página inteira de rolar
    cameraTargetZ -= event.deltaY * 0.01;
    cameraTargetZ = Math.max(-205, Math.min(10, cameraTargetZ));
}
// MODIFICADO: Event listener aplicado APENAS no canvas
canvas.addEventListener('wheel', onWheel);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
    // MODIFICADO: Calcula a posição do mouse relativa ao canvas, não à janela
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(eventsGroup.children);

    if (intersects.length > 0 && intersects[0].object.type === 'Mesh') {
        const eventData = intersects[0].object.userData;
        infoTitle.textContent = eventData.title;
        infoYear.textContent = `Ano: ${eventData.year}`;
        infoDescription.textContent = eventData.description;
        infoPanel.classList.remove('hidden');
    }
}
// MODIFICADO: Event listener aplicado APENAS no canvas
canvas.addEventListener('click', onClick);

closeBtn.addEventListener('click', () => infoPanel.classList.add('hidden'));

knowledgeSelect.addEventListener('change', (event) => {
    generateTimeline(event.target.value);
    camera.position.z = 5;
    cameraTargetZ = 5;
});

// --- RESPONSIVIDADE ---
window.addEventListener('resize', () => {
    // Atualiza o aspect ratio da câmera
    camera.aspect = timelineContainer.clientWidth / timelineContainer.clientHeight;
    camera.updateProjectionMatrix();
    // Atualiza o tamanho do renderer
    renderer.setSize(timelineContainer.clientWidth, timelineContainer.clientHeight);
});

// --- LOOP DE ANIMAÇÃO (sem alterações) ---
function animate() { /* ... (código igual ao anterior) ... */ 
    requestAnimationFrame(animate); camera.position.z += (cameraTargetZ - camera.position.z) * 0.05; eventsGroup.children.forEach(child => { if (child.type === 'Mesh') { child.rotation.y += 0.005; } }); renderer.render(scene, camera);
}

// --- INICIALIZAÇÃO ---
generateTimeline(knowledgeSelect.value);
animate();