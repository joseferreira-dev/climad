// static/js/main.js

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