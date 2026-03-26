// ===============================
// URL JSON (RAW GITHUB)
// ===============================

const JSON_URL = "https://raw.githubusercontent.com/Angel-rdz52/BonAppetit/main/ModMenu/menuTest.json";

let data = { menu: [] };


// ===============================
// CARGA AUTOMÁTICA
// ===============================

async function loadJSON() {
  try {

    const res = await fetch(JSON_URL);

    if (!res.ok) throw new Error("No se pudo cargar JSON");

    data = await res.json();

    render();

  } catch (error) {

    console.error(error);
    alert("Error cargando menú");

  }
}

loadJSON();


// ===============================
// RENDER
// ===============================

function render(){

const container = document.getElementById("menu");
container.innerHTML = "";

data.menu.forEach((category, cIndex)=>{

// =====================
// CATEGORY
// =====================

const catDiv = document.createElement("div");
catDiv.className = "category";

const header = document.createElement("div");
header.className = "category-header";

const title = document.createElement("input");
title.className = "category-title";
title.value = category.category;
title.placeholder = "Nombre de categoría";

title.oninput = () => {
category.category = title.value;
};

const actions = document.createElement("div");

const addBtn = document.createElement("button");
addBtn.innerText = "+ Producto";
addBtn.className = "add-btn";
addBtn.onclick = ()=> addItem(cIndex);

const deleteBtn = document.createElement("button");
deleteBtn.innerText = "Eliminar";
deleteBtn.className = "delete-btn";

deleteBtn.onclick = ()=>{
if(confirm("¿Eliminar categoría completa?")){
data.menu.splice(cIndex,1);
render();
}
};

actions.appendChild(addBtn);
actions.appendChild(deleteBtn);

header.appendChild(title);
header.appendChild(actions);

catDiv.appendChild(header);


// =====================
// ITEMS
// =====================

category.items.forEach((item, iIndex)=>{

const itemDiv = document.createElement("div");
itemDiv.className = "item";


// =====================
// NAME
// =====================

const name = document.createElement("input");
name.value = item.name;
name.placeholder = "Nombre del producto";

name.oninput = ()=>{
item.name = name.value;
};

itemDiv.appendChild(name);


// =====================
// PRICE GROUP
// =====================

const priceGroup = document.createElement("div");
priceGroup.className = "price-group";


// =====================
// VARIANTS
// =====================

if(item.variants){

let ch = item.variants.find(v=>v.label==="CH");
let g  = item.variants.find(v=>v.label==="G");

// CH
const chInput = document.createElement("input");
chInput.type="number";
chInput.placeholder="CH";
chInput.value = ch ? ch.price : "";

chInput.oninput = ()=>{
if(!ch){
item.variants.push({label:"CH",price:0});
ch = item.variants.find(v=>v.label==="CH");
}
ch.price = parseFloat(chInput.value);
};

priceGroup.appendChild(chInput);


// G
const gInput = document.createElement("input");
gInput.type="number";
gInput.placeholder="G";
gInput.value = g ? g.price : "";

gInput.oninput = ()=>{
if(!g){
item.variants.push({label:"G",price:0});
g = item.variants.find(v=>v.label==="G");
}
g.price = parseFloat(gInput.value);
};

priceGroup.appendChild(gInput);

}
else{

// precio único
const price = document.createElement("input");
price.type="number";
price.placeholder="Precio";
price.value = item.price || "";

price.oninput = ()=>{
item.price = parseFloat(price.value);
};

priceGroup.appendChild(price);
priceGroup.appendChild(document.createElement("div"));

}


// =====================
// DELETE ITEM
// =====================

const del = document.createElement("button");
del.innerText = "Eliminar";
del.className = "delete-btn";

del.onclick = ()=>{
if(confirm("¿Eliminar producto?")){
category.items.splice(iIndex,1);
render();
}
};

itemDiv.appendChild(priceGroup);
itemDiv.appendChild(del);

catDiv.appendChild(itemDiv);

});

container.appendChild(catDiv);

});

}


// ===============================
// AGREGAR CATEGORIA
// ===============================

function addCategory(){

data.menu.push({
category:"Nueva categoría",
items:[]
});

render();

}


// ===============================
// AGREGAR PRODUCTO
// ===============================

function addItem(cIndex){

const type = confirm(
"Aceptar = con tamaños CH / G\nCancelar = precio único"
);

if(type){

data.menu[cIndex].items.push({
name:"Nuevo producto",
variants:[
{label:"CH",price:0},
{label:"G",price:0}
]
});

}
else{

data.menu[cIndex].items.push({
name:"Nuevo producto",
price:0
});

}

render();

}


// ===============================
// DESCARGAR JSON
// ===============================

function downloadJSON(){

const blob = new Blob(
[JSON.stringify(data,null,2)],
{type:"application/json"}
);

const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download="menu.json";
a.click();

}
