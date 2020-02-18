function showProductsList(){

    fetch('/products', {credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if(res=='-1') { window.location.href = '/'; }
            else{
                let typesOfProducts = ["Vegetables", "Fruits", "Meat", "Drinks", "Others"];
                var showProductsElement = document.getElementById("listOfProducts");
                showProductsElement.innerText = '';
                var showData = '';

                Object.keys(res).forEach(function(typeOfProductKey) {
                    showData = showData + typesOfProducts[typeOfProductKey] + " Products :\n";
                    Object.keys(res[typeOfProductKey]).forEach(function(idProductKey) {
                        showData = showData + idProductKey + ") " + res[typeOfProductKey][idProductKey] + "\n";
                    });
                    showData = showData + "\n";

                });

                showProductsElement.innerText = showData;
            };
        })
};

function showTheSpecificProductsList(typeOfProductKey){

    fetch('/products/' + typeOfProductKey, {credentials: 'include'})
        .then(function(response) {
            return response.json();
        })
        .then(function(res) {
            if(res=='-1') { window.location.href = '/'; }
            else{
                let typesOfProducts = {vegetablesProducts: "Vegetables", fruitsProducts: "Fruits", meatProducts: "Meat", drinksProducts: "Drinks", otherProducts: "Others"};
                var showProductsElement = document.getElementById("listOfProducts");
                showProductsElement.innerText = '';
                var showData = '';
                showData = showData + typesOfProducts[typeOfProductKey] + " Products :\n";
                Object.keys(res).forEach(function(idProductKey) {
                    showData =  showData + idProductKey + ") " + res[idProductKey] + "\n";
                });
                showProductsElement.innerText = showData;
            };
        })
};


function addProductToList() {
    var newProduct = document.getElementById("addProduct").value;
    for(var i = 0 ; i < 5 ; i++){
        if(document.getElementsByName("typeOfProduct")[i].checked == true)
            var typeOfProduct = document.getElementsByName("typeOfProduct")[i].value;
    }
    fetch('/product', {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ typeOfProduct: typeOfProduct, product: newProduct})
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function(res_json){
        console.log(res_json);
        if(res_json== '-1') { window.location.href = '/'; }
        showProductsList();
        document.getElementById("addProduct").value = "";
    });
}

function deleteProductFromList(){
    var idProd = document.getElementById("deleteProduct").value;
    fetch('/product/' + idProd, {
        method: 'DELETE',
        credentials: 'include'
    }).then(function (response) {
        return response.json();
    }).then(function(res_json){
        if (res_json == '-1') {
            window.location.href = '/';
        }
        else if(res_json == '0')
            showProductsList();
        else
            console.log("Unexpected error happened while attempting to remove an item");
        document.getElementById("deleteProduct").value = "";
    });
}

function editCurrentProductFromList() {

    var newProd = document.getElementById("newProduct").value;
    var idProd = document.getElementById("productID").value;

    fetch('/product/' + idProd, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({product: newProd})
    }).then(function (response) {
        return response.json();
    }).then(function (res_json) {
        if (res_json == '-1') {
            window.location.href = '/'; }
        else if (res_json == '0')
            showProductsList();
        else
            console.log("Unexpected error happened while attempting to edit an existing item");
        document.getElementById("newProduct").value = '';
        document.getElementById("productID").value = '';
    });
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

function clearTheDataBase(){
    console.log("Attempting to clear database");
    fetch('/clearDatabase', {credentials: 'include'})
        .then(function(response) {
            alert("Database cleared");
        })
}