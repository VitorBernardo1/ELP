import { timelineData } from './data.js';

const knowledgeSelect = document.getElementById('knowledge-select-linear');
const timelineEventsContainer = document.getElementById('timeline-events');

// Função para mapear categorias a ícones Font Awesome (opcional, mas legal!)
const categoryIcons = {
    astronomia: 'fas fa-star',
    computacao: 'fas fa-laptop-code',
    fisica: 'fas fa-atom'
};

function generateTimelineEvents(category) {
    // Limpa os eventos existentes
    timelineEventsContainer.innerHTML = '';

    const data = timelineData[category].sort((a, b) => a.year - b.year);

    if (!data || data.length === 0) {
        timelineEventsContainer.innerHTML = '<p>Nenhum evento encontrado para esta categoria.</p>';
        return;
    }

    data.forEach((event, index) => {
        const eventElement = document.createElement('div');
        eventElement.classList.add('timeline-event');

        // Alterna entre cima e baixo para o conteúdo
        const contentPositionClass = index % 2 === 0 ? 'timeline-content-top' : 'timeline-content-bottom';

        eventElement.innerHTML = `
            <div class="timeline-point"></div>
            <div class="timeline-year">${event.year}</div>
            <div class="timeline-content ${contentPositionClass}">
                <i class="${categoryIcons[category] || 'fas fa-info-circle'}"></i>
                <h3>${event.title}</h3>
                <p>${event.description}</p>
            </div>
        `;
        
        timelineEventsContainer.appendChild(eventElement);
    });
}

// Event listener para a seleção de campo de conhecimento
knowledgeSelect.addEventListener('change', (event) => {
    generateTimelineEvents(event.target.value);
});

// Gera a linha do tempo inicial ao carregar a página
generateTimelineEvents(knowledgeSelect.value);
