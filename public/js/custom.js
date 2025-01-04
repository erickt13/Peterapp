// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if signature pad canvas exists
    const canvas = document.getElementById("signature-pad");
    if (!canvas) {
        return; // Exit if canvas doesn't exist
    }

    // Only try to get invoice ID if the canvas exists
    const headerElement = document.querySelector('H2.page-header');
    if (!headerElement) {
        console.error('Header element not found');
        return;
    }
    
    const invoiceId = headerElement.dataset.invoiceid;
    const customerSignatureImage = document.getElementById("customerSignature");
    
    // Initialize SignaturePad
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: "rgba(255, 255, 255, 0)",
        penColor: "rgb(0, 0, 0)",
    });

    // Get button elements
    const saveButton = document.getElementById("save");
    const cancelButton = document.getElementById("clear");
    const signatureInput = document.getElementById("signatureInput");

    // Verify all required elements exist
    if (!saveButton || !cancelButton || !signatureInput || !customerSignatureImage) {
        console.error('Required elements not found');
        return;
    }

    // Add save button event listener
    saveButton.addEventListener("click", function (e) {
        e.preventDefault();
        const data = signaturePad.toDataURL("image/png");
        
        customerSignatureImage.src = data;
        signatureInput.value = data;
        
        const updatedSignature = {
            signature: customerSignatureImage.src
        };
        
        signaturePad.clear();

        // fetch updating the signature
        fetch(`http://localhost:3000/invoices/${invoiceId}/signature`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedSignature),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Updated signature response:", data);
        })
        .catch(error => {
            console.error("Error:", error);
        });
    });

    // Add clear button event listener
    cancelButton.addEventListener("click", function (e) {
        e.preventDefault();
        signaturePad.clear();
    });
});


let productList = document.querySelector("#productList");
let addProduct = document.querySelector("#addProduct");
// let productTemplate = `This is a test`

function bcRender() {
    let svg = document.querySelectorAll(".barcode");

    svg.forEach(function (item) {
        let upcId = "#" + item.id;
        let mpn = item.dataset.mpn;

        if (mpn !== "" && mpn !== null) {
            JsBarcode(upcId, mpn, { format: "ean13" });
        }
        
    });
}

bcRender();

const clickProduct2 = (e) => {
    e.preventDefault();
     // this just gets the MPN from the selected product to use it in the for loop to compare to the product.id which is also the mpn.
     let scannedMPN = document.querySelector("#selectedMPN").value;
     let productSelect = document.querySelector("#selectedProduct");
     let selectIndex = productSelect.selectedIndex;
    //  let productId = document.querySelector("#selectedProduct").value;
    //  let invoiceId = document.querySelector(".invoiceId").dataset.invoiceid;
     let selectedProduct = productSelect[selectIndex];
     let productMPN;
 
     if (e.target.id === "addProduct") {
       productMPN = selectedProduct.dataset.mpn;
       console.log (productMPN);
     } else if (e.target.id === "addProductMPN"){
       productMPN = scannedMPN;
       console.log(productMPN);
     }
     console.log(e.target.id);
    // fetch data from the server
    fetch(`http://localhost:3000/invoices/${scannedMPN}/addproductbympn`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            if (data.errorMessage) {
                // alert(data.errorMessage);
                console.log(data.errorMessage);
                return;
            } else {
                
            addItem(data, productMPN);
            }
        });
};

const clickProduct = (e) => {
    e.preventDefault();

    // this just gets the MPN from the selected product to use it in the for loop to compare to the product.id which is also the mpn.
    let scannedMPN = document.querySelector("#selectedMPN").value;
    let productSelect = document.querySelector("#selectedProduct");
    let selectIndex = productSelect.selectedIndex;
    let productId = document.querySelector("#selectedProduct").value;
    // let invoiceId = document.querySelector(".invoiceId").dataset.invoiceid;
    let selectedProduct = productSelect[selectIndex];
    let productMPN;

    if (e.target.id === "addProduct") {
    productMPN = selectedProduct.dataset.mpn;
    producId = selectedProduct.value;
    console.log(productId);
    console.log(productMPN);
    } else if (e.target.id === "addProductMPN"){
      productMPN = scannedMPN;
      console.log(productMPN);
    }

    // fetch data from the server
    fetch(`http://localhost:3000/invoices/${productId}/addproductbyid`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data); // this gives back the product
            //get the products that are on the invoice product list.
            console.log(data);
            addItem(data, productId);
        })
        .catch((error) => console.error("Fetch error:", error));
};

