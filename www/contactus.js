function showMessages(){

    fetch('/messages', {credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if(res == '-1') { window.location.href = '/'; }
            else{
                var showContactsElement = document.getElementById("listOfAmounts");
                showContactsElement.innerText = '';
                var showData = '';

                Object.keys(res).forEach(function(userID) {
                    showData = showData + userID + ") " +" Amount: "+ res[userID] + "$" +"\n";
                });
                showContactsElement.innerText = showData;
            };
        })
};

function addContactMessage() {
    var userMessage = document.getElementById("messages").value;
    var userNameMessage = document.getElementById("fullname").value;
    var userPhoneNumberMessage = document.getElementById("phonenumber").value;

    fetch('/message', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage, fullname: userNameMessage, phonenumber: userPhoneNumberMessage})

        // TODO: check task id inside response from main.js - app.put('/product', function (req, res) {
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function(res_json){
        console.log(res_json);
        if(res_json== '-1') { window.location.href = '/'; }
        showMessages();
        document.getElementById("messages").value = "";
        document.getElementById("fullname").value = "";
        document.getElementById("phonenumber").value = "";

    });
}


function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}


