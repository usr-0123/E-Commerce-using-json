const BASEURL = 'http://localhost:3000/users';
const userName = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const response = document.getElementById('response');
const form = document.getElementById('signup');

async function registerUser() {
    document.querySelector('form').addEventListener('submit', function (event) {
        event.preventDefault();
    });
    //password validation checks
    let pwd = password.value;
    let uid = userName.value;
    let isExisting = await getUserNames(uid);

    console.log(isExisting);

    if (pwd.trim() == '' || pwd.length < 8) {
        alert(
            'Passwords should contain ATLEAST 8 characters exclusive of whitespaces'
        );
    }
    if (isExisting) {
        alert('Username is already taken');
        // console.log('Taken');
    } else {
        let newUser = {
            username: userName.value,
            email: email.value,
            password: password.value,
        };
        fetch(BASEURL, {
            method: 'POST',
            body: JSON.stringify(newUser),
        });
        alert('Your Account has been created successfully');
    }
}
async function getUserNames(usernames) {
    const response = await fetch(BASEURL, { method: 'GET' });
    const allUsers = await response.json();
    const allUserNames = await allUsers.map((user) => user.username);
    const name = allUserNames.includes(usernames);
    return name;
}
getUserNames();