// addProduct was already defined for the button
function addItem(data, productId){
  // This method returns a NodeList of all elements that match the specified selector
  products = document.querySelectorAll(".productId");
  const productsArray = Array.from(products);
  let productIndex = productsArray.length;
  console.log(productsArray);

  for (i = 0; i < products.length; i++) {
      if (productId === productsArray[i].id) {
          //get the duplicate elements
          console.log('the duplicate id is: ' + productId);
          let duplicatePrice = document.querySelector("[data-" + data._id + "price]");
          let duplicateQty = document.querySelector("[data-" + data._id + "qty]");
          let duplicateSubTotal = document.querySelector("[data-" + data._id + "subtotal]");
          //add quantity and calculate sub total
          duplicateQty.value = Number(duplicateQty.value) + 1;
          productTotal = Number(duplicatePrice.value) * duplicateQty.value;
          duplicateSubTotal.value = productTotal.toFixed(2);

          addTotal();
          return;
      }
  }

  const tableBody = document.querySelector(".tableBody");
  //create tr products
  // Create a row (tr)
  const row = document.createElement("tr");
  row.classList.add("table-row");
  const actions = document.createElement("div");
  actions.classList.add("actions");

  // Create 8 td elements and add form inputs to them
  for (let i = 0; i < 10; i++) {
      const td = document.createElement("td");

      // Customize the input based on the index (use switch)
      switch (i) {
          case 0: // source
              input = document.createElement("input");
              input.type = "text";
              input.name = `items[${productIndex}][source]`; // array name notation
              input.classList.add("source");
              input.placeholder = "Source";
              input.value = "Source";
              break;
          case 1: // notes
              input = document.createElement("input");
              input.type = "text";
              input.name = `items[${productIndex}][notes]`; // array name notation
              input.classList.add("notes");
              input.placeholder = "Enter Notes Here";
              input.value = "Notes";
              break;
          case 2: // mpn 
              input = document.createElement("input");
              input.type = "text";
              input.dataset[data.mpn + "mpn"] = data.mpn;
              input.name = `items[${productIndex}][mpn]`; // array name notation
              input.classList.add("mpn");
              input.id = data._id;
              input.value = data.mpn;
              input.readOnly = true;
              break;
            case 3: // product Id 
            input = document.createElement("input");
            input.type = "text";
            input.name = `items[${productIndex}][productId]`; // array name notation
            input.classList.add("productId");
            input.id = data._id;
            input.value = data._id;
            input.readOnly = true;
        break;
          case 4: // description
              input = document.createElement("input");
              input.type = "text";
              input.name = `items[${productIndex}][description]`; // array name notation
              input.id = data._id;
              input.classList.add("description");
              input.value = data.description;
              input.readOnly = true;
              break;
          case 5: // price
              input = document.createElement("input");
              input.type = "text";
              input.dataset[data._id + "price"] = data._id;
              input.name = `items[${productIndex}][price]`; // array name notation
              input.classList.add("price");
              input.value = data.price;
              input.readOnly = true;
              break;
          case 6: // quantity
              input = document.createElement("input");
              input.type = "number";
              input.name = `items[${productIndex}][quantity]`; // array name notation
              input.dataset[data._id + "qty"] = data._id;
              input.classList.add("quantity");
              input.placeholder = 1;
              input.value = parseFloat(1);
              break;
          case 7: // sub total
              input = document.createElement("input");
              input.type = "text";
              input.dataset[data._id + "subtotal"] = data._id;
              input.name = `items[${productIndex}][subTotal]`; // array name notation
              input.classList.add("subTotal");
              input.readOnly = true;

              const price = parseFloat(data.price);
              const quantity = parseFloat(1);

            //   console.log(price);
            //   console.log(quantity);

              if (isNaN(price) || isNaN(quantity)) {
                  console.error("Invalid input: price or quantity is not a valid number.");
              } else {
                  input.value = price * quantity;
                  // console.log = (input.value);
              }
              break;
          case 8: // done button
              input = document.createElement("input");
              input.type = "checkbox";
              input.name = `items[${productIndex}][status]`;
              input.value = "false";
              input.classList.add("done");
              input.id = `doneCheckbox_${productIndex}`; // Give it a unique ID

              // Append the checkbox and label to the td
              td.appendChild(input);
              // td.appendChild(label);
              break;
          case 9: // remove button
              input = document.createElement("button");
              input.type = "button";
              input.classList.add("btn");
              input.classList.add("btn-danger");
              input.innerHTML = "Remove";
              break;
      }
      addTotal();

      // Append the input to the td
      actions.appendChild(td);
      td.appendChild(input);
      // Append the td to the row
      row.appendChild(td);
      tableBody.appendChild(row);
  }
  // only need this if you are rendering barcode in the edig page.
  // renderBarcode();
}

