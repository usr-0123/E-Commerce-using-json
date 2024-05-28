const url = "http://localhost:3000/";

//Access control
const userDetails = localStorage.getItem('loggedInUser');

const check = userDetails ? JSON.parse(userDetails) : null

if (!userDetails) {
    window.location.href = '../index.html'
}
const {id, email, username, tokenTime} = check.user

const userInfo = {"id":id, "email":email, "username":username, "tokenTime":tokenTime}

function timeout() {
    var setTime = userInfo.tokenTime
    var storedTime = new Date(setTime)
    var currentTime = new Date()
    var timeDifference = currentTime.getHours() - storedTime.getHours()
    let access
    if (timeDifference < 24) {
        access = true
    } else {
        access = false
    }
    return {timeDifference, access}
}

const time = timeout().timeDifference

if (time >= 6) {
    localStorage.clear('loggedInUser')
    showPage()
}

setInterval(showPage,3600000)

showPage()

function showPage(page) {

    if (!page) {
        page = 'home'
    }
    
    const pages = {

        home: `
            <h2>Home</h2>
            <div class="prodHeader">
                <p id="products-Count"></p>
                <select name="" id="priceSort" class="sortSelection">
                    <option value="none">Sort:None</option>
                    <option value="ascend">Expensive to cheap</option>
                    <option value="descend">Cheap to expensive</option>
                </select>
            </div>
            <div class="products" id="products"></div>
        `,

        cart: `
            <h2>Cart</h2>
            <div class="cartItems" id="cartpage"></div>
            <button id="order" class="button"></button>
            <button id="clearCart" class="button">Clear Cart</button>
        `,

        orders: `
            <h2>Orders</h2>
            <div class="orders" id="orders"></div>
        `,

        profile: `
            <h2>Profile</h2>
            <div class="profMain">
                <div class="profileContainer">

                    <div class="username" id="showUsernameContainer">
                        <span class="usernameField" id='usernameItem'>Username</span>
                        <button id="usernameBtn">Edit</button>
                    </div>
                    <div class="username" id="editUsernameContainer">
                        <input type="text" id="username">
                        <button id="saveUsername">Save</button>
                    </div>

                    <div class="email" id="showEmailContainer">
                        <span class="emailField" id='emailItem'>Email</span>
                        <button id="emailBtn">Edit</button>
                    </div>
                    <div class="email" id="editEmailContainer">
                        <input type="text" id="email">
                        <button id="saveEmail">Save</button>
                    </div>

                    <div class="password" id="showPasswordContainer">
                        <span class="passwordField" id='passwordDisplay'>Password </span>
                        <button id="passwordBtn">Edit</button>
                    </div>
                    <div class="password" id="editPasswordContainer">
                        <input type="text" id="password">
                        <button id="savePassword">Save</button>
                    </div>
                </div>
            </div>
        `
    }

    const htmlContent = pages[page];

    document.getElementById('container').innerHTML = htmlContent;
    getProducts()
    showProfile()
    getCart()
}

// Products page
async function getProducts() {
    const stringProductsData = await fetch(url+"products")
    const productsData = await stringProductsData.json()

    const stringData = await fetch(url + "orders")
    const orders = await stringData.json()
    const userOrders = orders.filter(data => data.userId == userInfo.id )

    const search = document.getElementById('search')
    const priceSort = document.getElementById('priceSort')

    showProducts(productsData)
    getOrders(userOrders)
    
    priceSort.addEventListener('input', function(){
        if (priceSort.value == 'descend') {
            productsData.sort((a,b) => a.price - b.price)
            showProducts(productsData)
        }

        if (priceSort.value == 'ascend') {
            productsData.sort((a,b) => b.price - a.price)
            showProducts(productsData)
        }
    })

    search.addEventListener('input',function(){
    const params = search.value

        const filteredData = productsData.filter(item => item.name.toLowerCase().includes(params.toLowerCase()))
        showProducts(filteredData)

        const filteredOrders = userOrders.filter(item => item.name.toLowerCase().includes(params).toLowerCase())
        getOrders(filteredOrders)
    })
}

