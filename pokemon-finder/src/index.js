let selectedPokemon=null;
let allPokemon=null;
const searchHandler={
  get:(target, prop, receiver)=>{
      for(let item of target){
        if(item.name==prop){
          return item.url;
        }
      }
      return false;
  }
}
let searchProxy=null;

const template = document.createElement('template');
template.innerHTML=`
<style>
  #pokemonContainer{
    display:flex;
    flex-wrap:wrap;
  }
  #pokemonContainer > pokemon-comp {
    width:20%;
    border:1px solid black;
    border-radius:25px;
    margin-right:10px;
    margin-bottom:10px;
    height:250px;
  }
</style>
<div id="pokemonContainer"></div>
`;
class MainComponent extends HTMLElement {

  constructor() {
    super(); 
    this.attachShadow({mode: 'open'});   
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.getData();
  }
  connectedCallback() {
    // this.getData();
  }
   getData(){
    console.log("inside getData")
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20&offset=20').then(data => data.json())
    .then((json) => {
      console.log(json);
      allPokemon=json.results;
      searchProxy=new Proxy(allPokemon,searchHandler);
      this.createChild(json);
    })
    .catch((error) => console.log(error));
  }
  createChild(json){
    let container=this.shadowRoot.querySelector("#pokemonContainer");
    for(let item of json.results){
      let pokemon=document.createElement('pokemon-comp');
      pokemon.setAttribute("name",item.name);
      pokemon.setAttribute("url",item.url);
      container.appendChild(pokemon);
    }
    document.getElementById("details").innerHTML=`<details-comp url=${json.results[0].url}></details-comp>`;
  }
  render(source){
    this.shadowRoot.innerHTML = source
  }

}
class Pokemon extends HTMLElement{
  constructor() {
    super(); 
    this.attachShadow({mode: 'open'});    
  }
  connectedCallback() {
    const demo = `
    <style>
      .pokeCard{
        display:flex;
        flex-wrap:wrap;
        justify-content:center;
      }
      .pokeCard>p{
        width:100%;
        font-size:2em;
        text-align:center;
      }
      .pokeCard>button{
        cursor:pointer;
        border:none;
        background-color:#ff4343;
        border-radius:8px;
        font-size:1.2em;
        color:#fff;
        padding:10px 30px;
      }
    </style>
    <div class="pokeCard">
      <p>${this.getAttribute("name").substring(0,1).toUpperCase()+this.getAttribute("name").substring(1)}</p>
      <button id="viewMore">View Details</button>
    </div>
    `
    this.render(demo)

    this.shadowRoot.querySelector("#viewMore").addEventListener("click",()=>{
      document.getElementById("details").innerHTML=`<details-comp url=${this.getAttribute("url")}></details-comp>`;
    });
  }
  render(source){
    this.shadowRoot.innerHTML = source
  }
}
const detailTemplate = document.createElement('template');
detailTemplate.innerHTML=`
<style>
  .wrapper{
    display:flex;
    flex-wrap:wrap;
  }
  .wrapper>div{
    width:49.5%;
  }
</style>
<div>
  <img id="image" src=""/ width="250"  height="250">
  <h1>Name: <span id="name"></span></h1>
  <div class="wrapper">
    <div>
        <h3>Abilities</h3>
        <ul id="abilities">
        </ul>
    </div>
    <div>
      <h3>Moves</h3>
      <ul id="moves">
      </ul>
    </div>
  
  
  </div>
</div>
`;
class Details extends HTMLElement{
  constructor() {
    super(); 
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(detailTemplate.content.cloneNode(true));
  }
  connectedCallback() {
    this.getData();
  }
  getData(){
    fetch(this.getAttribute("url")).then(data => data.json())
    .then((json) => {
      this.createChild(json);
    })
    .catch((error) => console.log(error));
  }
  createChild(json){
    this.shadowRoot.querySelector("#image").src=json.sprites.other["official-artwork"].front_default;
    this.shadowRoot.querySelector("#name").innerHTML=json.name;
    for(let item of json.abilities){
      let li=document.createElement("li");
      li.innerHTML=item.ability.name;
      this.shadowRoot.querySelector("#abilities").appendChild(li);
    }
    for(let i=0 ;i<=5; i++){
      let li=document.createElement("li");
      li.innerHTML=json.moves[i].move.name;
      this.shadowRoot.querySelector("#moves").appendChild(li);
    }
  }
  render(source){
    this.shadowRoot.innerHTML = source
  }
}
class Search extends HTMLElement{
  constructor() {
    super(); 
    this.attachShadow({mode: 'open'});
    const search=`
    <style>
      #error{
        color:red;
      }
    </style>  

    <div id="container">
      <input type="text" id="searchValue" placeholder="search pokemon"/>
      <button id="searchBtn">Search</button>
      <span id="error"></span>
    </div>
    `;
    this.render(search);
  }
  connectedCallback() {
    this.shadowRoot.querySelector("#searchBtn").addEventListener("click",()=>{
      this.shadowRoot.querySelector("#error").innerHTML=``;
      let searchValue=this.shadowRoot.querySelector("#searchValue").value;
      if(searchValue==""){
        return
      }
      else if(searchProxy[searchValue]){
        document.getElementById("details").innerHTML=`<details-comp url=${searchProxy[searchValue]}></details-comp>`;
      }else{
        this.shadowRoot.querySelector("#error").innerHTML=`No pokemon Found`;
      }
    });
  }
  
  render(source){
    this.shadowRoot.innerHTML = source
  }
}

customElements.define('main-comp', MainComponent);
customElements.define('pokemon-comp', Pokemon);
customElements.define('details-comp', Details);
customElements.define('search-comp', Search);