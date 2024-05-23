const username = document.getElementById('login-username');
const password = document.getElementById('login-password');
const BASEURL = 'http://localhost:3000/users';

async function logUser() {
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();
    });
    // getSingleUsername();

    const isCredentialsValid = await checkCredentials(
        username.value,
        password.value
    );

    if (isCredentialsValid) {
        alert(`Welcome ${username.value}`);
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

    return isValid;
}
