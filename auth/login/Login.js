const username = document.getElementById('login-username');
const password = document.getElementById('login-password');
const BASEURL = 'http://localhost:3000/users';

async function logUser() {
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();
    });
    // Check if the fields are empty
    if (username.value == '' && password.value == '') {
        alert('Enter your login credentials')
        return
    }

    //check if the username only is empty
    if (username.value == '') {
        alert('Enter username')
        return
    }

    //is password empty
    if (password.value == '') {
        alert('Enter password')
        return
    }

    const isCredentialsValid = await checkCredentials(
        username.value,
        password.value
    )

    if (isCredentialsValid) {
        alert(`Welcome ${username.value}`);
        window.location.href = '../../products/products.html'
    } else {
        alert('Wrong Credentials');
    }
}

async function checkCredentials(username, password) {
    const response = await fetch(BASEURL, { method: 'GET' });
    const allUsers = await response.json();

    // Check if there is a user with the provided username and password
    const isValid = allUsers.some(
        (user) => user.username === username && user.password === password
    );

    if (isValid == true) {
        // Filter the users data then save it to the local storage
        const user = JSON.stringify(username);

        // Store the string in local storage
        localStorage.setItem('loggedInUser', user);
    }

    return isValid;
}
