// ===============================
// CONFIG
// ===============================

const OWNER = "Angel-rdz52";
const REPO = "BonAppetit";
const PATH = "ModMenu/menuTest.json";
const BRANCH = "main";

/* 🔴 PEGA TU TOKEN AQUÍ */
const TOKEN = "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";

const JSON_URL =
`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${PATH}`;

let data = { menu: [] };


// ===============================
// LOAD JSON
// ===============================

async function loadJSON(){

try{

console.log("Cargando JSON...");

const res = await fetch(JSON_URL);

data = await res.json();

console.log("JSON cargado:", data);

render();

}catch(e){

console.error("Error cargando JSON", e);

alert("Error cargando menú");

}

}

loadJSON();


// ===============================
// SAVE GITHUB
// ===============================

async function saveToGitHub(){

try{

console.log("Guardando en GitHub...");

// obtener SHA
const get = await fetch(
`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`,
{
headers:{
Authorization:`token ${TOKEN}`
}
}
);

const file = await get.json();

console.log("SHA:", file.sha);

const content = btoa(
unescape(
encodeURIComponent(
JSON.stringify(data,null,2)
)
)
);

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

console.log("Guardado OK");

alert("Guardado correctamente ✔");

}catch(e){

console.error("Error guardando", e);

alert("Error guardando");

}

}


// ===============================
// RENDER
// ===============================

function render(){

const container = document.getElementById("menu");

container.innerHTML="";

data.menu.forEach((category,cIndex)=>{

const cat = document.createElement("div");
cat.className="category";


// HEADER

const title = document.createElement("input");
title.className="category-title";
title.value=category.category;

title.oninput=()=>{
category.category=title.value;
};

cat.appendChild(title);


// ITEMS

category.items.forEach((item,iIndex)=>{

const row=document.createElement("div");
row.className="item";


// NAME

const name=document.createElement("input");
name.value=item.name;

name.oninput=()=>{
item.name=name.value;
};

row.appendChild(name);


// PRICE GROUP

const priceGroup=document.createElement("div");
priceGroup.className="price-group";


// VARIANTS

if(item.variants){

item.variants.forEach((v,vIndex)=>{

const label=document.createElement("input");
label.value=v.label;
label.placeholder="Tamaño";

label.oninput=()=>{
v.label=label.value;
};

const price=document.createElement("input");
price.type="number";
price.value=v.price;

price.oninput=()=>{
v.price=parseFloat(price.value);
};

const remove=document.createElement("button");
remove.innerText="✕";

remove.onclick=()=>{
console.log("Eliminar variante",vIndex);

item.variants.splice(vIndex,1);

render();
};

priceGroup.appendChild(label);
priceGroup.appendChild(price);
priceGroup.appendChild(remove);

});


// ADD VARIANT

const addVar=document.createElement("button");
addVar.innerText="+ Tamaño";

addVar.onclick=()=>{

console.log("Agregar variante");

item.variants.push({
label:"",
price:0
});

render();

};

priceGroup.appendChild(addVar);

}
else{

// SINGLE PRICE

const price=document.createElement("input");
price.type="number";
price.value=item.price||"";

price.oninput=()=>{
item.price=parseFloat(price.value);
};

priceGroup.appendChild(price);


// CONVERT

const convert=document.createElement("button");
convert.innerText="+ Tamaños";

convert.onclick=()=>{

console.log("Convertir a variantes");

item.variants=[
{label:"CH",price:item.price||0},
{label:"G",price:item.price||0}
];

delete item.price;

render();

};

priceGroup.appendChild(convert);

}


// DELETE PRODUCT

const del=document.createElement("button");
del.innerText="Eliminar";

del.onclick=()=>{

console.log("Eliminar producto",iIndex);

if(confirm("Eliminar producto?")){

category.items.splice(iIndex,1);

render();

}

};

row.appendChild(priceGroup);
row.appendChild(del);

cat.appendChild(row);

});


// FOOTER BUTTONS

const footer=document.createElement("div");

const addBtn=document.createElement("button");
addBtn.innerText="+ Producto";

addBtn.onclick=()=>{

console.log("Agregar producto",cIndex);

category.items.push({
name:"Nuevo producto",
price:0
});

render();

};

const delCat=document.createElement("button");
delCat.innerText="Eliminar categoría";

delCat.onclick=()=>{

if(confirm("Eliminar categoría completa?")){

data.menu.splice(cIndex,1);

render();

}

};

footer.appendChild(addBtn);
footer.appendChild(delCat);

cat.appendChild(footer);

container.appendChild(cat);

});

}


// ===============================
// ADD CATEGORY
// ===============================

function addCategory(){

console.log("Agregar categoría");

data.menu.push({
category:"Nueva categoría",
items:[]
});

render();

}
