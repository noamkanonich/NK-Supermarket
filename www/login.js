addKeyUpListeners(['username', 'pw']);

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

function submit(username, password) {

    if (!username || !password) {
        alert("username or password cannot be empty!");
        return;
    }

    fetch('/users/login', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ user: username, pass: password })
    })
        .then(res => res.json())
        .then(res => {
            console.log(res);
           if (res == '0') {
               window.location.href = "/home.html";
           }
            else if(res == '2'){
                    location.reload();
                    alert("Wrong password. Please try again!");
            } else if(res == '1'){
                alert("The username does not exist. entering to register page!");
                window.location.href = "/register.html";
            }
            //else {
              //  console.log(res)
                //alert("error has occured");
            //}
        });

}