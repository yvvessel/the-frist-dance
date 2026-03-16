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
}

function getRankImage(rank){

  const name = rank.toLowerCase().replace(/\s+/g, "_") + "_Rank.png"

  return `assets/images/ranks/${name}`
}

async function loadTeam() {
  const response = await fetch("http://localhost:3000/team");
  const players = await response.json();

  const container = document.querySelector(".players_container");

  let mvp = players[0];

  players.forEach((player) => {
    const currentRank = rankValue[player.rank] || 0;
    const bestRank = rankValue[mvp.rank] || 0;

    if (currentRank > bestRank) {
      mvp = player;
    }
  });

  players.forEach((player) => {
    const name = player.name.toLowerCase().replace(/\s+/g, "");

    const rankText = document.getElementById("rank-" + name);
    const rankImg = document.getElementById("ranking-" + name);

    if (rankText) {
      const rank = document.createElement("span");
      rank.textContent = player.rank + " • " + player.rr + " RR";

      rankText.innerHTML = "";
      rankText.appendChild(rank);
    }

    if (rankImg) {
      rankImg.src = getRankImage(player.rank);
    }
  });

  const mvpCard = document.querySelector(`[data-player="${mvp.name}"]`);

  if (mvpCard) {
    const cards = Array.from(container.children);
    const middleIndex = Math.floor(cards.length / 2);

    container.removeChild(mvpCard);
    container.insertBefore(mvpCard, container.children[middleIndex]);

    mvpCard.classList.add("player_card_mvp");
  }
}

loadTeam();

const anoAtual = new Date().getFullYear();
document.getElementById("ano").textContent = anoAtual;