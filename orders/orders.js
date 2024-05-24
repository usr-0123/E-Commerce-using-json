// First check if user has logged in, if not then navigate to the logn page first. else continue to shopping
const userDetails = localStorage.getItem('loggedInUser');

const user = userDetails ? JSON.parse(userDetails) : null

if (!user) {
  window.location.href = '../index.html'
}

const baseURL = "http://localhost:3000/";

async function getOrders() {
    try {
        const res = await fetch(baseURL + "orders");
        if (!res.ok) {
            throw new Error("Failed to fetch orders");
        }
        const orderData = await res.json();
        showOrders(orderData);
    } catch (error) {
        console.error("Error fetching orders:", error);
    }
}

getOrders();

function showOrders(orderData) {
    const container = document.getElementById('orders-container');

    container.innerHTML = '';
    orderData.forEach(order => {
        const listItem = document.createElement('div');
        listItem.setAttribute('id', `order-${order.id}`);
        listItem.classList.add('order-card');

        listItem.innerHTML = `
            <div class="order-header">${order.date} - Ksh.${order.totalPrice}</div>
            <div class="order-items">
                ${order.items.map(item => `<div class="item">${item.itemName} x ${item.quantity}</div>`).join('')}
            </div>
            <button class="cancel-button">Cancel order</button>
        `;

        const deleteButton = listItem.querySelector('.cancel-button');
        deleteButton.addEventListener('click', () => deleteOrder(order.id));

        container.appendChild(listItem);
    });
}


async function deleteOrder(orderId) {
    try {
        const res = await fetch(baseURL + `orders/${orderId}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            throw new Error("Failed to delete order");
        }
        getOrders();
    } catch (error) {
        console.error("Error deleting order:", error);
    }
}