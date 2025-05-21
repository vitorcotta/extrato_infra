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
    const registro = data[0].registroA; // Acessa o primeiro item do array e depois registroA
    
    // Preencher cabeçalho
    document.getElementById('headerInfo').innerHTML = `
      <h2>${registro.division}</h2>
      <h3>Mês: ${registro.month}</h3>
    `;
    
    // Disponibilidade
    document.getElementById('availability-general').textContent = `${registro.availability_availability} %`;
    const trendElement = document.getElementById('availability-trend');
    trendElement.textContent = formatPercentage(registro.pct_change_availability_availability);
    trendElement.className = `trend ${registro.pct_change_availability_availability >= 0 ? 'up' : 'down'} main`;
    
    // Sistemas
    const systemsCount = document.getElementById('systems-count');
    systemsCount.textContent = registro.availability_systems;
    systemsCount.appendChild(createVariationElement(registro.pct_change_availability_systems));
    
    // Eventos
    const eventsCount = document.getElementById('events-count');
    eventsCount.textContent = registro.availability_events;
    eventsCount.appendChild(createVariationElement(registro.pct_change_availability_events));
    
    // Tempo Indisponível
    const unavailableTime = document.getElementById('unavailable-time');
    unavailableTime.textContent = `${registro.availability_time} min`;
    unavailableTime.appendChild(createVariationElement(registro.pct_change_availability_time));
    
    // IaaS - VMs
    const vmCount = document.getElementById('vm-count');
    vmCount.textContent = `VMs Ativas: ${registro.vm_count}`;
    vmCount.appendChild(createVariationElement(registro.pct_change_vm_count));
    
    document.getElementById('vm-vcpu').textContent = `vCPU: ${registro.vm_vcpu}`;
    document.getElementById('vm-vcpu').appendChild(createVariationElement(registro.pct_change_vm_vcpu));
    
    document.getElementById('vm-memory').textContent = `Memória: ${registro.vm_memory}`;
    document.getElementById('vm-memory').appendChild(createVariationElement(registro.pct_change_vm_memory));
    
    document.getElementById('vm-storage').textContent = `Storage: ${registro.vm_storage}`;
    document.getElementById('vm-storage').appendChild(createVariationElement(registro.pct_change_vm_storage));
    
    // IaaS - Kubernetes
    const podCount = document.getElementById('pod-count');
    podCount.textContent = `PODs: ${registro.pod_pod}`;
    podCount.appendChild(createVariationElement(registro.pct_change_pod_pod));
    
    document.getElementById('pod-vcpu').textContent = `vCPU: ${registro.pod_vcpu}`;
    document.getElementById('pod-vcpu').appendChild(createVariationElement(registro.pct_change_pod_vcpu));
    
    document.getElementById('pod-memory').textContent = `Memória: ${registro.pod_memory}`;
    document.getElementById('pod-memory').appendChild(createVariationElement(registro.pct_change_pod_memory));
    
    // Bancos de Dados - Oracle
    const oracleBases = document.getElementById('oracle-bases');
    oracleBases.textContent = `Bases: ${registro.oracle_bases}`;
    oracleBases.appendChild(createVariationElement(registro.pct_change_oracle_bases));
    
    document.getElementById('oracle-vcpu').textContent = `vCPU: ${registro.oracle_vcpu}`;
    document.getElementById('oracle-vcpu').appendChild(createVariationElement(registro.pct_change_oracle_vcpu));
    
    document.getElementById('oracle-memory').textContent = `Memória: ${registro.oracle_memory}`;
    document.getElementById('oracle-memory').appendChild(createVariationElement(registro.pct_change_oracle_memory));
    
    document.getElementById('oracle-storage').textContent = `Storage: ${registro.oracle_storage}`;
    document.getElementById('oracle-storage').appendChild(createVariationElement(registro.pct_change_oracle_storage));
    
    // Bancos de Dados - MSSQL
    const mssqlBases = document.getElementById('mssql-bases');
    mssqlBases.textContent = `Bases: ${registro.mssql_bases}`;
    mssqlBases.appendChild(createVariationElement(registro.pct_change_mssql_bases));
    
    document.getElementById('mssql-vcpu').textContent = `vCPU: ${registro.mssql_vcpu}`;
    document.getElementById('mssql-vcpu').appendChild(createVariationElement(registro.pct_change_mssql_vcpu));
    
    document.getElementById('mssql-memory').textContent = `Memória: ${registro.mssql_memory}`;
    document.getElementById('mssql-memory').appendChild(createVariationElement(registro.pct_change_mssql_memory));
    
    document.getElementById('mssql-storage').textContent = `Storage: ${registro.mssql_storage}`;
    document.getElementById('mssql-storage').appendChild(createVariationElement(registro.pct_change_mssql_storage));
    
    // Bancos de Dados - MongoDB
    const mongodbBases = document.getElementById('mongodb-bases');
    mongodbBases.textContent = `Bases: ${registro.mongodb_bases}`;
    mongodbBases.appendChild(createVariationElement(registro.pct_change_mongodb_bases));
    
    document.getElementById('mongodb-vcpu').textContent = `vCPU: ${registro.mongodb_vcpu}`;
    document.getElementById('mongodb-vcpu').appendChild(createVariationElement(registro.pct_change_mongodb_vcpu));
    
    document.getElementById('mongodb-memory').textContent = `Memória: ${registro.mongodb_memory}`;
    document.getElementById('mongodb-memory').appendChild(createVariationElement(registro.pct_change_mongodb_memory));
    
    document.getElementById('mongodb-storage').textContent = `Storage: ${registro.mongodb_storage}`;
    document.getElementById('mongodb-storage').appendChild(createVariationElement(registro.pct_change_mongodb_storage));
    
    // Projetos
    document.getElementById('project-done').textContent = registro.project_done;
    document.getElementById('project-done-investment').textContent = formatCurrency(registro.project_done_investment);
    
    document.getElementById('project-going').textContent = registro.project_going;
    document.getElementById('project-going-investment').textContent = formatCurrency(registro.project_going_investment);
    
    document.getElementById('project-new-study').textContent = registro.project_new_study;
    document.getElementById('project-new-study-investment').textContent = formatCurrency(registro.project_new_study_investment);
    
    document.getElementById('project-paused').textContent = registro.project_paused;
    document.getElementById('project-paused-investment').textContent = formatCurrency(registro.project_paused_investment);
    
  } catch (error) {
    console.error('Erro ao carregar dados do extrato:', error);
    alert('Erro ao carregar os dados. Por favor, tente novamente mais tarde.');
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  loadExtratoData();
});