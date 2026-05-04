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

// normalizar nome (resolve bug com espaço + caracteres especiais)
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .normalize("NFD")
    .replace(/[^\w]/g, "");
}

function getRankImage(rank) {
  const name = rank.toLowerCase().replace(/\s+/g, "_") + "_Rank.png";
  return `/assets/images/ranks/${name}`;
}

async function loadTeam() {
  try {
    const response = await fetch("/api/team");
    const players = await response.json();

    if (!Array.isArray(players)) {
      console.error("API retornou erro:", players);
      return;
    }

    const container = document.querySelector(".players_container");

    // ✅ DEFINE MVP corretamente
    let mvp = players[0];

    players.forEach((player) => {
      const currentRank = rankValue[player.rank.split(" ")[0]] || 0;
      const bestRank = rankValue[mvp.rank.split(" ")[0]] || 0;

      if (currentRank > bestRank) {
        mvp = player;
      }
    });

    // ✅ PREENCHE DADOS
    players.forEach((player) => {
      const name = normalizeName(player.name);

      const rankText = document.getElementById("rank-" + name);
      const rankImg = document.getElementById("ranking-" + name);

      if (rankText) {
        rankText.textContent = `${player.rank} • ${player.rr} RR`;
      }

      if (rankImg) {
        rankImg.src = getRankImage(player.rank);
      }
    });

    // ✅ DESTACA MVP
    const mvpCard = document.querySelector(
      `[data-player="${mvp.name}"]`
    );

    if (mvpCard && container) {
      const cards = Array.from(container.children);
      const middleIndex = Math.floor(cards.length / 2);

      container.removeChild(mvpCard);
      container.insertBefore(mvpCard, container.children[middleIndex]);

      mvpCard.classList.add("player_card_mvp");
    }

  } catch (err) {
    console.error("Erro ao carregar time:", err);
  }
}

// ✅ GARANTE QUE O DOM CARREGOU
document.addEventListener("DOMContentLoaded", loadTeam);

// ano automático
const anoAtual = new Date().getFullYear();
const anoEl = document.getElementById("ano");
if (anoEl) {
  anoEl.textContent = anoAtual;
}