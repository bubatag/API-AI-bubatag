# 🐃 API-BUBATAG

### API, Inteligência Artificial e processamento de dados para o monitoramento inteligente de bubalinos.

O **API-BUBATAG** é o repositório responsável pela camada de comunicação, processamento e integração de dados da plataforma **BUBATAG**.

Desenvolvido para apoiar o monitoramento inteligente de rebanhos bubalinos, o projeto integra uma **API REST**, banco de dados **MongoDB** e serviços de **Inteligência Artificial e Machine Learning**, permitindo receber, processar, classificar e armazenar informações fisiológicas dos animais.

Por meio dessa integração, o sistema trabalha com informações como temperatura corporal e frequência cardíaca, auxiliando na identificação de possíveis sinais de estresse e no acompanhamento do bem-estar dos animais.

A arquitetura utiliza serviços independentes e containers Docker, facilitando a execução, manutenção e comunicação entre os diferentes componentes da aplicação.

---

## 🎯 Objetivo

Desenvolver uma infraestrutura de backend capaz de receber, processar e disponibilizar os dados utilizados pela plataforma BUBATAG.

O projeto tem como principais objetivos:

- Disponibilizar endpoints para comunicação entre os dispositivos IoT e a plataforma.
- Receber e validar informações coletadas pelas coleiras inteligentes.
- Identificar os animais e dispositivos associados aos registros.
- Processar dados fisiológicos por meio de serviços de Inteligência Artificial.
- Classificar possíveis condições de estresse dos animais.
- Armazenar informações de monitoramento no MongoDB.
- Disponibilizar dados para consultas, acompanhamento e geração de relatórios.
- Integrar os serviços de backend com as demais aplicações do BUBATAG.

## 🏗️ Arquitetura do Sistema

O API-BUBATAG funciona como uma camada central de processamento e comunicação entre os dispositivos de monitoramento, os serviços de inteligência e as aplicações da plataforma.

### Fluxo de comunicação

```text
          [ Dispositivos IoT ]
          [ Coleiras ESP32 ]
                  |
                  v
          [ API-BUBATAG ]
          Node.js / Express
               :3000
                  |
          +-------+-------+
          |               |
          v               v
    [ Serviço de IA ]  [ MongoDB ]
    Python / FastAPI   Armazenamento
        :8000          dos dados
          |
          v
    [ Machine Learning ]
    Classificação de
    dados fisiológicos
```

### Serviços e tecnologias

| Serviço | Tecnologia | Porta |
|---|---|---|
| API REST | Node.js / Express | `3000` |
| Inteligência Artificial | Python / FastAPI | `8000` |
| Banco de dados | MongoDB 8 | `27018` (host) |
| Machine Learning | Python / scikit-learn | Integrado ao serviço de IA |

**Comunicação interna:** os containers utilizam a rede do Docker Compose. A API acessa o MongoDB por `mongo:27017` e o serviço de IA por `http://ml-service:8000`.

---

## 📦 Tecnologias Utilizadas

As principais tecnologias utilizadas no desenvolvimento são:

| Tecnologia | Aplicação |
|---|---|
| Node.js | Ambiente de execução do backend. |
| Express.js | Desenvolvimento da API REST. |
| Python | Implementação dos serviços de inteligência. |
| FastAPI | Disponibilização dos serviços de IA. |
| MongoDB | Armazenamento de dados e telemetria. |
| scikit-learn | Treinamento e execução de modelos de Machine Learning. |
| pandas | Manipulação e preparação de dados. |
| joblib | Armazenamento e carregamento de modelos treinados. |
| Docker | Containerização dos serviços. |
| Docker Compose | Orquestração e integração dos containers. |

---

## 📁 Organização do Repositório

O projeto está organizado em diretórios independentes, cada um com uma responsabilidade específica.

```text
API-BUBATAG/
│
├── backup-mongodb/
│   └── Arquivos relacionados aos backups do MongoDB
│
├── bubatag-ai-service/
│   └── Serviço de Inteligência Artificial
│
├── bubatag-api-mongo/
│   └── API REST e integração com MongoDB
│
├── bubatag-ml-service/
│   └── Serviço e estrutura de Machine Learning
│
├── .gitignore
├── LICENSE
└── README.md
```

### 🔌 bubatag-api-mongo

Contém a implementação da API REST, desenvolvida com Node.js e Express.

É responsável por receber requisições, validar informações, realizar operações no banco de dados e estabelecer a comunicação com o serviço de Inteligência Artificial.

Entre suas responsabilidades estão:

- Gerenciamento das requisições HTTP.
- Registro e consulta de dados de telemetria.
- Integração com o MongoDB.
- Comunicação com o serviço de classificação.
- Disponibilização de informações para relatórios.

