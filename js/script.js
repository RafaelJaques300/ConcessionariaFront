// ==================== CLIENTES ==================== //

// Função para carregar clientes 
async function carregarClientes() {
  const listaClientes = document.getElementById('lista-clientes');
  listaClientes.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <span class="loader"></span> <span>Carregando...</span>
    </div>
  `;
  try {
    const res = await fetch('http://localhost:8080/api/cliente');
    if (!res.ok) throw new Error('Erro na resposta da API');
    const clientes = await res.json();

    listaClientes.innerHTML = '';

    if (clientes.length === 0) {
      listaClientes.innerHTML = '<div style="color:#00b8ff;">Nenhum cliente encontrado.</div>';
      return;
    }

    clientes.forEach(cliente => {
      const item = document.createElement('div');
      item.classList.add('list-group-item');
      item.innerHTML = `
        <div>
          <strong>${cliente.nome}</strong><br>
          <small>${cliente.email}</small><br>
          <small>📞 ${cliente.telefone}</small>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn" style="padding:6px 16px;font-size:0.9em;" 
            onclick='abrirModalEdicao(${JSON.stringify(cliente)})'>Editar</button>
          <button class="btn" style="padding:6px 16px;font-size:0.9em;background:#ff4d4d;color:#fff;" 
            onclick="deletarCliente('${cliente.id}')">Deletar</button>
        </div>
      `;
      listaClientes.appendChild(item);
    });
  } catch (error) {
    listaClientes.innerHTML = '<div style="color:red;">Erro ao carregar clientes.</div>';
    console.error('Erro ao carregar clientes:', error);
  }
}

// ==================== NAVEGAÇÃO ENTRE SEÇÕES ==================== //
function mostrarSecao(secaoId) {
  document.querySelectorAll('.conteudo').forEach(secao => {
    secao.classList.remove('ativo');
  });
  const secaoAtiva = document.getElementById(secaoId);
  if (secaoAtiva) {
    secaoAtiva.classList.add('ativo');
  }
}

// Navegação suave
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const secao = this.getAttribute('href').replace('#', '');
    mostrarSecao(secao);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  mostrarSecao('clientes');
  carregarClientes();
  carregarVeiculos(); // já carrega veículos ao iniciar
});

// ==================== TOAST ==================== //
function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.add('ativo');
  setTimeout(() => toast.classList.remove('ativo'), 3000);
}

// ==================== MODAL CLIENTES ==================== //
function abrirModalCadastro() {
  document.getElementById('modal-cadastro').classList.add('ativo');
}
function fecharModalCadastro() {
  document.getElementById('modal-cadastro').classList.remove('ativo');
}
document.getElementById('modal-cadastro').addEventListener('click', function(e) {
  if (e.target === this) fecharModalCadastro();
});

// Cadastro de cliente
document.getElementById('form-cadastro-cliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const telefone = form.telefone.value.trim();

  if (!nome || !email || !telefone) {
    mostrarToast('Nome e email são obrigatórios!');
    return;
  }
  const clienteId = form.dataset.clienteId;
  const edicao = form.dataset.edicao === "true";

  if (!nome || !email ) return; 

  try {
    let res;
    if (edicao && clienteId) {
      // Atualizar cliente
      res = await fetch(`http://localhost:8080/api/cliente/${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone })
      });
      if (!res.ok) throw new Error('Erro ao atualizar cliente');
      mostrarToast('Cliente atualizado com sucesso!');
    } else {
      // Cadastrar cliente
      res = await fetch('http://localhost:8080/api/cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone })
      });
      if (!res.ok) throw new Error('Erro ao cadastrar cliente');
      mostrarToast('Cliente cadastrado com sucesso!');
    }
    fecharModalCadastro();
    form.reset();
    delete form.dataset.clienteId;
    delete form.dataset.edicao;
    carregarClientes();
  } catch (err) {
    mostrarToast(edicao ? 'Erro ao atualizar cliente!' : 'Erro ao cadastrar cliente!');
  }
});

// Função para abrir modal de edição de cliente
function abrirModalEdicao(cliente) {
  const modal = document.getElementById('modal-cadastro');
  modal.classList.add('ativo');
  const form = document.getElementById('form-cadastro-cliente');
  form.nome.value = cliente.nome;
  form.email.value = cliente.email;
  form.telefone.value = cliente.telefone;
  form.dataset.clienteId = cliente.id;
  form.dataset.edicao = "true";
}

// Deletar cliente
async function deletarCliente(id) {
  if (!confirm("Tem certeza que deseja excluir este cliente?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/cliente/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Erro ao deletar cliente");

    mostrarToast("Cliente deletado com sucesso!");
    carregarClientes();
  } catch (err) {
    console.error("Erro ao deletar cliente:", err);
    mostrarToast("Erro ao deletar cliente!");
  }
}

// ==================== VEÍCULOS ==================== //

