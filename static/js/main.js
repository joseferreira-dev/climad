// Variáveis globais para o mapa e o marcador
let map;
let marker;

// Função chamada pelo script do Google Maps quando ele carrega
function initMap() {
    // Coordenadas iniciais do mapa (centro de Recife)
    const initialCoords = { lat: -8.047562, lng: -34.877064 };

    // Cria o mapa
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialCoords,
        zoom: 8,
    });

    // Adiciona um "ouvinte" de cliques ao mapa
    map.addListener("click", (event) => {
        placeMarker(event.latLng);
        updateFormFields(event.latLng);
    });
}

// Função para colocar/mover o marcador no mapa
function placeMarker(location) {
    if (marker) {
        // Se o marcador já existe, apenas muda a sua posição
        marker.setPosition(location);
    } else {
        // Se não, cria um novo marcador
        marker = new google.maps.Marker({
            position: location,
            map: map,
        });
    }
}

// Função para atualizar os campos de latitude e longitude do formulário
function updateFormFields(location) {
    // Arredonda as coordenadas para 6 casas decimais
    const lat = location.lat().toFixed(6);
    const lng = location.lng().toFixed(6);

    // Encontra os inputs pelos IDs e atualiza os seus valores
    document.getElementById("latitude-input").value = lat;
    document.getElementById("longitude-input").value = lng;
}

$(document).ready(function() {
    $('#climate-table').DataTable({
        lengthMenu: [10, 20, 50, 100],
        
        // Substituímos a chamada à URL pela tradução completa em português.
        language: {
            "sEmptyTable": "Nenhum registo encontrado",
            "sInfo": "Mostrando de _START_ até _END_ de _TOTAL_ registos",
            "sInfoEmpty": "Mostrando 0 até 0 de 0 registos",
            "sInfoFiltered": "(Filtrados de _MAX_ registos)",
            "sInfoPostFix": "",
            "sInfoThousands": ".",
            "sLengthMenu": "_MENU_ resultados por página",
            "sLoadingRecords": "Carregando...",
            "sProcessing": "Processando...",
            "sZeroRecords": "Nenhum registo encontrado",
            "sSearch": "Pesquisar:",
            "oPaginate": {
                "sNext": "Próximo",
                "sPrevious": "Anterior",
                "sFirst": "Primeiro",
                "sLast": "Último"
            },
            "oAria": {
                "sSortAscending": ": Ordenar colunas de forma ascendente",
                "sSortDescending": ": Ordenar colunas de forma descendente"
            }
        }
    });
});