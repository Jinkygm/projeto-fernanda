document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const productForm = document.getElementById('product-form');
    const productsList = document.getElementById('products-list');
    const searchInput = document.getElementById('search');
    const totalStockElement = document.getElementById('total-stock');
    const totalProfitElement = document.getElementById('total-profit');
    
    // Dados dos produtos
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Gráfico
    const ctx = document.getElementById('profitChart').getContext('2d');
    let profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Porcentagem de Lucro (%)',
                data: [],
                backgroundColor: '#4285f4',
                borderColor: '#3367d6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Função para atualizar o gráfico
    function updateChart() {
        const labels = products.map(product => product.name);
        const data = products.map(product => {
            const cost = parseFloat(product.costPrice);
            const sale = parseFloat(product.salePrice);
            return ((sale - cost) / cost * 100).toFixed(2);
        });
        
        profitChart.data.labels = labels;
        profitChart.data.datasets[0].data = data;
        profitChart.update();
    }
    
    // Função para calcular e exibir estatísticas
    function updateStats() {
        const totalStock = products.reduce((sum, product) => sum + parseInt(product.quantity), 0);
        const totalProfit = products.reduce((sum, product) => {
            const profit = (parseFloat(product.salePrice) - parseFloat(product.costPrice)) * parseInt(product.quantity);
            return sum + profit;
        }, 0);
        
        totalStockElement.textContent = totalStock;
        totalProfitElement.textContent = `R$ ${totalProfit.toFixed(2)}`;
    }
    
    // Função para renderizar os produtos
    function renderProducts(productsToRender = products) {
        productsList.innerHTML = '';
        
        if (productsToRender.length === 0) {
            productsList.innerHTML = '<p class="no-products">Nenhum produto cadastrado.</p>';
            return;
        }
        
        productsToRender.forEach(product => {
            const cost = parseFloat(product.costPrice);
            const sale = parseFloat(product.salePrice);
            const profit = sale - cost;
            const profitPercentage = ((profit / cost) * 100).toFixed(2);
            
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-image">` : '<div class="product-image"><i class="fas fa-box-open" style="font-size: 50px; color: #ccc; display: block; text-align: center; padding: 50px 0;"></i></div>'}
                <h3 class="product-name">${product.name}</h3>
                <div class="product-info">
                    <span>Preço de Custo:</span>
                    <span>R$ ${cost.toFixed(2)}</span>
                </div>
                <div class="product-info">
                    <span>Preço de Venda:</span>
                    <span>R$ ${sale.toFixed(2)}</span>
                </div>
                <div class="product-info">
                    <span>Lucro Unitário:</span>
                    <span>R$ ${profit.toFixed(2)}</span>
                </div>
                <div class="product-info">
                    <span>Estoque:</span>
                    <span>${product.quantity}</span>
                </div>
                <div class="product-info">
                    <span>Lucro:</span>
                    <span class="profit-percentage ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${profit >= 0 ? '+' : ''}${profitPercentage}%
                    </span>
                </div>
                <button class="delete-btn" data-id="${product.id}">
                    <i class="fas fa-trash"></i> Remover
                </button>
            `;
            
            productsList.appendChild(productCard);
        });
        
        // Adiciona eventos aos botões de remover
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = this.getAttribute('data-id');
                deleteProduct(productId);
            });
        });
    }
    
    // Função para adicionar produto
    function addProduct(product) {
        product.id = Date.now().toString();
        products.push(product);
        saveProducts();
        renderProducts();
        updateStats();
        updateChart();
    }
    
    // Função para deletar produto
    function deleteProduct(id) {
        products = products.filter(product => product.id !== id);
        saveProducts();
        renderProducts();
        updateStats();
        updateChart();
    }
    
    // Função para salvar produtos no localStorage
    function saveProducts() {
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Evento de envio do formulário
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('product-name').value,
            image: document.getElementById('product-image').value,
            costPrice: document.getElementById('cost-price').value,
            salePrice: document.getElementById('sale-price').value,
            quantity: document.getElementById('quantity').value
        };
        
        addProduct(product);
        productForm.reset();
    });
    
    // Evento de pesquisa
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm)
        );
        renderProducts(filteredProducts);
    });
    
    // Inicialização
    renderProducts();
    updateStats();
    updateChart();
});