function renderBarcode(){
  // Define the SVG namespace
  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  // const textNode = document.createTextNode(data.description + ' ' + data.price);

  // Add id class and dataset to svg and get the upc id and mpn to render the svg
  svg.id = "id" + data.mpn; // Can't start ID name with a number, so we use id + number
  svg.classList.add("barcode"); // Corrected this line
  svg.dataset.mpn = data.mpn;
  let upcId = "#" + svg.id; // id of div to render svg
  let mpn = svg.dataset.mpn; //mpn number to render the barcode

  // render the svg barcode in the upcId div with the mpn number
  JsBarcode(upcId, mpn, { format: "ean13" });
}

addProduct.addEventListener("click", clickProduct);
addProductMPN.addEventListener("click", clickProduct2);



// Add event listener to the container of the product list
productList.addEventListener("click", function (e) {
    // Check if the clicked element is the dynamically added element
    if (e.target && e.target.matches(".btn-danger")) {
        // get the parent formRow and remove it.
        const formRow = e.target.closest(".form-row");
        formRow.remove();
        addTotal();
    }
});

// Add event listener to the container of the product list
productList.addEventListener("click", function (e) {
    // Check if the clicked element is the dynamically added element
    if (e.target && e.target.matches(".btn-danger")) {
        // get the parent formRow and remove it.
        const tableRow = e.target.closest(".table-row");
        tableRow.remove();
        addTotal();
    }
});

// Add event listener to the container of the product list
productList.addEventListener("change", function (e) {
    // Check if the element that changed is the quantity element
    if (e.target && e.target.matches(".quantity")) {
        // get the price quantity and subTotal
        const price = e.target.previousElementSibling.value;
        const quantity = e.target.value;
        const subTotal = e.target.nextElementSibling;
        let productTotal = 0;
        productTotal = parseFloat(price * quantity);
        subTotal.value = productTotal.toFixed(2);

        addTotal();
    }
});

// Add event listener to the container of the product list
productList.addEventListener("change", function (e) {
    // Check if the element that changed is the quantity element
    if (e.target && e.target.matches(".quantity")) {
        // get the price quantity and subTotal
        const tableRow = e.target.closest(".table-row");
        const price = tableRow.querySelector(".price").value;
        const quantity = e.target.value;
        const subTotal = tableRow.querySelector(".subTotal");
        let productTotal = 0;
        productTotal = parseFloat(price * quantity);
        subTotal.value = productTotal.toFixed(2);

        addTotal();
    }
});

// Add event listener to the container of the product list
productList.addEventListener("change", function (e) {
    // Check if the element that changed is the checkbox element
    if (e.target && e.target.matches(".done")) {
        // get the row
        let tableRow = e.target.closest(".table-row");
        let checkbox = tableRow.querySelector(".done");
        if (checkbox.checked) {
            console.log("Checkbox is checked!");
            tableRow.classList.add("done");
            checkbox.value = true;
        } else {
            tableRow.classList.remove("done");
            console.log("Checkbox is unchecked!");
            checkbox.value = false;
        }
    }
});

// function to add total
function addTotal() {
    let amounts = document.querySelectorAll(".subTotal");
    let total = document.querySelector("#totalSum");
    let sum = 0;
    if (amounts.length === 0) {
        total.value = 0.0;
    }
    amounts.forEach(function (item) {
        sum += parseFloat(item.value);
        total.value = sum.toFixed(2);
    });
}

// sorting of columns start here

// Function to sort the table rows based on a given column index
function sortTable(n, isCheckbox = false) {
    let table = document.querySelector("table");
    let rows = Array.from(table.rows).slice(1); // Skip header row
    let sortedRows;

    if (isCheckbox) {
        // Sorting for Done Status (checkbox)
        sortedRows = rows.sort((a, b) => {
            let aChecked = a.cells[n].querySelector("input[type='checkbox']").checked;
            let bChecked = b.cells[n].querySelector("input[type='checkbox']").checked;
            return aChecked - bChecked; // Sort by checked status (false -> 0, true -> 1)
        });
    } else {
        // Sorting for Source (text) column
        sortedRows = rows.sort((a, b) => {
            let aText = a.cells[n].querySelector("input[type='text']").value.toLowerCase();
            let bText = b.cells[n].querySelector("input[type='text']").value.toLowerCase();
            return aText.localeCompare(bText); // Sort by alphabetic order
        });
    }

    // Reorder the rows in the table
    table.tBodies[0].innerHTML = ""; // Clear existing rows
    table.tBodies[0].append(...sortedRows); // Append sorted rows
}

// Add click event listener for Source column sorting
document.getElementById("source-header").addEventListener("click", () => {
    sortTable(0); // 0 is the index for the "Source" column
});

// Add click event listener for Done Status column sorting
document.getElementById("status-header").addEventListener("click", () => {
    sortTable(8, true); // 6 is the index for the "Done Status" column (checkbox)
});