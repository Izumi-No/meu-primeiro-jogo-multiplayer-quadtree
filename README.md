# Projeto de Jogo Multijogador

Este é um projeto de jogo multijogador construído usando comunicação por WebSocket e uma estrutura de dados QuadTree para detecção eficiente de colisões. Os jogadores podem controlar personagens na tela e coletar frutas, que são distribuídas em toda a área do jogo.

## Tabela de Conteúdos

- [Recursos](#recursos)
- [Começando](#começando)
  - [Instalação](#instalação)
  - [Executando o Servidor](#executando-o-servidor)
- [Jogabilidade](#jogabilidade)
- [Customização](#customização)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Recursos

- Jogabilidade multijogador em tempo real usando comunicação por WebSocket.
- Detecção eficiente de colisões e particionamento espacial usando um QuadTree.
- Geração aleatória de frutas que os jogadores podem coletar.
- Controle por teclado para mover personagens dentro da área do jogo.

## Começando

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Izumi-No/meu-primeiro-jogo-multiplayer-quadtree.git
   ```

2. Instale as dependências do projeto:

   ```bash
   cd jogo-multijogador
   npm install
   ```

### Executando o Servidor

1. Inicie o servidor com o seguinte comando:

   ```bash
   npm start
   ```

2. Abra o seu navegador e acesse [http://localhost:8080](http://localhost:8080) para jogar o jogo.

## Jogabilidade

- Use as teclas de seta para mover o seu personagem dentro da área do jogo.
- Colete as frutas que aparecem aleatoriamente na tela.
- Interaja com outros jogadores em tempo real.

## Customização

- Você pode ajustar o tamanho da área do jogo modificando a variável de ambiente `SIZE_OF_GAME` no arquivo `.env`.
- Personalize a mecânica do jogo, os gráficos e os elementos da interface do usuário conforme necessário.

## Contribuição

Contribuições para este projeto são bem-vindas! Se encontrar algum problema ou tiver ideias para melhorias, sinta-se à vontade para criar uma solicitação de pull ou abrir uma issue no repositório do GitHub.

1. Faça um fork do repositório.
2. Crie um novo branch para a sua funcionalidade ou correção de bug: `git checkout -b feature/nome-da-sua-funcionalidade`.
3. Faça as suas alterações e as confirme: `git commit -m "Adicionar nova funcionalidade"`.
4. Envie para o branch: `git push origin feature/nome-da-sua-funcionalidade`.
5. Crie uma solicitação de pull contra o branch `main` do repositório original.

## Autor

| [<img src="https://avatars3.githubusercontent.com/u/4248081?s=460&v=4" width=115><br><sub>@filipedeschamps</sub>](https://github.com/filipedeschamps) | [<img src="https://avatars.githubusercontent.com/u/67838060?v=4" width=115><br><sub>@Izumi-No</sub>](https://github.com/outro-autor) |
| :---: | :---: |

