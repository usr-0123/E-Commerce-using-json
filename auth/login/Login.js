const username = document.getElementById('login-username');
const password = document.getElementById('login-password');
const BASEURL = 'http://localhost:3000/users';

async function logUser() {
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();
    });

    if (username.value == '' && password.value == '') {
        alert('Enter your login credentials')
        return
    }

    if (username.value == '') {
        alert('Enter username')
        return
    }

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
        window.location.href = '../../main/app.html'
    } else {
        alert('Wrong Credentials');
    }
}

async function checkCredentials(username, password) {
    const response = await fetch(BASEURL, { method: 'GET' });
    const allUsers = await response.json();
    
    const isValid = allUsers.some(
        (user) => user.username === username && user.password === password
    );

    if (allUsers.length == 1 || isValid) {

        const userData = allUsers.filter(data => data.username == username)
        const tokenTime = new Date()
        const user = {id:userData[0].id, email:userData[0].email, username:userData[0].username, tokenTime}
        const data = JSON.stringify({user})

        localStorage.setItem('loggedInUser', data);

        return true
    } else {
        return false
    }
}
