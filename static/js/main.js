let map;
let marker;
let geocoder;

function initMap() {
    const initialCoords = { lat: -8.047562, lng: -34.877064 }; // Recife
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialCoords,
        zoom: 7,
    });
    geocoder = new google.maps.Geocoder();
    map.addListener("click", (event) => {
        placeMarker(event.latLng);
        updateFormFields(event.latLng);
    });
    if (document.getElementById("map-search-button")) {
        document.getElementById("map-search-button").addEventListener("click", () => {
            geocodeAddress();
        });
    }
}

function geocodeAddress() {
    const address = document.getElementById("map-search-input").value;
    if (!address) return;
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            map.setZoom(10);
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
        marker = new google.maps.Marker({ position: location, map: map });
    }
}

function updateFormFields(location) {
    if (location && typeof location.lat === 'function' && typeof location.lng === 'function') {
        document.getElementById("latitude-input").value = location.lat().toFixed(6);
        document.getElementById("longitude-input").value = location.lng().toFixed(6);
    }
}

$(document).ready(function() {
    // Inicializa o DataTables se a tabela existir
    if ($('#climate-table').length) {
        $('#climate-table').DataTable({
            lengthMenu: [10, 20, 50, 100],
            language: { // Traduções do DataTables
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
    }
});