// Abrir e fechar modal de veículo
function abrirModalCadastroVeiculo() {
  document.getElementById("modal-cadastro-veiculo").classList.add("ativo");
}
function fecharModalCadastroVeiculo() {
  document.getElementById("modal-cadastro-veiculo").classList.remove("ativo");
}
document.getElementById("modal-cadastro-veiculo").addEventListener("click", e => {
  if (e.target === e.currentTarget) fecharModalCadastroVeiculo();
});

// Cadastro de veículos
const formveiculo = document.getElementById("form-cadastro-veiculo");
// document.getElementById("form-cadastro-veiculo").addEventListener("submit", async e => {
formveiculo.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const veiculo = {
    marca: formveiculo.marca.value,
    modelo: formveiculo.modelo.value,
    ano: parseInt(formveiculo.ano.value),
    cor: formveiculo.cor.value,
    preco: parseFloat(formveiculo.preco.value)
  };
  console.log("Veículo a ser cadastrado:", veiculo);

  try {
    const res = await fetch("http://localhost:8080/api/veiculo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(veiculo)
    });

   // if (!res.ok) throw new Error("Erro ao cadastrar veículo");

    mostrarToast("Veículo cadastrado com sucesso!");
    form.reset();
    fecharModalCadastroVeiculo();
    carregarVeiculos();
  } catch (err) {
    console.error("Erro ao cadastrar veículo:", err);
    mostrarToast("Erro ao cadastrar veículo!");
  }
});

// Carregar veículos

async function carregarVeiculos() {
  const listaVeiculos = document.getElementById("lista-veiculos");
  if (!listaVeiculos) return;

  listaVeiculos.innerHTML = `<span class="loader"></span> Carregando veículos...`;

  try {
    const res = await fetch("http://localhost:8080/api/veiculo");
    if (!res.ok) throw new Error("Erro na API de veículos");

    const veiculos = await res.json();
    listaVeiculos.innerHTML = "";

    if (veiculos.length === 0) {
      listaVeiculos.innerHTML = "<div style='color:#00b8ff;'>Nenhum veículo encontrado.</div>";
      return;
    }

    veiculos.forEach(v => {
      const precoFormatado = Number(v.preco).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

      const item = document.createElement("div");
      item.classList.add("list-group-item");
      item.innerHTML = `
        <div>
          <strong>${v.marca} ${v.modelo}</strong> - ${v.ano}<br>
          <small style="color:#555;">Cor: ${v.cor} | Preço: ${precoFormatado}</small>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn" style="padding:6px 16px;font-size:0.9em;background:#ff4d4d;color:#fff;" onclick="deletarVeiculo('${v.id}')">Excluir</button>
        </div>
      `;
      listaVeiculos.appendChild(item);
    });
  } catch (err) {
    listaVeiculos.innerHTML = "<div style='color:red;'>Erro ao carregar veículos.</div>";
    console.error("Erro ao carregar veículos:", err);
  }
}

// Função para abrir modal de edição de veículo
function abrirModalEdicaoVeiculo(veiculo) {
  const modal = document.getElementById('modal-cadastro-veiculo');
  modal.classList.add('ativo');
  const form = document.getElementById('form-cadastro-veiculo');
  form.marca.value = veiculo.marca;
  form.modelo.value = veiculo.modelo;
  form.ano.value = veiculo.ano;
  form.cor.value = veiculo.cor;
  form.preco.value = veiculo.preco;
  form.dataset.veiculoId = veiculo.id;
  form.dataset.edicao = "true";
}

// Deletar veículo
async function deletarVeiculo(id) {
  if (!confirm("Tem certeza que deseja excluir este veículo?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/veiculo/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Erro ao deletar veículo");

    mostrarToast("Veículo excluído com sucesso!");
    carregarVeiculos();
  } catch (err) {
    console.error("Erro ao deletar veículo:", err);
    mostrarToast("Erro ao deletar veículo!");
  }
}

