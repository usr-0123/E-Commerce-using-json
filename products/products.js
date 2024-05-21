const baseURL = "http://localhost:3000/";
let cart = [];

async function getProducts() {
  const response = await fetch(baseURL + "products");
  const data = await response.json();
  showData(data);
}

getProducts();

function showData(data) {
  const itemsContainer = document.getElementById('items');
  itemsContainer.innerHTML = '';
  data.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';
    itemDiv.innerHTML = `
      <h2>${item.name}</h2>
      <p>Price: Ksh.${item.price}</p>
      <p>Units: ${item.available}</p>
      <button onclick="addToCart(${item.id},'${item.name}', ${item.price}, ${item.available})">Add to Cart</button>
    `;
    itemsContainer.appendChild(itemDiv);
  });
  updateCartCount()
}

async function addToCart( itemId, itemName, itemPrice, itemAvailable) {
  if (itemAvailable > 0) {
    const existingCartItem = cart.find(cartItem => cartItem.itemName === itemName);
    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      let cartItem = { itemName, itemPrice, quantity: 1 };
      cart.push(cartItem);
      await fetch(baseURL + "cart", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartItem)
      });
    }
    let newCount = { available: itemAvailable - 1 };
    await updateProducts(itemName, newCount);
    getProducts(); // Refresh the product list to show updated stock
  } else {
    alert('Item is out of stock');
  }
}

async function updateCartCount() {
  let cart = await fetch(baseURL + "cart");
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  document.getElementById('cart-count').textContent = cartCount
  alert(cartCount)
}

async function updateProducts(itemId, newCount) {
  await fetch(baseURL + "products/" + itemId, {
    method: "PUT",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newCount),
  });
}

// async function updatePost(id) {
  //prepopulate()-inputs and buttons

  // get  the post with that id
  // let response = await fetch(baseURL + id);
  // let post = await response.json();
  // console.log(post);
  // if (post.id) {
    // prepopulate(post);

    //
    // btn.addEventListener("click", async () => {
    //   if (btn.textContent === "update") {
    //     let updatedPost = {
    //       title: title.value,
    //       body: content.value,
    //       id
    //     };
    //     await sendRequest(updatedPost);
      // }
    // });
  // }
  //update
// }


// async function sendRequest({ id ,...updatedPost}){
//     await fetch(baseURL+id, {
//         method: "PUT",
//         body: JSON.stringify(updatedPost),
//       });
// }


// async function deletePost(id){
//     await fetch(baseURL+id, {
//         method: "DELETE"    
//     });
// }
// function prepopulate(post) {
//   content.value = post.body;
//   title.value = post.title;
//   btn.textContent = "update";
// }
// btn.addEventListener("click", createPost);