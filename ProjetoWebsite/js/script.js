async function fetchData(apiUrl) {
  try {
    // Faz a requisição à API
    const response = await fetch(apiUrl);

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      throw new Error(
        `Erro na requisição: ${response.status} - ${response.statusText}`
      );
    }

    // Converte os dados para JSON
    const data = await response.json();

    // Retorna os dados obtidos
    return data;
  } catch (error) {
    // Exibe erros no console
    console.error("Erro ao buscar os dados:", error);
    throw error; // Propaga o erro para ser tratado posteriormente
  }
}

// Exemplo de uso
// Ajustado para usar a coleção `coffee` definida em `db.json`
const apiEndpoint = "http://localhost:3000/coffee"; // Substitua pelo URL da API desejada

fetchData(apiEndpoint)
  .then((data) => {
    console.log("Dados obtidos da API:", data);
    for (let card of data) {
      createCard(card);
    }
  })
  .catch((error) => {
    console.error("Erro durante a obtenção dos dados:", error);
  });

// Função para criar o card
function createCard(data) {
  // Seleciona a div com id "root"
  const root = document.getElementById("root");

  // Cria a div principal do card
  const card = document.createElement("div");
  card.className = "card-style";

  // Adiciona a imagem
  const image = document.createElement("img");
  image.src = data.image;
  image.alt = data.title;
  image.className = "image-style";
  card.appendChild(image);

  // Adiciona o título
  const title = document.createElement("h3");
  title.textContent = data.title;
  title.className = "title-style";
  card.appendChild(title);

  // Adiciona a descrição
  const description = document.createElement("p");
  description.textContent = data.description;
  description.className = "description-style";
  card.appendChild(description);

  const preco = document.createElement("p");
  preco.textContent = `Preço: $${data.price.toFixed(2)}`;
  preco.className = "price-style";
  card.appendChild(preco);



  // Adiciona a lista de ingredientes
  if (data.ingredients && data.ingredients.length > 0) {
    const ingredientsTitle = document.createElement("h4");
    ingredientsTitle.textContent = "Ingredients:";
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

  // Adiciona o card à div root
  root.appendChild(card);
}

// Executa a função para criar o card
// Removida chamada incorreta a `createCard(jsonData)` — os cards já são criados
// quando `fetchData` resolve e chama `createCard` para cada item.
