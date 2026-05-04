// Mapeamento de valor dos ranks (usado para comparar e definir MVP)
const rankValue = {
  Unranked: 0,
  Iron: 1,
  Bronze: 2,
  Silver: 3,
  Gold: 4,
  Platinum: 5,
  Diamond: 6,
  Ascendant: 7,
  Immortal: 8,
  Radiant: 9
};

// Retorna o caminho da imagem do rank com base no nome
function getRankImage(rank) {
  const name = rank.toLowerCase().replace(/\s+/g, "_") + "_Rank.png";
  return `/assets/images/ranks/${name}`;
}

async function loadTeam() {
  try {
    // Requisição para API interna
    const response = await fetch("/api/team");
    const players = await response.json();

    // Validação básica da resposta
    if (!Array.isArray(players)) {
      console.error("Erro na API:", players);
      return;
    }

    const container = document.querySelector(".players_container");

    // Inicializa MVP como o primeiro jogador
    let mvp = players[0];

    // Define MVP com base no maior rank
    players.forEach((player) => {
      const currentRank = rankValue[player.rank.split(" ")[0]] || 0;
      const bestRank = rankValue[mvp.rank.split(" ")[0]] || 0;

      if (currentRank > bestRank) {
        mvp = player;
      }
    });

    // Preenche os dados nos cards
    players.forEach((player) => {
      // Seleciona o card pelo atributo data-player
      const card = document.querySelector(
        `[data-player="${player.name}"]`
      );

      // Se não encontrar o card, ignora
      if (!card) return;

      // Seleciona os elementos internos
      const rankText = card.querySelector("p");
      const rankImg = card.querySelector(".rank_logo");

      // Atualiza texto do rank
      if (rankText) {
        rankText.textContent = `${player.rank} • ${player.rr} RR`;
      }

      // Atualiza imagem do rank
      if (rankImg) {
        rankImg.src = getRankImage(player.rank);
      }
    });

    // Destaca o MVP
    const mvpCard = document.querySelector(
      `[data-player="${mvp.name}"]`
    );

    if (mvpCard && container) {
      // Move o MVP para o centro visual
      const cards = Array.from(container.children);
      const middleIndex = Math.floor(cards.length / 2);

      container.removeChild(mvpCard);
      container.insertBefore(mvpCard, container.children[middleIndex]);

      // Aplica classe de destaque
      mvpCard.classList.add("player_card_mvp");
    }

  } catch (err) {
    console.error("Erro ao carregar time:", err);
  }
}

// Garante que o DOM carregou antes de executar
document.addEventListener("DOMContentLoaded", loadTeam);

// Atualiza automaticamente o ano no footer
const anoAtual = new Date().getFullYear();
const anoElemento = document.getElementById("ano");

if (anoElemento) {
  anoElemento.textContent = anoAtual;
}