async function showProducts(productsData) {
    const productsContainer = document.getElementById('products')
    productsContainer.innerHTML = ''
    console.log('Data:',productsData);

    if (productsData.length == 0) {
        const productElement = document.createElement('div')
        productElement.innerHTML = `
        <div>No data available</div>
        `
        productsContainer.appendChild(productElement)
    }

    productsData && productsData.forEach(async product => {
        const productElement = document.createElement('div')
        productElement.classList.add('product')

        productElement.innerHTML = `
        <div class="item"><h2>${product.name}</h2>
        <p>Price: Ksh.${product.price}</p>
        <p>Units: ${product.available}</p>
        <button class="button" onclick="addToCart('${product.id}','${userInfo.id}','${product.name}',${product.price})">Add to Cart</button></div>
        `
        productsContainer.appendChild(productElement)
    })
    document.getElementById('products-Count').textContent = productsData ? `Showing ${productsData.length} products` : `Showing 0 products`
}

async function addToCart( id, userId, name, price ) {
    const res = await fetch(url + "products/" + id)
    const products = await res.json()

    if (products.available >= 0) {
        const cart = await fetch(url + "cart" )
        const cartData = await cart.json()
        const userCart = cartData.filter(data => data.userId == userId && data.itemName == name )

        if (userCart.length >= 1 ) {
            alert(`${name} already in the cart`)
        } else {
            let cartItem = { productId:id, userId, itemName:name, itemPrice:price, quantity: 1 };
            const res = await fetch(url + "cart", {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(cartItem)
            });

            if (res.ok) {
                const availableInt = parseInt(products.available)
                let newQuantity = availableInt - 1
                await fetch(url + "products/" + id, {
                    method: "PATCH",
                    body:JSON.stringify({available:newQuantity})
                })
                alert(`${name} added to the cart`)
            } else {
                alert(`There was a problem adding ${name} to the cart`)
            }
            location.reload()
        }
    } else {
        alert(`Sorry! ${name} is out of stock`)
    }
}

