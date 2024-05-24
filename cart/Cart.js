// First check if user has logged in, if not then navigate to the logn page first. else continue to shopping
const userDetails = localStorage.getItem('loggedInUser');

const user = userDetails ? JSON.parse(userDetails) : null

if (!user) {
  window.location.href = '../index.html'
}

const baseURL = "http://localhost:3000/";

async function getCartItems() {
  const res = await fetch(baseURL + "cart");
  const cartData = await res.json();
  showItems(cartData);
}

getCartItems();

async function showItems(cartData) {
  const container = document.getElementById('cart-items');
  let totalPrice = 0;

  container.innerHTML = '';
  cartData.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      ${item.itemName} - Ksh.${item.itemPrice} x ${item.quantity}
      <div class="cart-item-buttons">
        <button class="increase" onclick="addItemQuantities('${item.id}','${item.quantity}')">+</button>
        <button class="decrease" onclick="reduceItemQuantities('${item.id}','${item.quantity}')">-</button>
        <button class="delete" onclick="removeCartItem('${item.id}')">x</button>
      </div>`;
    container.appendChild(listItem);
    totalPrice += item.itemPrice * item.quantity;
  });

  const checkoutButton = document.getElementById('order');
  checkoutButton.innerHTML = `Checkout ${totalPrice.toFixed(2)}`
  checkoutButton.onclick = function() {
  pigaOrder(totalPrice.toFixed(2), cartData);
};

  container.appendChild(checkoutButton);

  const orderLength = await fetch(baseURL + "orders")
 const orderLengthData = await orderLength.json();

 document.getElementById('order-count').textContent = `${orderLengthData.length}`;
}

async function pigaOrder(totalPrice, cartItems) {
  const username = "yourUsername";
  const currentDate = getDateToday();

  const newOrder = {
    username,
    date: currentDate,
    totalPrice,
    items: cartItems.map(item => ({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      quantity: item.quantity
    }))
  };

  await fetch(baseURL + "orders", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newOrder)
  });
  alert('Order placed successfully!')
  location.reload()
}

async function addItemQuantities(id, quantity) {
  let newQuantity = ++quantity
  let updatedData = {
    quantity: newQuantity
  }
  await fetch(baseURL + "cart/" + id,{
    method: "PATCH",
    body: JSON.stringify(updatedData)
  })
  getCartItems()
}

async function reduceItemQuantities(id, quantity) {
  let newQuantity = --quantity
  let updatedData = {
    quantity: newQuantity
  }
  await fetch(baseURL + "cart/" + id,{
    method: "PATCH",
    body: JSON.stringify(updatedData)
  })
  getCartItems()
}

async function removeCartItem(id){
    const res = await fetch(baseURL+"cart/"+ id)
    if (res) {
        await fetch(baseURL + "cart/" + id, {
            method: "DELETE"    
        });    
    } else {
        alert("Item does not exist")
    }
    location.reload()
};

function getDateToday() {
  const date = new Date();
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const day = String(date.getDate()).padStart(2, '0');
  const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const month = monthsOfYear[date.getMonth()];
  const year = date.getFullYear();

    const time = `${hours}:${minutes}:${seconds}`
    const dates = `${dayOfWeek} ${day} ${month} ${year}`
  
    return `${time} ${dates}`;
}