### 🧠 bubatag-ai-service

Diretório destinado ao serviço de Inteligência Artificial do projeto.

Sua finalidade é disponibilizar funcionalidades relacionadas ao processamento e à análise dos dados coletados, contribuindo para a identificação de possíveis condições de estresse nos animais.

### 🤖 bubatag-ml-service

Contém a estrutura relacionada ao Machine Learning, incluindo os recursos necessários para trabalhar com os modelos de classificação.

O serviço utiliza informações fisiológicas, como temperatura corporal e frequência cardíaca, para realizar a classificação do estado do animal.

O modelo experimental utilizado pelo serviço é armazenado no formato `.joblib`.

### 🗄️ backup-mongodb

Diretório destinado aos arquivos relacionados à preservação e recuperação dos dados armazenados no MongoDB.

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, é necessário possuir:

- [Git](https://git-scm.com/) — para clonar e versionar o repositório.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — para executar os containers.
- Docker Compose — utilizado para orquestrar os serviços.

**Observação:** não é necessário instalar manualmente Node.js, Python ou MongoDB para executar os serviços que já estão configurados em containers Docker.

No Windows, certifique-se de que o Docker Desktop esteja aberto e funcionando antes de iniciar o projeto.

---

## 🚀 Como Executar o Projeto

### 1. Clonar o repositório

Abra o terminal e execute:

```bash
git clone https://github.com/bubatag/API-bubatag.git
```

Acesse a pasta:

```bash
cd API-bubatag
```

### 2. Acessar o diretório principal da API

O arquivo `docker-compose.yml` responsável pela inicialização dos serviços está localizado em `bubatag-api-mongo`.

```bash
cd bubatag-api-mongo
```

### 3. Configurar as variáveis de ambiente

A API utiliza variáveis de ambiente para configurações importantes, incluindo o segredo de autenticação JWT.

Verifique a existência do arquivo `.env` e configure a variável:

```env
JWT_SECRET=seu_segredo_local
```

Substitua o valor de exemplo por um segredo próprio.

**Importante:** nunca compartilhe credenciais, tokens ou segredos reais em repositórios públicos.

As configurações de comunicação interna com o MongoDB e o serviço de IA são:

```env
MONGO_URI=mongodb://mongo:27017/bubatag
ML_SERVICE_URL=http://ml-service:8000
```

Esses endereços são utilizados dentro da rede Docker e devem permanecer compatíveis com a configuração do `docker-compose.yml`.

### 4. Construir e iniciar os serviços

Execute o comando dentro da pasta `bubatag-api-mongo`:

```bash
docker compose up -d --build
```

Esse comando realiza a construção das imagens e inicia os serviços em segundo plano.

### 5. Verificar os containers

Para conferir se os serviços foram iniciados corretamente:

```bash
docker compose ps
```

Os containers esperados são:

- `bubatag-api`
- `bubatag-ml-service`
- `bubatag-mongo`

Verifique se os serviços apresentam o status `Up`.

### 6. Consultar os logs

Para acompanhar os registros de execução:

```bash
docker compose logs -f
```

Para visualizar somente os logs da API:

```bash
docker compose logs -f api
```

Para visualizar somente os logs do serviço de IA:

```bash
docker compose logs -f ml-service
```

Para sair da visualização, pressione `Ctrl + C`.

---

## 🔌 API REST

A API REST foi desenvolvida com Node.js e Express e funciona como ponto central de comunicação entre os componentes do BUBATAG.

### Verificação de funcionamento

Para verificar se a API está respondendo, utilize:

```http
GET http://localhost:3000/health
```

### Registro de telemetria

A API disponibiliza um endpoint para receber os dados coletados pelas coleiras inteligentes:

```http
POST http://localhost:3000/api/telemetria/registro
```

Exemplo de requisição:

```json
{
  "n_coleira": "COL-TESTE-001",
  "temperatura": 39.0,
  "batimento_cardiaco": 90
}
```

O sistema utiliza essas informações para identificar a coleira, associar o registro ao animal correspondente, realizar o processamento necessário e armazenar os dados.

### Relatórios

Também existe uma rota para consultar informações relacionadas a uma coleira:

```http
GET http://localhost:3000/api/relatorios/coleira/COL-TESTE-001
```

O resultado depende dos registros disponíveis no banco de dados e das regras implementadas no serviço de relatórios.

---

## 🧠 Inteligência Artificial e Machine Learning

Um dos diferenciais do BUBATAG é a utilização de Inteligência Artificial para auxiliar na identificação de possíveis sinais de estresse nos bubalinos.

O serviço de classificação foi desenvolvido em Python utilizando FastAPI e trabalha integrado à API principal.

### Dados utilizados

O modelo recebe informações fisiológicas dos animais, incluindo:

| Variável | Descrição |
|---|---|
| Temperatura | Temperatura corporal do animal em graus Celsius. |
| Frequência cardíaca | Quantidade de batimentos cardíacos por minuto. |

### Verificação do serviço

Para verificar se o serviço de IA está funcionando:

```http
GET http://localhost:8000/health
```

### Classificação dos dados

O serviço disponibiliza o seguinte endpoint:

```http
POST http://localhost:8000/classificar
```

Exemplo de requisição:

```json
{
  "temperatura": 39.0,
  "batimento_cardiaco": 90
}
```

O serviço retorna informações relacionadas à classificação, incluindo o estado identificado e a identificação do modelo utilizado.

**Importante:** o modelo documentado atualmente possui caráter experimental e utiliza dados simulados no treinamento. Seus resultados não devem ser interpretados como diagnóstico veterinário ou validação clínica.

---

## 🔄 Fluxo de Processamento dos Dados

O processamento das informações acontece por meio da integração entre os diferentes componentes do sistema.

1. Os sensores instalados nas coleiras coletam informações fisiológicas dos animais.
2. Os dados são enviados para a API-BUBATAG.
3. A API realiza as validações necessárias.
4. O sistema identifica a coleira e o animal associados ao registro.
5. Os dados são encaminhados para classificação quando necessário.
6. O serviço de Inteligência Artificial processa as informações.
7. O resultado da classificação é associado à telemetria.
8. Os registros são armazenados no MongoDB.
9. As informações ficam disponíveis para consulta pelas aplicações da plataforma.

---

## 🗄️ Banco de Dados

O projeto utiliza o **MongoDB** para armazenar as informações necessárias ao funcionamento do sistema.

O banco é executado em um container independente e utiliza um volume Docker para preservar os dados entre reinicializações.

### Consultar os bancos disponíveis

```bash
docker exec bubatag-mongo mongosh --eval "show dbs"
```

### Acessar o banco BUBATAG

```bash
docker exec -it bubatag-mongo mongosh bubatag
```

Dentro do terminal do MongoDB, é possível consultar as coleções e os registros armazenados.

Para sair:

```bash
exit
```

**Atenção:** evite utilizar `docker compose down -v` quando houver dados que precisam ser preservados, pois esse comando remove os volumes associados ao projeto.

---

## 🛑 Gerenciamento dos Containers

Alguns comandos úteis para administrar o ambiente:

**Parar os serviços:**

```bash
docker compose down
```

**Iniciar novamente:**

```bash
docker compose up -d
```

**Reconstruir os containers após alterações:**

```bash
docker compose up -d --build
```

**Consultar os containers em execução:**

```bash
docker compose ps
```

**Visualizar os logs:**

```bash
docker compose logs -f
```

---

## 🧪 Testes e Validação

Durante o desenvolvimento e a integração dos serviços, foram contemplados testes relacionados a:

- Inicialização dos containers Docker.
- Verificação de funcionamento da API REST.
- Verificação de funcionamento do serviço de IA.
- Comunicação entre os serviços pela rede Docker.
- Classificação de dados fisiológicos.
- Registro de informações de telemetria.
- Persistência dos dados no MongoDB.
- Consulta de informações e relatórios.

A validação técnica da comunicação entre os serviços é uma etapa importante para garantir o funcionamento da arquitetura.

A precisão dos modelos de Machine Learning, por sua vez, depende da utilização de dados reais, representativos e devidamente validados.

---

## 🔗 Integração com os Demais Projetos

O API-BUBATAG faz parte de um ecossistema de desenvolvimento que integra diferentes tecnologias para viabilizar o monitoramento inteligente de bubalinos.

| Repositório | Responsabilidade |
|---|---|
| [BUBATAG](https://github.com/bubatag/bubatag) | Apresentação institucional e visão geral do projeto. |
| [sistema-frontend](https://github.com/bubatag/sistema-frontend) | Interface de gerenciamento e visualização das informações. |
| [DB-BUBATAG](https://github.com/bubatag/DB-BUBATAG) | Modelagem e organização dos bancos de dados do projeto. |
| [API-bubatag](https://github.com/bubatag/API-bubatag) | API, processamento de dados e serviços de inteligência. |

A integração desses componentes permite conectar os dispositivos IoT, o armazenamento de informações e as interfaces utilizadas pelos produtores.

## 👥 Equipe de Desenvolvimento

O API-BUBATAG integra o desenvolvimento da plataforma **BUBATAG**, projeto que une tecnologia, Internet das Coisas, Inteligência Artificial e pecuária bubalina.

Conheça a organização e acompanhe os demais repositórios:

🐃 [GitHub — BUBATAG](https://github.com/bubatag)
