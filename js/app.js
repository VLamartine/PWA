/*
Variáveis Globais
*/
let endpoint_principal = "https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome";
let data_json = null;
let cursor = 0;
let limite_paginacao = 10;
let busca = "";
let busca_valor = "";
let championContainer = document.getElementById("championContainer");
let titulo_principal = document.getElementById("titulo_principal");
let carregar_mais = document.getElementById("carregar_mais");
let estado = document.getElementById("estado");
let partido = document.getElementById("partido");
let searchButton = document.getElementById("searchButton");
let champList = document.getElementById("championLiset");
let champDetails = document.getElementById("championDetails");
let champions = null;
let selectedChamp = null;
let selectedSpell = null;
/*
Carregar Dados Asssíncronos
*/

async function carregarDados(endpoint, titulo, container_titulo, container_resultado) {

    //remover cardSetId 17, 18, 1453
    const data = await fetch(`../championFull.json`).then(r => r.json());
    champions = data.data;

    let html_container = '';
    for (const [key, champion] of Object.entries(data.data)) {
        html_container += cardChampion(champion);
    }
    container_resultado.innerHTML = html_container;

}
/*
Buscar Deputado
*/

document.getElementById("btPesquisa").addEventListener("click", function () {
    document.getElementById("nome").value = "";

});

var collapseSearch = document.getElementById('collapseSearch')

var bsCollapse = new bootstrap.Collapse(collapseSearch, {
    toggle: false,
    show: true, //useless
    hide: false //useless
})

searchButton.addEventListener("click", function (event) {
    const searchParam = document.getElementById('nome').value;
    const champ = Object.values(champions).find(champion => champion.name.toLowerCase().includes(searchParam.toLowerCase()));
    if (champ === undefined) {
        return;
    }

    const card = document.getElementById(champ.id);
    card.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    })
});

/*
Carregar Mais Conteudo
*/
function btCarregar() {
    carregarDados(endpoint_principal, "Lista de Campeões", titulo_principal, championContainer);
}

/*
Ver Gastos
*/
let offset_scroll;

const seeChamp = (id) => {
    champDetails.style.display = "block";
    champList.style.display = "none";
    selectedChamp = champions[id];
    document.getElementById("champName").innerHTML = selectedChamp.name;
    document.getElementById("champSplash").src = `http://ddragon.leagueoflegends.com/cdn/13.9.1/img/champion/${selectedChamp.id}.png`;
    document.getElementById("champTitle").innerHTML = selectedChamp.title;
    document.getElementById("champLore").innerHTML = selectedChamp.lore;
    seeSpell('passive');
    seeSkins();
}

const loadSpellImages = () => {
    let skillsHtml = `
        <img alt="${'passiva'}" onClick="seeSpell('passive')" style="${selectedSpell === 'passive' ? 'border: 5px solid black' : ''}" src="http://ddragon.leagueoflegends.com/cdn/13.9.1/img/passive/${selectedChamp.passive.image.full}"/>
    `;
    selectedChamp.spells.forEach((spell, index) => {
        skillsHtml += `<img alt="${spell.id[id.length - 1]}" onClick="seeSpell('${spell.id}', ${index})" style="${selectedSpell === spell.id ? 'border: 5px solid black' : ''}" src="http://ddragon.leagueoflegends.com/cdn/13.9.1/img/spell/${spell.image.full}"/>`
    })
    document.getElementById('skills').innerHTML = skillsHtml
}

const seeSpell = (id, index = null) => {
    const spell = id === 'passive' ? selectedChamp['passive'] : selectedChamp['spells'][index];
    selectedSpell = id;
    document.getElementById('skillName').textContent = `${id === 'passive' ? 'Passiva - ' : id[id.length - 1] + ' - '}${spell.name}`
    document.getElementById('skillText').innerHTML = `${spell.description}`
    loadSpellImages();
}

const seeSkins = () => {
    const container = document.getElementById('skinsList');
    selectedChamp.skins.forEach((skin, index) => {
        const div = document.createElement('div');

        div.innerHTML = `
            <img alt="${skin.name}" class="d-block w-100" style="margin-top: 16px" src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${selectedChamp.id}_${skin.num}.jpg" alt="First slide" />
            <h6 style="text-align: center; font-weight: bold">${index === 0 ? 'Padrão' : skin.name}</h6>
        `;

        container.appendChild(div);
    })
}

function btVoltar() {
    champDetails.style.display = "none";
    champList.style.display = "block";
}


function carregarGastos(endpoint) {

    let ajax = new XMLHttpRequest();
    ajax.open("GET", endpoint, true);
    //ajax.setRequestHeader("accept", "application/json;");    
    ajax.send();

    ajax.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            let data_json = JSON.parse(this.responseText);

            let html_container = "";
            let total_gastos = 0;

            for (let i = 0; i < data_json.dados.length; i++) {

                html_container += '<tr><th scope="row">' + data_json.dados[i].dataDocumento + '</th><td>' + data_json.dados[i].tipoDespesa + '</td><td>R$ ' + data_json.dados[i].valorDocumento + '</td><td><a href="' + data_json.dados[i].urlDocumento + '" target="_blank" class="pdf">Documento</a></td></tr>';
                total_gastos += data_json.dados[i].valorDocumento;
            }
            document.getElementById("tabela_gastos").innerHTML = html_container;
            document.getElementById("total_gasto").innerHTML = Math.round(total_gastos);
        }

    }

}

//Inicialização
carregarDados(endpoint_principal, "Lista de Campeões", titulo_principal, championContainer);


/*
Botão de Instalação
*/

let janelaInstalacao = null;
let btInstalar = document.getElementById("btInstalar");

window.addEventListener("beforeinstallprompt", gravarJanela);

function gravarJanela(evt) {
    janelaInstalacao = evt;
}

let inicializaInstalacao = function () {

    setTimeout(function () {

        if (janelaInstalacao != null) {
            btInstalar.removeAttribute("hidden");
        }

    }, 500);

    btInstalar.addEventListener("click", function () {

        btInstalar.setAttribute("hidden", true);
        btInstalar.hidden = true;

        janelaInstalacao.prompt();

        janelaInstalacao.userChoice.then((choice) => {

            if (choice.outcome === 'accepted') {
                console.log("Usuário instalou a aplicação!");
            } else {
                console.log("Usuário NÃO instalou a aplicação!");
                btInstalar.removeAttribute("hidden");
            }

        });

    });


}



/*

Template Engine

*/

const cardChampion = (champion) => {
    return `
            <div class="col-12 col-md-6 col-lg-4">
            <div class="card" id="${champion.id}">
                <img src="http://ddragon.leagueoflegends.com/cdn/13.9.1/img/champion/${champion.id}.png" class="card-deputado">
                <div class="card-body">
                <h5 class="card-title">${champion.name}</h5>
                <h6 style="text-align: center">${champion.title}</h6>
                <p>${champion.blurb}</p>
                <div class="d-grid gap-2">
                    <a href="javascript:seeChamp('${champion.id}');" class="btn btn-success">Ver campeão</a>
                </div>
                </div>
            </div>
        </div>`;
}
