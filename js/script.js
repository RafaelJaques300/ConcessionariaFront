// Função para carregar clientes com animação de carregamento
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
          <small>${cliente.email}</small>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn" style="padding:6px 16px;font-size:0.9em;" onclick='abrirModalEdicao(${JSON.stringify(cliente)})'>Editar</button>
          <button class="btn" style="padding:6px 16px;font-size:0.9em;background:#ff4d4d;color:#fff;" onclick="deletarCliente('${cliente.id}')">Deletar</button>
        </div>
      `;
      listaClientes.appendChild(item);
    });
  } catch (error) {
    listaClientes.innerHTML = '<div style="color:red;">Erro ao carregar clientes.</div>';
    console.error('Erro ao carregar clientes:', error);
  }
}

// Função para mostrar seções com animação
function mostrarSecao(secaoId) {
  document.querySelectorAll('.conteudo').forEach(secao => {
    secao.classList.remove('ativo');
  });
  const secaoAtiva = document.getElementById(secaoId);
  if (secaoAtiva) {
    secaoAtiva.classList.add('ativo');
  }
}

// Navegação suave pelos links do menu
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const secao = this.getAttribute('href').replace('#', '');
    mostrarSecao(secao);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Mostra a seção de clientes ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  mostrarSecao('clientes');
  //carregarClientes();
});

// Modal de cadastro
function abrirModalCadastro() {
  document.getElementById('modal-cadastro').classList.add('ativo');
}
function fecharModalCadastro() {
  document.getElementById('modal-cadastro').classList.remove('ativo');
}

// Toast
function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.add('ativo');
  setTimeout(() => toast.classList.remove('ativo'), 3000);
}

// Cadastro de cliente
document.getElementById('form-cadastro-cliente').addEventListener('submit', async function(e) {
  e.preventDefault();
  const form = e.target;
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const clienteId = form.dataset.clienteId;
  const edicao = form.dataset.edicao === "true";

  if (!nome || !email) return; 

  try {
    let res;
    if (edicao && clienteId) {
      // Atualizar cliente
      res = await fetch(`http://localhost:8080/api/cliente/${clienteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
      });
      if (!res.ok) throw new Error('Erro ao atualizar cliente');
      mostrarToast('Cliente atualizado com sucesso!');
    } else {
      // Cadastrar cliente
      res = await fetch('http://localhost:8080/api/cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email })
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

// Função para abrir modal de edição
function abrirModalEdicao(cliente) {
  const modal = document.getElementById('modal-cadastro');
  modal.classList.add('ativo');
  const form = document.getElementById('form-cadastro-cliente');
  form.nome.value = cliente.nome;
  form.email.value = cliente.email;
  form.dataset.clienteId = cliente.id; // Salva o id para edição
  form.dataset.edicao = "true";
}

// Função para deletar cliente
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
    carregarClientes(); // Recarrega a lista sem precisar atualizar a página
  } catch (err) {
    console.error("Erro ao deletar cliente:", err);
    mostrarToast("Erro ao deletar cliente!");
  }
}


// Fecha modal ao clicar fora
document.getElementById('modal-cadastro').addEventListener('click', function(e) {
  if (e.target === this) fecharModalCadastro();
});



