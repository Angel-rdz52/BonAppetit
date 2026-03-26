// ===============================
// CONFIGURACION
// ===============================

const OWNER = "Angel-rdz52";
const REPO = "BonAppetit";
const PATH = "ModMenu/menuTest.json";
const BRANCH = "main";

/* ===================================================== */
/* 🔴 PEGA TU TOKEN AQUI (LINEA IMPORTANTE) */
/* ===================================================== */
const TOKEN = "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";
/* ===================================================== */


const JSON_URL =
`https://raw.githubusercontent.com/Angel-rdz52/BonAppetit/main/ModMenu/menuTest.json`;

let data = { menu: [] };


// ===============================
// CARGAR JSON AUTOMATICAMENTE
// ===============================

async function loadJSON() {

try {

const res = await fetch(JSON_URL);
data = await res.json();

render();

} catch (error) {

console.error(error);
alert("Error cargando menú");

}

}

loadJSON();


// ===============================
// GUARDAR EN GITHUB
// ===============================

async function saveToGitHub(){

try{

// obtener SHA actual
const get = await fetch(
`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
{
headers:{
Authorization:`token ${TOKEN}`
}
}
);

const file = await get.json();

// convertir a base64
const content = btoa(
unescape(
encodeURIComponent(
JSON.stringify(data,null,2)
)
)
);

// subir archivo
await fetch(
`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
{
method:"PUT",
headers:{
Authorization:`token ${TOKEN}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"Actualizar menú desde editor",
content:content,
sha:file.sha,
branch:BRANCH
})
}
);

alert("Guardado en GitHub ✔");

}catch(e){

console.error(e);
alert("Error guardando en GitHub");

}

}


// ===============================
// RENDER
// ===============================

function render(){

const container = document.getElementById("menu");
container.innerHTML="";

data.menu.forEach((category, cIndex)=>{

const catDiv = document.createElement("div");
catDiv.className="category";

const header = document.createElement("div");
header.className="category-header";

const title = document.createElement("input");
title.className="category-title";
title.value = category.category;

title.oninput = ()=>{
category.category = title.value;
};

const actions = document.createElement("div");

const addBtn = document.createElement("button");
addBtn.innerText="+ Producto";
addBtn.className="add-btn";
addBtn.onclick=()=>addItem(cIndex);

const deleteBtn = document.createElement("button");
deleteBtn.innerText="Eliminar";
deleteBtn.className="delete-btn";

deleteBtn.onclick=()=>{
if(confirm("Eliminar categoría completa?")){
data.menu.splice(cIndex,1);
render();
}
};

actions.appendChild(addBtn);
actions.appendChild(deleteBtn);

header.appendChild(title);
header.appendChild(actions);

catDiv.appendChild(header);


// ================= ITEMS =================

category.items.forEach((item, iIndex)=>{

const itemDiv = document.createElement("div");
itemDiv.className="item";

// nombre
const name = document.createElement("input");
name.value = item.name;

name.oninput=()=>{
item.name=name.value;
};

itemDiv.appendChild(name);


// precios
const priceGroup = document.createElement("div");
priceGroup.className="price-group";

if(item.variants){

let ch = item.variants.find(v=>v.label==="CH");
let g  = item.variants.find(v=>v.label==="G");

// CH
const chInput=document.createElement("input");
chInput.type="number";
chInput.placeholder="CH";
chInput.value=ch?ch.price:"";

chInput.oninput=()=>{
if(!ch){
item.variants.push({label:"CH",price:0});
ch=item.variants.find(v=>v.label==="CH");
}
ch.price=parseFloat(chInput.value);
};

priceGroup.appendChild(chInput);


// G
const gInput=document.createElement("input");
gInput.type="number";
gInput.placeholder="G";
gInput.value=g?g.price:"";

gInput.oninput=()=>{
if(!g){
item.variants.push({label:"G",price:0});
g=item.variants.find(v=>v.label==="G");
}
g.price=parseFloat(gInput.value);
};

priceGroup.appendChild(gInput);

}else{

const price=document.createElement("input");
price.type="number";
price.value=item.price||"";

price.oninput=()=>{
item.price=parseFloat(price.value);
};

priceGroup.appendChild(price);
priceGroup.appendChild(document.createElement("div"));

}

const del=document.createElement("button");
del.innerText="Eliminar";
del.className="delete-btn";

del.onclick=()=>{
if(confirm("Eliminar producto?")){
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
// AGREGAR
// ===============================

function addCategory(){

data.menu.push({
category:"Nueva categoría",
items:[]
});

render();

}

function addItem(cIndex){

const type=confirm(
"Aceptar = CH/G\nCancelar = precio único"
);

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