// Cadastro/Edição de veículos
const formveiculos = document.getElementById("form-cadastro-veiculo");
formveiculo.addEventListener("submit", async e => {
  e.preventDefault();
  const form = e.target;
  const veiculo = {
    marca: formveiculo.marca.value,
    modelo: formveiculo.modelo.value,
    ano: parseInt(formveiculo.ano.value),
    cor: formveiculo.cor.value,
    preco: parseFloat(formveiculo.preco.value)
  };

  const veiculoId = form.dataset.veiculoId;
  const edicao = form.dataset.edicao === "true";

  try {
    let res;
    if (edicao && veiculoId) {
      // Atualizar veículo
      res = await fetch(`http://localhost:8080/api/veiculo/${veiculoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(veiculo)
      });
      if (!res.ok) throw new Error("Erro ao atualizar veículo");
      mostrarToast("Veículo atualizado com sucesso!");
    } else {
      // Cadastrar veículo
      res = await fetch("http://localhost:8080/api/veiculo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(veiculo)
      });
      if (!res.ok) throw new Error("Erro ao cadastrar veículo");
      mostrarToast("Veículo cadastrado com sucesso!");
    }
    fecharModalCadastroVeiculo();
    form.reset();
    delete form.dataset.veiculoId;
    delete form.dataset.edicao;
    carregarVeiculos();
  } catch (err) {
    mostrarToast(edicao ? "Erro ao atualizar veículo!" : "Erro ao cadastrar veículo!");
  }
});

// ==================== MANUTENÇÃO ==================== //

// Abrir e fechar modal de manutenção
function abrirModalCadastroManutencao() {
  document.getElementById("modal-cadastro-manutencao").classList.add("ativo");
}
function fecharModalCadastroManutencao() {
  document.getElementById("modal-cadastro-manutencao").classList.remove("ativo");
}
document.getElementById("modal-cadastro-manutencao").addEventListener("click", e => {
  if (e.target === e.currentTarget) fecharModalCadastroManutencao();
});

// Cadastro de manutenção
const formManutencao = document.getElementById("form-cadastro-manutencao");
formManutencao.addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const manutencao = {
    tipoManutencao: form.tipoManutencao.value,
    dataManutencao: form.dataManutencao.value,
    status: form.status.value,
    custo: parseFloat(form.custo.value)
  };

  const manutencaoId = form.dataset.manutencaoId;
  const edicao = form.dataset.edicao === "true";

  

  try {
    let res;
    if (edicao && manutencaoId) {
      // Atualizar manutenção
      res = await fetch(`http://localhost:8080/api/manutencao/${manutencaoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manutencao)
      });
      if (!res.ok) throw new Error("Erro ao atualizar manutenção");
      mostrarToast("Manutenção atualizada com sucesso!");
    } else {
      // Cadastrar manutenção
      res = await fetch("http://localhost:8080/api/manutencao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manutencao)
      });
      if (!res.ok) throw new Error("Erro ao cadastrar manutenção");
      mostrarToast("Manutenção cadastrada com sucesso!");
  }
    fecharModalCadastroManutencao();
    form.reset();
    delete form.dataset.manutencaoId;
    delete form.dataset.edicao;
    carregarManutencao();
  } catch (err) {
    mostrarToast(edicao ? "Erro ao atualizar manutenção!" : "Erro ao cadastrar manutenção!");
  }
});

// Função para carregar manutenções com animação de carregamento
async function carregarManutencao() {
  const lista = document.getElementById("lista-manutencao");
  if (!lista) return;

  lista.innerHTML = `<span class="loader"></span> Carregando manutenções...`;

  try {
    const res = await fetch("http://localhost:8080/api/manutencao");
    if (!res.ok) throw new Error("Erro na API de manutenção");

    const manutencao = await res.json();
    lista.innerHTML = "";

    if (manutencao.length === 0) {
      lista.innerHTML = "<div style='color:#00b8ff;'>Nenhuma manutenção encontrada.</div>";
      return;
    }

    manutencao.forEach(m => {
      const tipo = m.tipoManutencao ?? "(Tipo não informado)";
      const data = m.dataManutencao ?? "(Data não informada)";
      const status = m.status ?? "(Status não informado)";
      const custoFormatado = m.custo != null
        ? Number(m.custo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : "(Custo não informado)";
      const item = document.createElement("div");
      item.classList.add("list-group-item");
      item.innerHTML = `
        <div>
          <strong>${tipo}</strong> - ${data}<br>
          <small>Status: ${status} | Custo: ${custoFormatado}</small>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn" style="padding:6px 16px;font-size:0.9em;" onclick='abrirModalEdicaoManutencao(${JSON.stringify(m)})'>Editar</button>
          <button class="btn" style="padding:6px 16px;font-size:0.9em;background:#ff4d4d;color:#fff;" onclick="deletarManutencao('${m.id}')">Excluir</button>
        </div>
      `;
      lista.appendChild(item);
    });
  } catch (err) {
    lista.innerHTML = "<div style='color:red;'>Erro ao carregar manutenções.</div>";
    console.error("Erro ao carregar manutenções:", err);
  }
}

// Função para abrir modal de edição de manutenção
function abrirModalEdicaoManutencao(manutencao) {
  const modal = document.getElementById('modal-cadastro-manutencao');
  modal.classList.add('ativo');
  const form = document.getElementById('form-cadastro-manutencao');
  form.tipoManutencao.value = manutencao.tipoManutencao;
  form.dataManutencao.value = manutencao.dataManutencao;
  form.status.value = manutencao.status;
  form.custo.value = manutencao.custo;
  form.dataset.manutencaoId = manutencao.id;
  form.dataset.edicao = "true";
}

// Deletar manutenção
async function deletarManutencao(id) {
  if (!confirm("Tem certeza que deseja excluir esta manutenção?")) {
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/api/manutencao/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Erro ao deletar manutenção");

    mostrarToast("Manutenção excluída com sucesso!");
    carregarManutencao();
  } catch (err) {
    console.error("Erro ao deletar manutenção:", err);
    mostrarToast("Erro ao deletar manutenção!");
  }
  
}
