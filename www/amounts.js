function showAmounts(){

    fetch('/amounts', {credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if(res == '-1') { window.location.href = '/'; }
            else{
                var showTheAmount = document.getElementById("listOfAmounts");
                showTheAmount.innerText = '';
                var showData = '';

                Object.keys(res).forEach(function(userID) {
                    showData = showData + userID + ") " +" Amount: "+ res[userID] + "$" +"\n";
                });
                showTheAmount.innerText = showData;
            };
        })
};

function showDates(){

    fetch('/purchasesdate', {credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if(res == '-1') { window.location.href = '/'; }
            else{
                var showTheAmount = document.getElementById("listOfAmounts");
                showTheAmount.innerText = '';
                var showData = '';

                Object.keys(res).forEach(function(userID) {
                    showData = showData + userID + ") " +" Date: "+ res[userID] +"\n";
                });
                showTheAmount.innerText = showData;
            };
        })
};

function addAmount() {
    var purchaseAmount = document.getElementById("addAmountID").value;
    var purchaseDate = document.getElementById("addPurchaseDate").value;


    fetch('/amount', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ amount: purchaseAmount, purchasedate: purchaseDate})

        // TODO: check task id inside response from main.js - app.put('/product', function (req, res) {
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function(res_json){
        console.log(res_json);
        if(res_json== '-1') { window.location.href = '/'; }
        showAmounts();
        document.getElementById("addAmountID").value = '';
        document.getElementById("addPurchaseDate").value = '';

    });
}

function deleteAmount(){
    var userID = document.getElementById("deleteAmountID").value;
    fetch('/amount/' + userID, {
        method: 'DELETE',
        credentials: 'include'
    }).then(function (response) {
        return response.json();
    }).then(function(res_json){
        if (res_json == '-1') {
            window.location.href = '/';
        }
        else if(res_json == '0')
            showAmounts();
        else
            console.log("Unexpected error happened while attempting to remove an item");
        document.getElementById("deleteAmountID").value = "";
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

function clearAllContacts() {
}

function logout() {
    fetch('/users/logout', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(res => res.json())
        .then(res => {
            window.location.href = '/';
        })
}