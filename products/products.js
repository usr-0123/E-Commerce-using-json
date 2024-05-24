// First check if user has logged in, if not then navigate to the logn page first. else continue to shopping
const userDetails = localStorage.getItem('loggedInUser');

const user = userDetails ? JSON.parse(userDetails) : null

if (!user) {
  window.location.href = '../index.html'
}

const baseURL = "http://localhost:3000/";
let cart = [];

function logout() {
  localStorage.clear('loggedInUser');
  window.location.href = './index.html'
}
document.getElementById('logout').addEventListener('click',logout)


async function getProducts() {
  const response = await fetch(baseURL + "products");
  const data = await response.json();
  console.log(data.length);
  showData(data);
}

getProducts();

async function showData(data) {
  const itemsContainer = document.getElementById('items');
  itemsContainer.innerHTML = '';
  data.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <h2>${item.name}</h2>
      <p>Price: Ksh.${item.price}</p>
      <p>Units: ${item.available}</p>
      <button onclick="addToCart('${item.id}','${item.name}', ${item.price}, ${item.available})">Add to Cart</button>
    `;
    itemsContainer.appendChild(itemDiv);
  });
  getCartItems()
  getOrders()
}

async function getCartItems() {
  const cartLength = await fetch(baseURL + "cart")
  const cartLengthData = await cartLength.json();
  document.getElementById('cart-count').textContent = `${cartLengthData.length}`;
}

async function getOrders() {
  const orderLength = await fetch(baseURL + "orders")
  const orderLengthData = await orderLength.json();
  document.getElementById('order-count').textContent = `${orderLengthData.length}`;
}

async function addToCart( id, itemName, itemPrice, itemAvailable) {
  if (itemAvailable > 0) {
    const res = await fetch(baseURL + "cart/" + id )
    
    if (res.statusText !== "Not Found") {
      let existingCartItem = await res.json();
      let items = existingCartItem.quantity
      updateItemQuantity(id, items)
    } else {
      let cartItem = { id, itemName, itemPrice, quantity: 1 };
      cart.push(cartItem);
      await fetch(baseURL + "cart", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartItem)
      });
    }
    await updateProducts(id, itemAvailable);
    getProducts();
  } else {
    alert('Item is out of stock');
  }
}

async function updateItemQuantity(id, quantity) {
  let newQuantity = quantity += 1;
  let updatedData = {
    quantity: newQuantity
  }
  await fetch(baseURL + "cart/" + id,{
    method: "PATCH",
    body: JSON.stringify(updatedData)
  })
}

async function updateProducts( itemId, itemAvailable ) {
  let newCount = itemAvailable -= 1;
  await fetch(baseURL + "products/" + itemId, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        available:newCount
    }),
  });
}
