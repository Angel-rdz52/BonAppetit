// URL RAW del JSON en GitHub
const JSON_URL = "https://raw.githubusercontent.com/Angel-rdz52/BonAppetit/main/menu.json";

let data = { menu: [] };

/* ========================= */
/* CARGA AUTOMÁTICA */
/* ========================= */

async function loadJSON() {
  try {
    const res = await fetch(JSON_URL);

    if (!res.ok) throw new Error("No se pudo cargar el JSON");

    data = await res.json();
    render();

  } catch (error) {
    console.error(error);
    alert("Error cargando el menú desde GitHub");
  }
}

// Ejecutar al abrir
loadJSON();

/* ========================= */
/* RENDER */
/* ========================= */

function render(){

const container = document.getElementById("menu");
container.innerHTML="";

data.menu.forEach((category, cIndex)=>{

const catDiv = document.createElement("div");
catDiv.className="category";

/* header */

const header = document.createElement("div");
header.className="category-header";

const title = document.createElement("input");
title.value = category.category;
title.className="category-title";
title.oninput = ()=> category.category = title.value;

const actions = document.createElement("div");

const addBtn = document.createElement("button");
addBtn.innerText="+ Producto";
addBtn.className="add-btn";
addBtn.onclick = ()=> addItem(cIndex);

const deleteBtn = document.createElement("button");
deleteBtn.innerText="Eliminar";
deleteBtn.className="delete-btn";
deleteBtn.onclick = ()=>{
data.menu.splice(cIndex,1);
render();
};

actions.appendChild(addBtn);
actions.appendChild(deleteBtn);

header.appendChild(title);
header.appendChild(actions);

catDiv.appendChild(header);

/* items */

category.items.forEach((item, iIndex)=>{

const itemDiv = document.createElement("div");
itemDiv.className="item";

/* name */

const name = document.createElement("input");
name.value = item.name;
name.oninput = ()=> item.name = name.value;

itemDiv.appendChild(name);

/* prices */

const priceGroup = document.createElement("div");
priceGroup.className="price-group";

if(item.variants){

item.variants.forEach((v)=>{

const label = document.createElement("span");
label.innerText = v.label;

const input = document.createElement("input");
input.type="number";
input.value=v.price;

input.oninput = ()=> v.price = parseFloat(input.value);

priceGroup.appendChild(label);
priceGroup.appendChild(input);

});

}else{

const input = document.createElement("input");
input.type="number";
input.value=item.price;

input.oninput = ()=> item.price = parseFloat(input.value);

priceGroup.appendChild(input);

}

/* delete */

const del = document.createElement("button");
del.innerText="X";
del.className="delete-btn";
del.onclick=()=>{
category.items.splice(iIndex,1);
render();
};

priceGroup.appendChild(del);

itemDiv.appendChild(priceGroup);

catDiv.appendChild(itemDiv);

});

container.appendChild(catDiv);

});

}

/* ========================= */
/* AGREGAR CATEGORÍA */
/* ========================= */

function addCategory(){
data.menu.push({
category:"Nueva categoría",
items:[]
});
render();
}

/* ========================= */
/* AGREGAR PRODUCTO */
/* ========================= */

function addItem(cIndex){

const type = confirm("Aceptar = con tamaños CH/G\nCancelar = precio único");

if(type){

data.menu[cIndex].items.push({
name:"Nuevo producto",
variants:[
{label:"CH",price:0},
{label:"G",price:0}
]
});

}else{

data.menu[cIndex].items.push({
name:"Nuevo producto",
price:0
});

}

render();
}

/* ========================= */
/* DESCARGAR JSON */
/* ========================= */

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
