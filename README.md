# Climad - Plataforma de Análise Climática

Climad é uma aplicação web desenvolvida em Python com o framework Django, projetada para facilitar a coleta, visualização e análise de dados climáticos históricos. O projeto integra dados de fontes confiáveis como a NASA POWER, permitindo que os utilizadores selecionem localizações geográficas (manualmente ou via mapa interativo), períodos de tempo e variáveis climáticas específicas. Os dados são apresentados em tabelas interativas com funcionalidades de exportação (Excel, CSV, JSON) e em gráficos dinâmicos para uma melhor interpretação. 

Este projeto é parte de uma pesquisa de mestrado e visa fornecer uma ferramenta robusta para análise climática, com planos futuros de integração de múltiplas fontes de dados e aplicação de técnicas de machine learning. [cite: 248, 333, 334]

## Funcionalidades Implementadas
* **Seleção de Localização Interativa:**
    * Entrada manual de latitude e longitude.
    * Seleção de coordenadas clicando num mapa Google Maps integrado.
    * Pesquisa de localizações no mapa por nome/endereço (Geocoding).
* **Seleção de Período:** Escolha de data de início e fim para a consulta dos dados.
* **Seleção de Variáveis Climáticas:** Checkboxes para selecionar quais dados da NASA POWER o utilizador deseja visualizar (ex: Temperatura, Precipitação, Radiação Solar, etc.).
* **Visualização de Dados em Tabela:**
    * Apresentação dos dados diários numa tabela responsiva e interativa (usando DataTables.net).
    * Paginação, busca e organização de colunas.
    * Botões para exportar os dados da tabela para os formatos CSV, Excel e JSON (copiar).
* **Visualização de Dados em Gráficos:**
    * Geração de gráficos de linha individuais para cada variável climática selecionada (usando ApexCharts).
    * Eixos dos gráficos otimizados para legibilidade.
    * Gráficos responsivos.
* **Valores Padrão no Formulário:**
    * Datas pré-preenchidas (último mês até hoje).
    * Todas as variáveis climáticas marcadas por padrão no primeiro carregamento.
* **Design Moderno e Responsivo:** Interface de utilizador desenhada para ser clara, simples e adaptável a diferentes tamanhos de ecrã.
* **Gestão Segura de Chaves de API:** Uso de variáveis de ambiente (`.env` file) para a chave da API do Google Maps.

## Pré-requisitos
* Python (versão 3.10 ou superior recomendada)
* PIP (gestor de pacotes do Python)
* Git (para clonar o repositório, opcional se descarregar o código de outra forma)

## Configuração e Instalação

Siga os passos abaixo para configurar e executar o projeto no seu ambiente local.

**1. Clonar o Repositório (Exemplo)**
   Se o seu projeto estiver no GitHub, clone-o. Caso contrário, descarregue os ficheiros para uma pasta no seu computador.
   ```bash
   git clone [https://github.com/joseferreira-dev/climad.git](https://github.com/joseferreira-dev/climad.git)

   cd climad
   ```

**2. Criar e Ativar um Ambiente Virtual**
   É altamente recomendado usar um ambiente virtual para isolar as dependências do projeto.
   ```bash
   # Dentro da pasta do projeto (ex: climad/)
   python -m venv venv
   ```
   Para ativar o ambiente virtual:
   * No Windows (PowerShell):
       ```powershell
       .\venv\Scripts\Activate.ps1
       ```
       (Se encontrar um erro de política de execução, execute `Set-ExecutionPolicy RemoteSigned -Scope Process` no PowerShell e tente novamente.)
   * No Windows (CMD):
       ```cmd
       .\venv\Scripts\activate.bat
       ```
   * No macOS/Linux:
       ```bash
       source venv/bin/activate
       ```
   O seu terminal deverá agora mostrar `(venv)` no início da linha.

