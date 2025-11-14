
async function fetchData(apiUrl) {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erro na requisição: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar os dados:", error);
    throw error;
  }
}

//endpoint da api local criada com json-server
const apiEndpoint = "http://localhost:3000/coffee";

const CART_KEY = "cart";

// Lê o carrinho do localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

// Salva o carrinho no localStorage e atualiza o contador
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount(); // Atualiza o contador sempre que o carrinho é salvo
}


//funcao para adicionar itens ao carrinho
function addToCart(item) {
  try {
    const cart = getCart();
    const id = item.id ?? item.title;
    const existing = cart.find((i) => i.id === id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({
        id,
        title: item.title || "",
        price: item.price || 0,
        image: item.image || "",
        quantity: 1,
      });
    }
    saveCart(cart);
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
  }
}

// Botão de checkout 
function ensureSimpleCheckoutButton(root, summaryEl) {
  if (document.getElementById("simple-checkout-btn")) return;
  const cart = getCart();
  if (!cart || cart.length === 0) return;

  const btn = document.createElement("button");
  btn.id = "simple-checkout-button";
  btn.className = "btn btn-success btn-sm";
  btn.textContent = "Finalizar";
  btn.addEventListener("click", initCheckoutPage);

  (summaryEl || root).appendChild(btn);
}

//Pagina de finalização de compra simples, com endereco e forma de pagamento
function initCheckoutPage() {
  clearRoot();
  const root = document.getElementById("root");
  if (!root) return;
  root.className = "checkout-page container py-4";

  const title = document.createElement("h2");
  title.textContent = "Finalizar compra";
  root.appendChild(title);

  const cart = getCart() || [];
  let total = 0;

  // Lista simples dos itens
  const ul = document.createElement("ul");
  ul.className = "list-unstyled mb-3";
  cart.forEach((it) => {
    const sub = (it.price || 0) * (it.quantity || 1);
    const li = document.createElement("li");
    li.textContent = `${it.title} — ${it.quantity || 1} x R$ ${Number(it.price || 0).toFixed(2)} = R$ ${sub.toFixed(2)}`;
    ul.appendChild(li);
    total += sub;
  });
  root.appendChild(ul);

  // Endereço de entrega
  const addrLabel = document.createElement("label");
  addrLabel.textContent = "Endereço de entrega";
  root.appendChild(addrLabel);
  const addrInput = document.createElement("input");
  addrInput.className = "form-control mb-2";
  addrInput.type = "text";
  root.appendChild(addrInput);

  // Forma de pagamento
  const payLabel = document.createElement("label");
  payLabel.textContent = "Forma de pagamento";
  root.appendChild(payLabel);
  const paySelect = document.createElement("select");
  paySelect.className = "form-select mb-3";
  ["Cartão de crédito", "Boleto", "PIX", "Dinheiro"].forEach((v) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = v;
    paySelect.appendChild(o);
  });
  root.appendChild(paySelect);

  // Total
  const totalDiv = document.createElement("div");
  totalDiv.className = "fw-bold mb-3";
  totalDiv.textContent = `Total: R$ ${Number(total).toFixed(2)}`;
  root.appendChild(totalDiv);

  // Botão de fnalizar ou cancelar
  const finish = document.createElement("button");
  finish.className = "btn btn-success";
  finish.textContent = "Finalizar";
  finish.addEventListener("click", () => {
    if (!addrInput.value.trim() || !paySelect.value) {
      alert("Preencha o endereço e escolha a forma de pagamento.");
      return;
    }
    alert(`Compra confirmada. Total R$ ${Number(total).toFixed(2)}. Obrigado!`); //Quando finalizar, limpa o carrinho
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    if (typeof initmainPage === "function") initmainPage();
  });
  root.appendChild(finish);

  const cancel = document.createElement("button");
  cancel.className = "btn btn-outline-secondary ms-2";
  cancel.textContent = "Cancelar";
  cancel.addEventListener("click", () => {
    if (typeof initComprarPage === "function") initComprarPage();
  });
  root.appendChild(cancel);
}

function updateCartCount() {
  const cart = getCart();
  // Soma a quantidade de todos os itens
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0); 
  const cartCountBadge = document.getElementById("cart-count-badge");
  
  if (cartCountBadge) {
    cartCountBadge.textContent = totalItems.toString();
  }
}


function clearRoot() {
  const root = document.getElementById("root");
  root.innerHTML = ""; // Limpa todo o conteúdo
  root.className = ""; // Reseta as classes
}


