# 🏫 GTI Educação — Gestão de Tempo Integral (1º ao 9º Ano)

Este é um sistema SaaS corporativo B2G desenvolvido para **Prefeituras e Secretarias Municipais de Educação (SME)**, destinado ao planejamento, alocação e controle de lotações de oficineiros no programa de educação de tempo integral do 1º ao 9º ano.


Abaixo você encontrará as instruções passo a passo detalhadas para instalar os pré-requisitos e colocar o sistema para funcionar de maneira simples.

---

## 📋 Guia de Inicialização Rápida (Para a Chefia / Usuários Finais)

Para rodar o sistema pela primeira vez no seu computador, siga estes **3 passos simples**:

### Passo 1: Instalar o Node.js (O motor do sistema)
O sistema precisa de um programa gratuito chamado **Node.js** para funcionar.
1. Acesse o site oficial do Node.js: [https://nodejs.org](https://nodejs.org)
2. Baixe a versão marcada como **LTS** (geralmente é o botão verde do lado esquerdo, recomendado para a maioria dos usuários).
3. Abra o instalador baixado e clique em **Next** (Avançar) em todas as telas, mantendo as opções padrão marcadas, até finalizar a instalação.
4. *(Opcional)* Para verificar se foi instalado corretamente, abra o Prompt de Comando (CMD) do Windows e digite `node -v` e aperte Enter. Deverá aparecer uma numeração de versão (ex: `v20.11.0`).

### Passo 2: Baixar o Sistema do GitHub
Se você não utiliza comandos de desenvolvedor (Git), siga este método:
1. No topo desta página do GitHub, clique no botão verde escrito **"Code"** (Código).
2. Clique na opção **"Download ZIP"** (Baixar ZIP).
3. Vá até a pasta de downloads do seu computador, clique com o botão direito sobre o arquivo baixado (`sistema-de-gestao...zip`) e selecione **"Extrair Tudo..."** para descompactar a pasta.

### Passo 3: Executar o Sistema em Um Clique
1. Abra a pasta descompactada no seu computador.
2. Dê um **duplo clique** no arquivo chamado:
   👉 **`Iniciar-Sistema.bat`** (ele possui o ícone de uma engrenagem ou é listado como "Arquivo de Lote do Windows").
3. Uma tela preta de terminal se abrirá. **Não a feche**.
4. **Na primeira execução:** O script detectará que é a primeira vez rodando e baixará os pacotes necessários de forma automática (pode levar de 30 segundos a 1 minuto). Nas próximas execuções, o início será instantâneo.
5. O banco de dados será verificado e seu navegador de internet padrão (Chrome, Edge ou Firefox) **se abrirá automaticamente** no endereço do sistema: [http://localhost:3000](http://localhost:3000).
6. **Ao terminar de usar:** Basta fechar a janela do navegador e fechar a janelinha preta do terminal clicando no **X** vermelho.

---

## 🛠️ Guia para Desenvolvedores (Execução via Terminal)

Caso queira realizar manutenções ou rodar os comandos manualmente, utilize o terminal nas etapas abaixo:

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/evilkobayashi/sistema-de-gestao-do-tempo-integral.git
cd sistema-de-gestao-do-tempo-integral
npm install
```

### 2. Semeador (Seed) do Banco de Dados
O SQLite (`gestao.db`) já acompanha o projeto. Para restaurar ou semear os dados de demonstração e os turnos obrigatórios:
```bash
npm run seed
```

### 3. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor abrirá em `http://localhost:3000`.

### 4. Compilar para Produção
```bash
npm run build
npm run start
```

---

## 🌟 Recursos e Funcionalidades do Sistema

### 1. Dashboard de BI Interativo
* **Filtros por Escola e Turno:** Selecione uma escola ou turno no topo para recalcular instantaneamente em milissegundos todos os KPIs e gráficos da rede municipal.
* **Agregadores em Tempo Real:** Escolas ativas, turmas formadas, quantidade de profissionais, carga horária de aula e planejamento, e carga total da rede.
* **Gráficos:** Carga horária por escola, oficinas por escola, turmas por turno e carga semanal de cada oficineiro.

### 2. Cadastro e Edição de Lotações (CRUD Completo)
* **Gerenciamento Completo:** Adicione, exclua ou edite lotações existentes (corrigindo horários, dias ou turmas diretamente, sem ter que excluir e recriar).
* **Validador de Sobrecarga (40h):** O sistema impede que qualquer oficineiro ultrapasse 40 horas semanais no total de suas atribuições (soma de aulas + planejamento).
* **Validador de Conflitos de Horários:** O sistema bloqueia alocações do mesmo professor no mesmo dia e turno em turmas ou escolas diferentes.

### 3. Gestão Própria de Oficineiros
* **Acompanhamento de Carga Horária:** Lista interativa de professores contendo uma **barra de progresso** que avisa o status de carga acumulada de cada um em relação ao limite de 40h (Pills: `Disponível` em verde, `No Limite` em amarelo, `Sobrecarga` em vermelho).
* **Cadastro Rápido:** Adicione novos professores à rede a qualquer momento.

### 4. Importador Inteligente de Planilhas (Excel / CSV)
* **Importação direta de XLSX/XLS:** Arraste arquivos do Excel ou cole células copiadas. O sistema processa, exibe uma prévia para confirmação e cria automaticamente escolas, oficinas e oficineiros novos descritos no arquivo.
* **Relatório de erros:** Avisa de forma amigável quais linhas continham conflito de horário ou excesso de carga de trabalho e não puderam ser importadas, salvando todas as outras que estavam corretas.

### 5. Exportador de Relatórios em PDF Profissionais (`jspdf-autotable`)
* **Alta Qualidade:** Gera PDFs oficiais com tabelas de texto selecionável e pesquisável.
* **Padronização:** Layout timbrado oficial da SME de Queimados com paginação dinâmica (*"Página X de Y"*).

---

## ⚙️ Pilha Tecnológica
* **Framework:** Next.js 16 (App Router)
* **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts
* **Banco de Dados & ORM:** SQLite (`better-sqlite3`) & Drizzle ORM
* **Manipuladores:** SheetJS (Excel parser) & jsPDF-AutoTable
