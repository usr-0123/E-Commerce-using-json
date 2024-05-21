const baseURL = "http://localhost:3000/";

async function getCartItems() {
  const res = await fetch(baseURL + "cart");
  const cartData = await res.json();
  showItems(cartData);
}

getCartItems();

function showItems(cartData) {
  const container = document.getElementById('cart-items');
  let totalPrice = 0;

  container.innerHTML = '';
  cartData.forEach(item => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      ${item.itemName} - Ksh.${item.itemPrice} x ${item.quantity}
      <div class="cart-item-buttons">
        <button class="increase" onclick="updateCartItem('${item.name}', 1)">+</button>
        <button class="decrease" onclick="updateCartItem('${item.name}', -1)">-</button>
        <button class="delete" onclick="removeCartItem('${item.id}')">x</button>
      </div>`;
    container.appendChild(listItem);
    totalPrice += item.itemPrice * item.quantity;
  });

  document.getElementById('total-price').textContent = totalPrice.toFixed(2);
  pigaOrder(totalPrice.toFixed(2), cartData);
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
  await clearCart()
  return;
}

async function updateCartItem(itemName, change) {
    let cartItems = await fetch(baseURL+"cart");
    let productsItems = await fetch(baseURL+"products");
    const cartItemIndex = cartItems.findIndex(item => item.name === itemName);
    const item = productsItems.find(item => item.name === itemName);

    if (cartItemIndex > -1 && item) {
        cart[cartItemIndex].quantity += change;
        item.available -= change;

        if (cart[cartItemIndex].quantity <= 0) {
            cart.splice(cartItemIndex, 1);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('items', JSON.stringify(items));
        location.reload();
    }
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

async function clearCart(){
    const res = await fetch(baseURL+"cart")
    if (res) {
        await fetch(baseURL + "cart", {
            method: "DELETE"    
        });    
    } else {
        alert("Cart is empty")
    }
    return;
};

function getDateToday() {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
    const date = new Date();
  
    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthsOfYear[date.getMonth()];
    const year = date.getFullYear();
  
    return `${dayOfWeek} ${day} ${month} ${year}`;
}