function createHeader() {
  const header = document.createElement("header");
  const nav = document.createElement("nav");
  const linkHome = document.createElement("a");
  const linkCart = document.createElement("a");
  const cartCountBadge = document.createElement("span"); 

  nav.className = "nav-style"; 
  linkHome.className = "a1"; 
  linkHome.textContent = "Home";
  linkHome.href = "#";

  linkCart.textContent = "Carrinho "; 
  linkCart.href = "#";

  //contador de itens
  cartCountBadge.id = "cart-count-badge"; 
  cartCountBadge.textContent = "0"; // Valor inicial

  // Adiciona o evento para carregar a página inicial
  linkHome.addEventListener("click", function (e) {
    e.preventDefault();
    initmainPage();
  });

  // Adiciona o evento para carregar a página do carrinho
  linkCart.addEventListener("click", function (e) {
    e.preventDefault();
    initComprarPage();
  });

  linkCart.appendChild(cartCountBadge); // Coloca o contador dentro do link do carrinho
  nav.appendChild(linkHome);
  nav.appendChild(linkCart);
  header.appendChild(nav);

  document.body.prepend(header); // Adiciona o header no início do body
}

// Função para criar os cards 
function createCard(data) {
  const root = document.getElementById("root");
  const card = document.createElement("div");
  card.className = "card-style";

  const image = document.createElement("img");
  image.src = data.image;
  image.alt = data.title;
  image.className = "image-style";
  card.appendChild(image);

  const title = document.createElement("h3");
  title.textContent = data.title;
  title.className = "title-style";
  card.appendChild(title);

  const description = document.createElement("p");
  description.textContent = data.description;
  description.className = "description-style";
  card.appendChild(description);

  // Adiciona o preço 
  const preco = document.createElement("p");
  preco.textContent = `Preço: R$${data.price.toFixed(2)}`;
  preco.className = "price-style"; 
  card.appendChild(preco);

  // Adiciona ingredientes
  if (data.ingredients && data.ingredients.length > 0) {
    const ingredientsTitle = document.createElement("h4");
    ingredientsTitle.textContent = "Ingredientes:";
    ingredientsTitle.className = "ingredients-title-style";
    card.appendChild(ingredientsTitle);

    const ingredientsList = document.createElement("ul");
    ingredientsList.className = "ingredients-list-style";

    data.ingredients.forEach((ingredient) => {
      const ingredientItem = document.createElement("li");
      ingredientItem.textContent = ingredient;
      ingredientItem.className = "ingredient-item-style";
      ingredientsList.appendChild(ingredientItem);
    });
    card.appendChild(ingredientsList);
  }

  // Botão "Adicionar ao carrinho" 
  const addButton = document.createElement("button");
  addButton.textContent = "Adicionar ao carrinho";
  addButton.className = "add-to-cart-button";
  addButton.addEventListener("click", () => {
    addToCart(data);
  });
  card.appendChild(addButton);
  root.appendChild(card);
}

async function initmainPage() {
  clearRoot();
  const root = document.getElementById("root");
  root.className = "product-container"; // Adiciona a classe para o flexbox

  try {
    const data = await fetchData(apiEndpoint);
    console.log("Dados obtidos da API:", data);
    
    if (!data || data.length === 0) {
        root.textContent = "Nenhum café encontrado na API.";
        return;
    }
    
    // Cria os cards para cada item
    for (let card of data) {
      createCard(card);
    }
  } catch (error) {
    console.error("Erro durante a obtenção dos dados:", error);
    root.textContent = "Erro ao carregar os produtos. Verifique se a API local (json-server) está rodando.";
  }
}

