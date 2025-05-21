// Configurações
const config = {
    dataUrl: 'data/extrato.json'
  };
  
  // Função para formatar valores monetários
  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  // Função para formatar porcentagem
  function formatPercentage(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return '--%';
    
    const formatted = num.toFixed(3);
    return `${num >= 0 ? '+' : ''}${formatted}%`;
  }
  
  // Função para criar elemento de variação
  function createVariationElement(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return document.createTextNode('--');
    
    const span = document.createElement('span');
    span.className = `variação ${num >= 0 ? 'up' : 'down'}`;
    
    const icon = document.createElement('i');
    icon.className = `fas fa-arrow-${num >= 0 ? 'up' : 'down'}`;
    
    span.appendChild(icon);
    span.appendChild(document.createTextNode(` ${Math.abs(num).toFixed(1)}%`));
    
    return span;
  }
  
  // Função para carregar e exibir os dados
  async function loadExtratoData() {
    try {
      const response = await fetch(`${config.dataUrl}?v=${Date.now()}`);
      const data = await response.json();
      
      // Preencher cabeçalho
      document.getElementById('headerInfo').innerHTML = `
        <h2>${data.division}</h2>
       
      `;
      
      // Disponibilidade
      document.getElementById('availability-general').textContent = `${data.registroA['availability_availability']} %`;
      const trendElement = document.getElementById('availability-trend');
      trendElement.textContent = formatPercentage(data.registroA['pct_change_availability_availability']);
      trendElement.className = `trend ${data.registroA['pct_change_availability_availability'] >= 0 ? 'up' : 'down'} main`;
      
      // Sistemas
      const systemsCount = document.getElementById('systems-count');
      systemsCount.textContent = data.registroA['availability_systems'];
      systemsCount.appendChild(createVariationElement(data.registroA['pct_change_availability_systems']));
      
      // Eventos
      const eventsCount = document.getElementById('events-count');
      eventsCount.textContent = data.registroA['availability_events'];
      eventsCount.appendChild(createVariationElement(data.registroA['pct_change_availability_events']));
      
      // Tempo Indisponível
      const unavailableTime = document.getElementById('unavailable-time');
      unavailableTime.textContent = `${data.registroA['availability_time']} min`;
      unavailableTime.appendChild(createVariationElement(data.registroA['pct_change_availability_time']));
      
      // IaaS - VMs
      const vmCount = document.getElementById('vm-count');
      vmCount.textContent = `VMs Ativas: ${data.registroA['vm_count']}`;
      vmCount.appendChild(createVariationElement(data.registroA['pct_change_vm_count']));
      
      document.getElementById('vm-vcpu').textContent = `vCPU: ${data.registroA['vm_vcpu']}`;
      document.getElementById('vm-vcpu').appendChild(createVariationElement(data.registroA['pct_change_vm_vcpu']));
      
      document.getElementById('vm-memory').textContent = `Memória: ${data.registroA['vm_memory']}`;
      document.getElementById('vm-memory').appendChild(createVariationElement(data.registroA['pct_change_vm_memory']));
      
      document.getElementById('vm-storage').textContent = `Storage: ${data.registroA['vm_storage']}`;
      document.getElementById('vm-storage').appendChild(createVariationElement(data.registroA['pct_change_vm_storage']));
      
      // IaaS - Kubernetes
      const podCount = document.getElementById('pod-count');
      podCount.textContent = `PODs: ${data.registroA['pod_pod']}`;
      podCount.appendChild(createVariationElement(data.registroA['pct_change_pod_pod']));
      
      document.getElementById('pod-vcpu').textContent = `vCPU: ${data.registroA['pod_vcpu']}`;
      document.getElementById('pod-vcpu').appendChild(createVariationElement(data.registroA['pct_change_pod_vcpu']));
      
      document.getElementById('pod-memory').textContent = `Memória: ${data.registroA['pod_memory']}`;
      document.getElementById('pod-memory').appendChild(createVariationElement(data.registroA['pct_change_pod_memory']));
      
      // Bancos de Dados - Oracle
      const oracleBases = document.getElementById('oracle-bases');
      oracleBases.textContent = `Bases: ${data.registroA['oracle.bases']}`;
      oracleBases.appendChild(createVariationElement(data.registroA['pct_change_oracle_bases']));
      
      document.getElementById('oracle-vcpu').textContent = `vCPU: ${data.registroA['oracle_vcpu']}`;
      document.getElementById('oracle-vcpu').appendChild(createVariationElement(data.registroA['pct_change_oracle_vcpu']));
      
      document.getElementById('oracle-memory').textContent = `Memória: ${data.registroA['oracle_memory']}`;
      document.getElementById('oracle-memory').appendChild(createVariationElement(data.registroA['pct_change_oracle_memory']));
      
      document.getElementById('oracle-storage').textContent = `Storage: ${data.registroA['oracle_storage']}`;
      document.getElementById('oracle-storage').appendChild(createVariationElement(data.registroA['pct_change_oracle_storage']));
      
      // Bancos de Dados - MSSQL
      const mssqlBases = document.getElementById('mssql-bases');
      mssqlBases.textContent = `Bases: ${data.registroA['mssql_bases']}`;
      mssqlBases.appendChild(createVariationElement(data.registroA['pct_change_mssql_bases']));
      
      document.getElementById('mssql-vcpu').textContent = `vCPU: ${data.registroA['mssql_vcpu']}`;
      document.getElementById('mssql-vcpu').appendChild(createVariationElement(data.registroA['pct_change_mssql_vcpu']));
      
      document.getElementById('mssql-memory').textContent = `Memória: ${data.registroA['mssql_memory']}`;
      document.getElementById('mssql-memory').appendChild(createVariationElement(data.registroA['pct_change_mssql_memory']));
      
      document.getElementById('mssql-storage').textContent = `Storage: ${data.registroA['mssql_storage']}`;
      document.getElementById('mssql-storage').appendChild(createVariationElement(data.registroA['pct_change_mssql_storage']));
      
      // Bancos de Dados - MongoDB
      const mongodbBases = document.getElementById('mongodb-bases');
      mongodbBases.textContent = `Bases: ${data.registroA['mongodb_bases']}`;
      mongodbBases.appendChild(createVariationElement(data.registroA['pct_change_mongodb_bases']));
      
      document.getElementById('mongodb-vcpu').textContent = `vCPU: ${data.registroA['mongodb_vcpu']}`;
      document.getElementById('mongodb-vcpu').appendChild(createVariationElement(data.registroA['pct_change_mongodb_vcpu']));
      
      document.getElementById('mongodb-memory').textContent = `Memória: ${data.registroA['mongodb_memory']}`;
      document.getElementById('mongodb-memory').appendChild(createVariationElement(data.registroA['pct_change_mongodb_memory']));
      
      document.getElementById('mongodb-storage').textContent = `Storage: ${data.registroA['mongodb_storage']}`;
      document.getElementById('mongodb-storage').appendChild(createVariationElement(data.registroA['pct_change_mongodb_storage']));
      
      // Projetos
      document.getElementById('project-done').textContent = data.registroA['project_done'];
      document.getElementById('project-done-investment').textContent = formatCurrency(data.registroA['project_done_investment']);
      
      document.getElementById('project-going').textContent = data.registroA['project_going'];
      document.getElementById('project-going-investment').textContent = formatCurrency(data.registroA['project_going_investment']);
      
      document.getElementById('project-new-study').textContent = data.registroA['project_new_study'];
      document.getElementById('project-new-study-investment').textContent = formatCurrency(data.registroA['project_new_study_investment']);
      
      document.getElementById('project-paused').textContent = data.registroA['project_paused'];
      document.getElementById('project-paused-investment').textContent = formatCurrency(data.registroA['project_paused._investment']);
      
    } catch (error) {
      console.error('Erro ao carregar dados do extrato:', error);
      alert('Erro ao carregar os dados. Por favor, tente novamente mais tarde.');
    }
  }
  
  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    loadExtratoData();
  });