**3. Instalar as Dependências**
   Crie um ficheiro `requirements.txt` se ainda não o tiver, com o ambiente virtual ativo:
   ```bash
   pip freeze > requirements.txt
   ```
   Depois, para instalar (ou se já tiver o ficheiro):
   ```bash
   pip install -r requirements.txt
   ```
   As principais dependências que este projeto usa (e que estarão no `requirements.txt`) são:
   * `django`
   * `requests`
   * `pandas`
   * `python-decouple`

**4. Configurar a Chave da API do Google Maps**
   Este projeto usa a API do Google Maps para a funcionalidade de mapa interativo.
   * **Obtenha uma Chave de API:**
       1.  Aceda à [Google Cloud Console](https://console.cloud.google.com/).
       2.  Crie um novo projeto ou selecione um existente.
       3.  No menu de navegação, vá para "APIs e Serviços" > "Biblioteca".
       4.  Procure e ative as seguintes APIs:
           * **Maps JavaScript API**
           * **Geocoding API**
       5.  Em "APIs e Serviços" > "Credenciais", clique em "+ CRIAR CREDENCIAIS" e escolha "Chave de API".
       6.  Copie a chave gerada.
       7.  **IMPORTANTE:** Restrinja a sua chave de API para evitar uso não autorizado. Para desenvolvimento, em "Restrições de aplicativos", selecione "Referências de HTTP (sites da web)" e adicione `http://127.0.0.1:8000/*` às restrições de site.

   * **Crie o Ficheiro `.env`:**
       Na raiz do seu projeto (mesma pasta que `manage.py`), crie um ficheiro chamado `.env`.
       Adicione a sua chave de API a este ficheiro da seguinte forma:
       ```env
       MAPS_API_KEY=SUA_CHAVE_DE_API_COPIADA_AQUI
       ```

   * **Adicione `.env` ao `.gitignore`:**
       Se ainda não o fez, crie um ficheiro `.gitignore` na raiz do projeto e adicione a linha `.env` para garantir que este ficheiro com a sua chave secreta nunca seja enviado para o Git.
       ```
       .env
       venv/
       db.sqlite3
       __pycache__/
       staticfiles/
       ```

**5. Aplicar as Migrações do Django**
   Para configurar a base de dados inicial do Django:
   ```bash
   python manage.py migrate
   ```

## Executando a Aplicação

1.  Com o ambiente virtual ativo e as dependências instaladas, inicie o servidor de desenvolvimento do Django:
    ```bash
    python manage.py runserver
    ```
2.  Abra o seu navegador e aceda a: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

A aplicação Climad deverá estar a funcionar!

## Estrutura do Projeto (Simplificada)

```
climad/                     # Pasta raiz do projeto
├── climad/                 # Pasta de configuração do projeto Django
│   ├── settings.py         # Configurações do projeto (onde a API key é lida)
│   ├── urls.py             # URLs principais do projeto
│   └── ...
├── core/                   # Aplicação principal "core"
│   ├── views.py            # Lógica das páginas (onde os dados são processados)
│   ├── urls.py             # URLs da aplicação "core"
│   ├── templates/          # Pasta para os ficheiros HTML
│   │   └── core/
│   │       └── index.html  # Template principal da página
│   └── ...
├── static/                 # Pasta para ficheiros estáticos (CSS, JS, Imagens do projeto)
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
├── venv/                   # Pasta do ambiente virtual (geralmente ignorada pelo Git)
├── .env                    # Ficheiro para variáveis de ambiente
├── .gitignore              # Especifica ficheiros a serem ignorados pelo Git
├── manage.py               # Utilitário de linha de comando do Django
└── requirements.txt        # Lista de dependências Python
```

## Próximos Passos e Futuro do Projeto
* Integração de mais fontes de dados climáticos (NOAA, ECMWF, INMET, Weather Underground).
* Implementação de funcionalidades de Machine Learning para análise e previsão.
* Criação de uma API para o Climad.
* Desenvolvimento de novas páginas e funcionalidades conforme a pesquisa de mestrado avança.

---
