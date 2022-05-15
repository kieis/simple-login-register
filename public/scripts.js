async function loggin(){
    const usernameElemn = document.querySelector('#formUsername');
    const passwordElemn = document.querySelector('#formPassword');

    const response = await fetch('../auth', {
        method: 'POST',
        body: JSON.stringify({
            username: usernameElemn.value,
            password: passwordElemn.value
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

    const errorElemn = document.querySelector('#formError');
    const status = response.status;
    switch(status) {
        case 200:
            window.location.href = '../successfully';
            break;
        case 401:
            errorElemn.textContent = 'Unauthorized user, something is wrong with your credentials.';
            break;
        case 404:
            errorElemn.textContent = 'User not found, this user is not part of our database.';
            break;
        default:
            break;
    }
}

async function register(){
    const usernameElemn = document.querySelector('#formUsername');
    const emailElemn = document.querySelector('#formEmail');
    const passwordElemn = document.querySelector('#formPassword');

    const response = await fetch('../reguser', {
        method: 'POST',
        body: JSON.stringify({
            email: emailElemn.value,
            username: usernameElemn.value,
            password: passwordElemn.value
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

    const errorElemn = document.querySelector('#formError');
    const status = response.status;
    switch(status) {
        case 201:
            window.location.href = '../successfully';
            break;
        case 406:
            errorElemn.textContent = 'Invalid input.';
            break;
        case 409:
            errorElemn.textContent = 'User or email already exist.';
            break;
        default:
            break;
    }
}