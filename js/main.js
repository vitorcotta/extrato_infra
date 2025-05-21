// Configurações globais
const config = {
    startDate: new Date('2025-01-01T00:00:00'), // Data base para cálculo da disponibilidade
    availabilityThreshold: 99.9,
    dataUrls: {
      statusData: 'data/data.json',
      timelineData: 'data/timeline2.json',
      eventsData: 'data/events.json',
      projetosData: 'data/projetos.json',
      monthlyData: 'data/dispm2m.json'
    }
  };
  
  // Utilitários
  const utils = {
    convertExcelDate: (dateString) => {
      if (!dateString) return null;
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      return new Date(year, month - 1, day, hours, minutes, seconds);
    },
  
    formatDate: (date) => {
      if (!date) return 'N/A';
      return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    },
  
    calculateDuration: (start, end) => {
      if (!start || !end) return 'Em andamento';
      const durationMs = end - start;
      const hours = Math.floor(durationMs / (1000 * 60 * 60));
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}min`;
    },
  
    getStatusIcon: (statusClass) => {
      switch (statusClass) {
        case 'ok': return 'icon/check.png';
        case 'degradado': return 'icon/caution.png';
        case 'indisponivel': return 'icon/alert.png';
        case 'informacao': return 'icon/information.png';
        default: return 'icon/default.png';
      }
    },
  
    calculateTotalTime: (events, type) => {
      let totalTime = 0;
      events.forEach(event => {
        if (event.Tipo === type) {
          const inicio = utils.convertExcelDate(event.Inicio);
          const contorno = event.Contorno ? utils.convertExcelDate(event.Contorno) : new Date();
          const fim = event.Fim ? utils.convertExcelDate(event.Fim) : new Date();
  
          if (contorno < fim) {
            totalTime += (contorno - inicio);
          } else {
            totalTime += (fim - inicio);
          }
        }
      });
      return Math.round(totalTime / (1000 * 60)); // Retorna em minutos
    },
  
    calculateAvailability: (events, startDate = config.startDate) => {
      const totalTime = new Date() - startDate;
      let unavailableTime = 0;
  
      events.forEach(event => {
        if (event.Tipo === 'INDISPONÍVEL' || event.Tipo === 'DEGRADADO') {
          const inicio = utils.convertExcelDate(event.Inicio);
          const fim = event.Fim ? utils.convertExcelDate(event.Fim) : new Date();
          const contorno = event.Contorno ? utils.convertExcelDate(event.Contorno) : new Date();
          if (contorno < fim) {
            unavailableTime += (contorno - inicio);
          } else {
            unavailableTime += (fim - inicio);
          }
        }
      });
  
      const availability = ((totalTime - unavailableTime) / totalTime) * 100;
      return availability.toFixed(2);
    }
  };
  
  // Funções para a página index.html (Status dos Sistemas)
  const statusPage = {
    init: async () => {
      await statusPage.loadData();
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('#statusTable th').forEach((th, index) => {
          th.addEventListener('click', () => statusPage.sortTable(index));
        });
      });
    },
  
    loadData: async () => {
      try {
        const [data, timelines, events] = await Promise.all([
          fetch(`${config.dataUrls.statusData}?v=${Date.now()}`).then(res => res.json()),
          fetch(`${config.dataUrls.timelineData}?v=${Date.now()}`).then(res => res.json()),
          fetch(`${config.dataUrls.eventsData}?v=${Date.now()}`).then(res => res.json())
        ]);
  
        const tableBody = document.getElementById('statusTable');
        tableBody.innerHTML = '';
  
        data.forEach((item, index) => {
          const row = document.createElement('tr');
          let statusText = 'OK';
          let statusClass = 'ok';
  
          if (item.incidente) {
            if (item.tipo === 'INDISPONÍVEL') {
              statusText = 'Indisponível';
              statusClass = 'indisponivel';
            } else if (item.tipo === 'DEGRADADO') {
              statusText = 'Degradado';
              statusClass = 'degradado';
            } else if (item.tipo === 'INFORMAÇÃO') {
              statusText = 'Informação';
              statusClass = 'informacao';
            }
  
            if (item.status === "Contornado") {
              statusText = `Contornado (${utils.formatDate(new Date(item.Contorno))})`;
            }
          }
  
          const sistemaEvents = events.filter(event => event.Sistema === item.sistema);
          const incidentCount = sistemaEvents.length;
          const unavailableTime = utils.calculateTotalTime(sistemaEvents, 'INDISPONÍVEL');
          const degradedTime = utils.calculateTotalTime(sistemaEvents, 'DEGRADADO');
          const availability = utils.calculateAvailability(sistemaEvents);
  
          // Timeline Horizontal
          const timelineData = timelines[index]?.timeline || [];
          const timelineDiv = document.createElement('div');
          timelineDiv.classList.add('timeline-container');
  
          timelineData.forEach(block => {
            const div = document.createElement('div');
            div.classList.add('timeline-block', block);
            timelineDiv.appendChild(div);
          });
  
          row.innerHTML = `
            <td onclick="statusPage.showTimeline('${item.sistema}');sidebar.close('detailsSidebar')">${item.sistema}</td>
            <td style="text-align: center; vertical-align: middle;" onclick="statusPage.showTimeline('${item.sistema}');sidebar.close('detailsSidebar')">
              <img src="${utils.getStatusIcon(statusClass)}" alt="${statusClass}" style="width: 24px; height: 24px;">
            </td>
            <td onclick="statusPage.showTimeline('${item.sistema}');sidebar.close('detailsSidebar')">${incidentCount}</td>
            <td onclick="statusPage.showTimeline('${item.sistema}');sidebar.close('detailsSidebar')">${unavailableTime} min</td>
            <td onclick="statusPage.showTimeline('${item.sistema}');sidebar.close('detailsSidebar')">${degradedTime} min</td>
            <td onclick="statusPage.showTimeline('${item.sistema}');sidebar.close('detailsSidebar')">${availability}%</td>
          `;
          
          const timelineCell = document.createElement('td');
          timelineCell.appendChild(timelineDiv);
          row.appendChild(timelineCell);
          tableBody.appendChild(row);
        });
  
        statusPage.sortTable(0);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    },
  
    sortTable: (columnIndex) => {
      const table = document.getElementById('statusTable');
      const rows = Array.from(table.querySelectorAll('tr'));
  
      rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
  
        if (columnIndex === 2 || columnIndex === 3 || columnIndex === 4 || columnIndex === 5) {
          return parseFloat(aValue) - parseFloat(bValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      });
  
      table.innerHTML = '';
      rows.forEach(row => table.appendChild(row));
    },
  
    showTimeline: async (sistema) => {
      const timelineSidebar = document.getElementById('timelineSidebar');
      const timelineContent = document.getElementById('timelineContent');
      const timelineTitle = document.getElementById('timelineTitle');
  
      timelineTitle.textContent = `Timeline: ${sistema}`;
      timelineContent.innerHTML = '';
  
      try {
        const events = await fetch(`${config.dataUrls.eventsData}?v=${Date.now()}`).then(res => res.json());
        const filteredEvents = events.filter(event => event.Sistema === sistema);
  
        if (filteredEvents.length === 0) {
          timelineContent.innerHTML = '<li>Nenhum evento encontrado para este sistema.</li>';
        } else {
          filteredEvents.forEach(event => {
            const inicio = utils.convertExcelDate(event.Inicio);
            const fim = event.Fim ? utils.convertExcelDate(event.Fim) : null;
            const contorno = event.Contorno ? utils.convertExcelDate(event.Contorno) : null;
            const duration = utils.calculateDuration(inicio, contorno || fim);
  
            const item = document.createElement('li');
            item.classList.add(
              'timeline-item',
              event.Tipo === 'INDISPONÍVEL' ? 'critical' : 
              event.Tipo === 'DEGRADADO' ? 'warning' : 
              'information'
            );
            item.innerHTML = `
              <strong>Início:</strong> ${utils.formatDate(inicio)}<br>
              ${contorno ? `<strong>Contorno:</strong> ${utils.formatDate(contorno)}<br>` : ''}
              ${fim ? `<strong>Fim:</strong> ${utils.formatDate(fim)}<br>` : ''}
              <strong>Tempo:</strong> ${duration}<br>
            `;
            item.addEventListener('click', () => sidebar.showEventDetails(event));
            timelineContent.appendChild(item);
          });
        }
  
        sidebar.open('timelineSidebar');
      } catch (error) {
        console.error('Erro ao carregar timeline:', error);
        timelineContent.innerHTML = '<li>Erro ao carregar eventos.</li>';
      }
    }
  };
  
  // Funções para a página projetos.html
  const projetosPage = {
    init: async () => {
      await projetosPage.loadProjects();
    },
  
    loadProjects: async () => {
      const container = document.getElementById('projetosContainer');
      container.innerHTML = '';
  
      try {
        const response = await fetch(config.dataUrls.projetosData);
        if (!response.ok) throw new Error('Arquivo projetos.json não encontrado.');
  
        const projetos = await response.json();
        const porStatus = {};
  
        projetos.forEach(p => {
          if (!porStatus[p.status]) porStatus[p.status] = [];
          porStatus[p.status].push(p);
        });
  
        Object.entries(porStatus).forEach(([status, lista]) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `<h3><i class="fas fa-tasks icon"></i> ${status}</h3><div class="metrics"></div>`;
          const metrics = card.querySelector('.metrics');
  
          lista.forEach(proj => {
            const div = document.createElement('div');
            div.className = 'card-green resource-metric';
            div.innerHTML = `
              <h4>${proj.name}</h4>
              <p class="investment">Solicitante: ${proj.areaSolicitante}</p>
              <p class="investment">Investimento: R$ ${Number(proj.investimento || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            `;
            metrics.appendChild(div);
          });
  
          container.appendChild(card);
        });
      } catch (e) {
        console.error("Erro ao carregar projetos:", e);
        container.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${e.message}</p>`;
      }
    }
  };
  
  // Funções para a página mesames.html
  const monthlyPage = {
    init: async () => {
      await monthlyPage.loadData();
      monthlyPage.setupEventListeners();
    },
  
    loadData: async () => {
      try {
        const response = await fetch(config.dataUrls.monthlyData);
        const data = await response.json();
        const tbody = document.querySelector('#disponibilidadeTable tbody');
        tbody.innerHTML = '';
  
        data.forEach(item => {
          const row = document.createElement('tr');
          
          const getStatusClass = (value) => {
            if (!value) return '';
            const num = parseFloat(value);
            if (num >= config.availabilityThreshold) return 'ok';
            return 'indisponivel';
          };
  
          row.innerHTML = `
            <td class="sistema-cell" data-sistema="${item.sistema}">${item.sistema}</td>
            ${['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map(month => `
              <td class="${getStatusClass(item[month])}">
                ${item[month] || 'N/A'}${item[month] ? '%' : ''}
              </td>
            `).join('')}
          `;
  
          tbody.appendChild(row);
        });
      } catch (error) {
        console.error('Erro ao carregar dados mensais:', error);
      }
    },
  
    setupEventListeners: () => {
      // Adiciona clique nas células de sistema
      document.querySelectorAll('#disponibilidadeTable .sistema-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
          const sistema = e.target.getAttribute('data-sistema');
          monthlyPage.showTimeline(sistema);
        });
      });
    },
  
    showTimeline: async (sistema) => {
      const timelineSidebar = document.getElementById('timelineSidebar');
      const timelineContent = document.getElementById('timelineContent');
      const timelineTitle = document.getElementById('timelineTitle');
  
      timelineTitle.textContent = `Timeline: ${sistema}`;
      timelineContent.innerHTML = '';
  
      try {
        const events = await fetch(`${config.dataUrls.eventsData}?v=${Date.now()}`).then(res => res.json());
        const filteredEvents = events.filter(event => event.Sistema === sistema);
  
        if (filteredEvents.length === 0) {
          timelineContent.innerHTML = '<li>Nenhum evento encontrado para este sistema.</li>';
        } else {
          filteredEvents.forEach(event => {
            const inicio = utils.convertExcelDate(event.Inicio);
            const fim = event.Fim ? utils.convertExcelDate(event.Fim) : null;
            const contorno = event.Contorno ? utils.convertExcelDate(event.Contorno) : null;
            const duration = utils.calculateDuration(inicio, contorno || fim);
  
            const item = document.createElement('li');
            item.classList.add(
              'timeline-item',
              event.Tipo === 'INDISPONÍVEL' ? 'critical' : 
              event.Tipo === 'DEGRADADO' ? 'warning' : 
              'information'
            );
            item.innerHTML = `
              <strong>Início:</strong> ${utils.formatDate(inicio)}<br>
              ${contorno ? `<strong>Contorno:</strong> ${utils.formatDate(contorno)}<br>` : ''}
              ${fim ? `<strong>Fim:</strong> ${utils.formatDate(fim)}<br>` : ''}
              <strong>Tempo:</strong> ${duration}<br>
            `;
            item.addEventListener('click', () => sidebar.showEventDetails(event));
            timelineContent.appendChild(item);
          });
        }
  
        sidebar.open('timelineSidebar');
      } catch (error) {
        console.error('Erro ao carregar timeline:', error);
        timelineContent.innerHTML = '<li>Erro ao carregar eventos.</li>';
      }
    }
  };
  
  // Funções para os sidebars
  const sidebar = {
    open: (id) => {
      document.getElementById(id).classList.add('open');
    },
  
    close: (id) => {
      document.getElementById(id).classList.remove('open');
    },
  
    showEventDetails: (event) => {
      const eventDetails = document.getElementById('eventDetails');
      const inicio = utils.convertExcelDate(event.Inicio);
      const fim = event.Fim ? utils.convertExcelDate(event.Fim) : null;
      const contorno = event.Contorno ? utils.convertExcelDate(event.Contorno) : null;
  
      eventDetails.innerHTML = `
        <p><strong>Sistema:</strong> ${event.Sistema}</p>
        <p><strong>Tipo:</strong> ${event.Tipo}</p>
        <p><strong>Início:</strong> ${utils.formatDate(inicio)}</p>
        ${contorno ? `<p><strong>Contorno:</strong> ${utils.formatDate(contorno)}</p>` : ''}
        ${fim ? `<p><strong>Fim:</strong> ${utils.formatDate(fim)}</p>` : ''}
        <p><strong>Sintoma:</strong> ${event['Sintoma'] || 'N/A'}</p>
        <p><strong>Diagnóstico Inicial:</strong> ${event['Diagnóstico Inicial'] || 'N/A'}</p>
        <p><strong>Ação Contorno:</strong> ${event['Ação Contorno'] || 'N/A'}</p>
        <p><strong>Causa Raiz:</strong> ${event['Causa Raiz'] || 'N/A'}</p>
        <p><strong>Status:</strong> ${event.Status}</p>
      `;
  
      sidebar.open('detailsSidebar');
    }
  };
  
  // Inicialização da página apropriada
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('statusTable')) {
      statusPage.init();
    } else if (document.getElementById('projetosContainer')) {
      projetosPage.init();
    } else if (document.getElementById('disponibilidadeTable')) {
      monthlyPage.init();
    }
  });