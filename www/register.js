addKeyUpListeners(['name', 'username', 'pw', 'pw-verify']);

function addKeyUpListeners(ids) {
    for (let i = 0; i < ids.length; i++) {
        let input = document.getElementById(ids[i]);

        input.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                document.getElementById("submit").click();
            }
        });
    }
}

function submit(name, username, password, password2) {

    if (!name || !username || !password || !password2) {
        alert("There is an empty field");
        return;
    } else if (password !== password2) {
        alret("The passwords does not match");
        return;
    }

    fetch('/users/register', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name, user: username, pass: password })
    })
        .then(res => res.json())
        .then(res => {
            if (res == '0') {
                alert("Register complete. you will now enter to the login page!");
                window.location.href = "/";
            } else if (res == '1') {
                alert("The username is already exists!");
            } else {
                alert("error has occured");
            }
        });
}