function initComprarPage() {
  // Limpa a root e configura a página de carrinho simples
  clearRoot();
  const root = document.getElementById("root");
  if (!root) return;
  root.className = "cart-page container py-4";

  // Cabeçalho da página de carrinho
  const header = document.createElement("div");
  header.className = "d-flex justify-content-between align-items-center mb-3";

  const title = document.createElement("h2");
  title.textContent = "Meu Carrinho";
  title.style.margin = "0";
  header.appendChild(title);

  const actions = document.createElement("div");
  actions.className = "d-flex gap-2";

  const backBtn = document.createElement("button");
  backBtn.className = "btn btn-sm btn-outline-secondary";
  backBtn.textContent = "← Voltar";
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    initmainPage();
  });
  actions.appendChild(backBtn);

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn btn-sm btn-outline-danger";
  clearBtn.textContent = "Esvaziar";
  clearBtn.addEventListener("click", () => {
    if (confirm("Deseja esvaziar o carrinho?")) {
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      renderCart(); // atualiza a visão
    }
  });
  actions.appendChild(clearBtn);

  header.appendChild(actions);
  root.appendChild(header);

  // Container para lista e resumo
  const listContainer = document.createElement("div");
  listContainer.id = "cart-list";
  root.appendChild(listContainer);

  const summary = document.createElement("div");
  summary.className = "d-flex justify-content-between align-items-center mt-3";
  summary.style.gap = "12px";
  const itemsCount = document.createElement("div");
  itemsCount.id = "cart-items-count";
  itemsCount.style.fontWeight = "600";
  const totalDiv = document.createElement("div");
  totalDiv.id = "cart-total";
  totalDiv.style.fontWeight = "700";
  summary.appendChild(itemsCount);
  summary.appendChild(totalDiv);

  // área para botão de finalizar 
  const actionsRight = document.createElement("div");
  actionsRight.id = "cart-summary-actions";
  summary.appendChild(actionsRight);

  root.appendChild(summary);

  // Função que renderiza o carrinho 
  function renderCart() {
    const cart = getCart();
    listContainer.innerHTML = "";

    // remove botão de checkout antigo se existir
    const oldBtn = document.getElementById("cart-checkout-btn");
    if (oldBtn) oldBtn.remove();

    if (!cart || cart.length === 0) {
      const empty = document.createElement("div");
      empty.className = "alert alert-light";
      empty.textContent = "Seu carrinho está vazio.";
      listContainer.appendChild(empty);

      itemsCount.textContent = "Itens: 0";
      totalDiv.textContent = "Total: R$ 0.00";
      actionsRight.innerHTML = "";
      updateCartCount();
      return;
    }

    const table = document.createElement("table");
    table.className = "table";
    const tbody = document.createElement("tbody");

    let total = 0;
    let totalItems = 0;

    cart.forEach((item, idx) => {
      const tr = document.createElement("tr");

      const tdProd = document.createElement("td");
      tdProd.style.verticalAlign = "middle";
      const name = document.createElement("div");
      name.textContent = item.title || "";
      name.style.fontWeight = "600";
      tdProd.appendChild(name);
      tr.appendChild(tdProd);

      const tdPrice = document.createElement("td");
      tdPrice.textContent = `R$ ${Number(item.price || 0).toFixed(2)}`;
      tr.appendChild(tdPrice);

      const tdQty = document.createElement("td");
      const qty = document.createElement("input");
      qty.type = "number";
      qty.min = "1";
      qty.value = item.quantity || 1;
      qty.className = "form-control form-control-sm";
      qty.style.width = "90px";
      qty.addEventListener("change", (e) => {
        const v = parseInt(e.target.value, 10);
        if (isNaN(v) || v < 1) {
          e.target.value = item.quantity || 1;
          return;
        }
        const c = getCart();
        if (c[idx]) {
          c[idx].quantity = v;
          saveCart(c);
          renderCart();
        }
      });
      tdQty.appendChild(qty);
      tr.appendChild(tdQty);

      const tdSub = document.createElement("td");
      const sub = (item.price || 0) * (item.quantity || 1);
      tdSub.textContent = `R$ ${Number(sub).toFixed(2)}`;
      tr.appendChild(tdSub);

      const tdAct = document.createElement("td");
      const removeBtn = document.createElement("button");
      removeBtn.className = "btn btn-sm btn-outline-danger";
      removeBtn.textContent = "Remover";
      removeBtn.addEventListener("click", () => {
        const c = getCart();
        c.splice(idx, 1);
        saveCart(c);
        renderCart();
      });
      tdAct.appendChild(removeBtn);
      tr.appendChild(tdAct);

      tbody.appendChild(tr);

      total += sub;
      totalItems += item.quantity || 1;
    });

    table.appendChild(tbody);
    listContainer.appendChild(table);

    itemsCount.textContent = `Itens: ${totalItems}`;
    totalDiv.textContent = `Total: R$ ${Number(total).toFixed(2)}`;
    updateCartCount();

    // adiciona botão de finalizar (simples) à direita do resumo
    const checkoutBtn = document.createElement("button");
    checkoutBtn.id = "cart-checkout-btn";
    checkoutBtn.className = "btn btn-success btn-sm";
    checkoutBtn.textContent = "Finalizar compra";
    checkoutBtn.addEventListener("click", () => {
      initCheckoutPage(); // abre a página de finalização
    });
    actionsRight.innerHTML = "";
    actionsRight.appendChild(checkoutBtn);
  }
  // Render inicial
  renderCart();
}

