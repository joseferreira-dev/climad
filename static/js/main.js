let map;
let marker;
let geocoder; // Variável para o serviço de geocoding

function initMap() {
    const initialCoords = { lat: -8.047562, lng: -34.877064 };

    map = new google.maps.Map(document.getElementById("map"), {
        center: initialCoords,
        zoom: 8,
    });
    
    // Inicializa o Geocoder
    geocoder = new google.maps.Geocoder();

    map.addListener("click", (event) => {
        placeMarker(event.latLng);
        updateFormFields(event.latLng);
    });

    // Adiciona o "ouvinte" para o botão de pesquisa do mapa
    document.getElementById("map-search-button").addEventListener("click", () => {
        geocodeAddress();
    });
}

// NOVA FUNÇÃO para pesquisar o endereço
function geocodeAddress() {
    const address = document.getElementById("map-search-input").value;
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK") {
            const location = results[0].geometry.location;
            map.setCenter(location);
            placeMarker(location);
            updateFormFields(location);
        } else {
            alert("Não foi possível encontrar o local: " + status);
        }
    });
}

function placeMarker(location) {
    if (marker) {
        marker.setPosition(location);
    } else {
        marker = new google.maps.Marker({
            position: location,
            map: map,
        });
    }
}

function updateFormFields(location) {
    const lat = location.lat().toFixed(6);
    const lng = location.lng().toFixed(6);
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