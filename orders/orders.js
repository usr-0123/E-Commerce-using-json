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
        const listItem = document.createElement('li');
        listItem.innerHTML = `${order.date} - Ksh.${order.totalPrice}`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Cancel order';
        deleteButton.addEventListener('click', () => deleteOrder(order.id));
        listItem.appendChild(deleteButton);

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
        // If successful, update the displayed orders
        getOrders();
    } catch (error) {
        console.error("Error deleting order:", error);
    }
}