/* Página de finalização de compra simples e mínima:
   - exibe itens atuais
   - campo endereço (texto)
   - seleção de pagamento
   - botão Finalizar que valida, mostra confirmação e limpa o carrinho */
function initCheckoutPage() {
  clearRoot();
  const root = document.getElementById("root");
  if (!root) return;
  root.className = "checkout-page container py-4";

  const title = document.createElement("h2");
  title.textContent = "Finalizar compra";
  root.appendChild(title);

  const cart = getCart() || [];
  if (!cart || cart.length === 0) {
    const empty = document.createElement("div");
    empty.className = "alert alert-light";
    empty.textContent = "Seu carrinho está vazio.";
    root.appendChild(empty);

    const back = document.createElement("button");
    back.className = "btn btn-primary mt-2";
    back.textContent = "Voltar às compras";
    back.addEventListener("click", initmainPage);
    root.appendChild(back);
    return;
  }

  // lista de itens (momento da finalização)
  const ul = document.createElement("ul");
  ul.className = "list-unstyled mb-3";
  let total = 0;
  cart.forEach((it) => {
    const sub = (it.price || 0) * (it.quantity || 1);
    const li = document.createElement("li");
    li.textContent = `${it.title} — ${it.quantity || 1} x R$ ${Number(it.price || 0).toFixed(2)} = R$ ${sub.toFixed(2)}`;
    ul.appendChild(li);
    total += sub;
  });
  root.appendChild(ul);

  // endereço
  const addrLabel = document.createElement("label");
  addrLabel.textContent = "Endereço de entrega";
  addrLabel.className = "form-label";
  root.appendChild(addrLabel);
  const addrInput = document.createElement("input");
  addrInput.type = "text";
  addrInput.className = "form-control mb-3";
  addrInput.placeholder = "Rua, número, cidade, CEP";
  root.appendChild(addrInput);

  // pagamento
  const payLabel = document.createElement("label");
  payLabel.textContent = "Forma de pagamento";
  payLabel.className = "form-label";
  root.appendChild(payLabel);
  const paySelect = document.createElement("select");
  paySelect.className = "form-select mb-3";
  paySelect.innerHTML = `
    <option value="">-- escolha --</option>
    <option value="cartao">Cartão de crédito</option>
    <option value="boleto">Boleto</option>
    <option value="pix">PIX</option>
    <option value="dinheiro">Dinheiro</option>
  `;
  root.appendChild(paySelect);

  // total
  const totalDiv = document.createElement("div");
  totalDiv.className = "fw-bold mb-3";
  totalDiv.textContent = `Total: R$ ${Number(total).toFixed(2)}`;
  root.appendChild(totalDiv);

  // botões
  const btnConfirm = document.createElement("button");
  btnConfirm.className = "btn btn-success";
  btnConfirm.textContent = "Finalizar";
  btnConfirm.addEventListener("click", () => {
    // validações básicas
    const address = (addrInput.value || "").trim();
    const payment = (paySelect.value || "").trim();
    if (!address) {
      alert("Informe o endereço de entrega.");
      addrInput.focus();
      return;
    }
    if (!payment) {
      alert("Escolha a forma de pagamento.");
      paySelect.focus();
      return;
    }

    // confirmação: exibe resumo e limpa carrinho
    const orderId = Math.floor(Math.random() * 900000) + 100000;
    alert(
      `Pedido ${orderId} confirmado.\nTotal: R$ ${Number(total).toFixed(2)}\nEndereço: ${address}\nPagamento: ${paySelect.options[paySelect.selectedIndex].text}\n\nObrigado pela compra!`
    );

    // limpa carrinho
    localStorage.removeItem(CART_KEY);
    updateCartCount();

    // volta à página principal
    initmainPage();
  });

  const btnCancel = document.createElement("button");
  btnCancel.className = "btn btn-outline-secondary ms-2";
  btnCancel.textContent = "Cancelar";
  btnCancel.addEventListener("click", initComprarPage);

  root.appendChild(btnConfirm);
  root.appendChild(btnCancel);
}

document.addEventListener("DOMContentLoaded", () => {
  // cria o cabeçalho
  if (typeof createHeader === "function") createHeader();

  // atualiza contador 
  if (typeof updateCartCount === "function") updateCartCount();

  // abre a página inicial por padrão
  if (typeof initmainPage === "function") {
    initmainPage();
  } else if (typeof initMainPage === "function") {
    initMainPage();
  }
});