// cart page
async function getCart() {
    const stringData = await fetch(url + "cart")
    const cartData = await stringData.json()
    const userCartData = cartData.filter(data => data.userId == userInfo.id)

    let totalPrice = 0;
    document.getElementById('cart-count').textContent = userCartData ? `Cart (${userCartData.length})` : `Cart`

    const cartContainer = document.getElementById('cartpage')
    cartContainer.innerHTML = ''

    if (userCartData.length == 0) {
        const cartElement = document.createElement('div')
        cartElement.innerHTML = `
        <div>No items available in your cart. Add items to your cart to make orders.</div>
        `
        cartContainer.appendChild(cartElement)
    }

    userCartData && userCartData.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
        <div class="cart-item">
          ${item.itemName} - Ksh.${item.itemPrice} x ${item.quantity}
          <div class="cart-item-buttons">
            <button class="button" onclick="addItemQuantities('${item.id}','${item.quantity}','${item.productId}')">Add units (+)</button>
            <button class="button" onclick="reduceItemQuantities('${item.id}','${item.quantity}','${item.productId}')">Reduce units (-)</button>
            <button class="button" onclick="removeCartItem('${item.id}','${item.quantity}','${item.productId}')">Remove item (x)</button>
          </div>
        </div>`
        cartContainer.appendChild(listItem);
        totalPrice += item.itemPrice * item.quantity;
    });

    const checkoutButton = document.getElementById('order');
    checkoutButton.innerHTML = `Checkout ${totalPrice.toFixed(2)}`
    if (userCartData.length == 0) {
        checkoutButton.style.display = 'none'
    }
    checkoutButton.onclick = function() {
        pigaOrder(totalPrice.toFixed(2), userCartData);
    };

    const emptyCartBtn = document.getElementById('clearCart')
    if (userCartData.length ==0) {
        emptyCartBtn.style.display = 'none'
    }
    emptyCartBtn.onclick = function() {
        emptyCart(userCartData)
    }

  container.appendChild(checkoutButton);
}

async function addItemQuantities (id, quantity, productId ) {
    const result = await fetch(url + "products/" + productId)
    const products = await result.json()

    const quantityInt = parseInt(quantity)
    const availableInt = parseInt(products.available)

    if (products.available == 1) {
        alert('Item is out of stock')
        return
    }

    const newQuantity = quantityInt + 1;

    await fetch(url + "cart/" + id, {
        method: "PATCH",
        body:JSON.stringify({quantity:newQuantity})
    })

    const newprodQuantity = availableInt - 1;

    const res = await fetch(url + "products/" + productId, {
        method: "PATCH",
        body:JSON.stringify({available:newprodQuantity})
    })

    showPage('cart')
}

async function reduceItemQuantities(id, quantity, productId) {
    const quantityInt = parseInt(quantity)
    const result = await fetch(url + "products/" + productId)
    const products = await result.json()

    const availableInt = parseInt(products.available)

    if (quantity == 1) {
        removeCartItem(id, 1, productId)
        return
    }

    const newQuantity = quantityInt - 1;
    await fetch(url + "cart/" + id, {
        method: "PATCH",
        body:JSON.stringify({quantity:newQuantity})
    })

    const newprodQuantity =  availableInt + 1;
    await fetch(url + "products/" + productId, {
        method: "PATCH",
        body:JSON.stringify({available:newprodQuantity})
    })
    showPage('cart')
}

async function removeCartItem(id, quantity, productId) {
    const result = await fetch(url + "products/" + productId)
    const products = await result.json()

    const quantityInt = parseInt(quantity)
    const availableInt = parseInt(products.available)

    await fetch(url + "cart/" + id, {
        method: "DELETE",
    })
    const newprodQuantity = quantityInt + availableInt

    await fetch(url + "products/" + productId, {
        method: "PATCH",
        body:JSON.stringify({available:newprodQuantity})
    })
    showPage('cart')
}

async function emptyCart(data) {
    data.forEach(item => {
        removeCartItem(item.id, item.quantity, item.productId)
        showPage('cart')
    })
}

async function clearCart(id) {
    await fetch (url + "cart/" + id,{
        method: "DELETE"
    })
}

async function pigaOrder( price, data ) {
    let order = { date:getDateToday(), itemPrice:price, userId:userInfo.id, items:data };
    const response = await fetch(url + "orders", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    });

    if (response.ok) {
        alert('Order placed successfully')
        data.forEach(item => {
        clearCart(item.id)
    })
    showPage('cart')
    } else {
        alert('An error occured while placing the order')
    }
}

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

// orders page
async function getOrders(userOrders){

    document.getElementById('order-count').textContent = userOrders ? `Orders (${userOrders.length})` : `Orders`
    const ordersContainer = document.getElementById('orders')
    ordersContainer.innerHTML = ''

    if (userOrders.length == 0) {
        const orderElement = document.createElement('div')
        orderElement.innerHTML = `
        <div>You don't have orders currently.</div>
        `
        ordersContainer.appendChild(orderElement)
    }

    userOrders && userOrders.forEach(async order => {
        const orderElement = document.createElement('div')
        orderElement.classList.add('product')

        orderElement.innerHTML = `
        <div class="order-item">
        <div>
            <p>${order.date}</p>
            <p>Ordered items: ${order.items.length}</p>
        </div>
        <div>
            ${order.items.map(item => `<div class="">${item.itemName}:${item.quantity} x Ksh.${item.itemPrice}</div>`)}
        </div>
        <div>
            <p>Total Ksh.${order.itemPrice}</p>
            <button id="cancelOrder" class="button">Cancel order</button>
        </div>
        </div>
        `
        const deleteButton = orderElement.querySelector('button')
        deleteButton.addEventListener('click', () => deleteOrder(order.id));
        ordersContainer.appendChild(orderElement)
    })
}

async function deleteOrder(orderId) {
    // Returns items to store origimal no
    unOrderItems(orderId)
    try {
        const res = await fetch(url + 'orders/' + orderId, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert('Your order has been cancelled')
        }
        
        getOrders();
    } catch (error) {
        console.error("Error deleting order:", error);
        getOrders();
    }
}

async function unOrderItems(id) {
    const res = await fetch(url + 'orders/' + id)
    const orderToReturn = await res.json()
    const itemsToReturn = await orderToReturn.items

    if (res.ok) {
        itemsToReturn.forEach(item => {
            removeCartItem(item.id, item.quantity, item.productId)
        })
    }
}

// profile
async function showProfile() {
    const res = await fetch(url + 'users/' + userInfo.id)
    const profileData = await res.json()

    document.getElementById('usernameItem').textContent = profileData.username ? `Username: ${profileData.username} ` : ''
    document.getElementById('emailItem').textContent = profileData.email ? `Email: ${profileData.email}` : ''
    document.getElementById('passwordDisplay').textContent = profileData.password ? `Password: ${profileData.password}` : ''

    // Username
    const editUsernameContainer = document.getElementById('editUsernameContainer')
    const displayUsernameContainer = document.getElementById('showUsernameContainer')
    const editUsernameInput = document.getElementById('username')
    const saveUsernameBtn = document.getElementById('saveUsername')
    const usernameEdtBtn = document.getElementById('usernameBtn')

    // Email
    const editEmailContainer = document.getElementById('editEmailContainer')
    const displayEmailContainer = document.getElementById('showEmailContainer')
    const editEmailInput = document.getElementById('email')
    const saveEmailBtn = document.getElementById('saveEmail')
    const emailEdtBtn = document.getElementById('emailBtn')

    //Password
    const editPasswordContainer = document.getElementById('editPasswordContainer')
    const displayPasswordContainer = document.getElementById('showPasswordContainer')
    const editPasswordInput = document.getElementById('password')
    const savePasswordBtn = document.getElementById('savePassword')
    const passwordEdtBtn = document.getElementById('passwordBtn')

    editUsernameContainer.style.display='none'
    editEmailContainer.style.display='none'
    editPasswordContainer.style.display='none'

    //Edit
    function activeDisplay(editParams) {
        if (editEmailContainer.style.display == 'contents' || editUsernameContainer.style.display == 'contents' || editPasswordContainer.style.display == 'contents' ) {
            return;
        } else {
            if (editParams == 'username') {
                toggleEdit(editParams, profileData, editUsernameContainer, displayUsernameContainer, editUsernameInput)
            }
            if (editParams == 'email') {
                toggleEdit('email',profileData, editEmailContainer, displayEmailContainer, editEmailInput)
            }
            if (editParams == 'password') {
                toggleEdit('password',profileData, editPasswordContainer, displayPasswordContainer, editPasswordInput)
            }
        }
    }
    
    usernameEdtBtn.onclick = function() {
        activeDisplay('username')
    }

    emailEdtBtn.onclick = function() {
        activeDisplay('email')
    }
    
    passwordEdtBtn.onclick = function() {
        activeDisplay('password')
    }

    //Save
    saveEmailBtn.onclick = function() {
        saveChanges(editEmailInput, profileData, 'email')
    }
    
    saveUsernameBtn.onclick = function() {
        saveChanges(editUsernameInput, profileData, 'username')
    }
    
    savePasswordBtn.onclick = function() {
        saveChanges(editPasswordInput, profileData, 'password')
    }
}

async function toggleEdit(params, data, editContainer, displayContainer, input) {
    displayContainer.style.display='none'
    editContainer.style.display='contents'
    
    if (params == 'username') {
        input.value = `${data.username}`
    }

    if (params == 'email') {
        input.value = `${data.email}`
    }

    if (params == 'password') {
        input.value = `${data.password}`
    }
    return
}

async function saveChanges( input, userData, params ) {
    let updatedContent
    const data = await fetch(url + "users")
    const json = await data.json()

    if (params == 'username') {

        if (input.value == userData.username) {
            showPage('profile')
            return
        }

        const username = json.filter(data => data.username === input.value)

        if (username.length !== 0) {
            alert('This username already exists')
            return
        }

        updatedContent = {
            username:input.value
        }

        updateUserData(params, updatedContent)
    }

    if (params == 'email') {

        if (input.value == userData.email) {
            showPage('profile')
            return
        }

        const username = json.filter(data => data.email === input.value)

        if (username.length !== 0) {
            alert('This email already exists')
            return
        }

        updatedContent = {
            email:input.value
        }

        updateUserData(params, updatedContent)
    }

    if (params == 'password') {
        updatedContent = {
            password:input.value
        }

        updateUserData(params, updatedContent)
    }

    async function updateUserData(params,data) {
        const res = await fetch(url + "users/" + userInfo.id, {
            method: "PATCH",
            body:JSON.stringify(data)
        })

        if (res.ok) {
            alert(`Your ${params} changes saved`)
        } else {
            'There was a problem while saving your changes'
        }
    }

    showPage('profile')
}
