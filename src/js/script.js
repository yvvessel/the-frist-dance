async function loadTeam() {
  const response = await fetch("http://localhost:3000/team");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const players = await response.json();

  const container = document.querySelector(".players_container");

  // descobrir MVP
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
    const rankName = player.rank.toLowerCase()

        if(rankName.includes("bronze")) rankImg.classList.add("rank-bronze")
        if(rankName.includes("silver")) rankImg.classList.add("rank-silver")
        if(rankName.includes("gold")) rankImg.classList.add("rank-gold")
        if(rankName.includes("diamond")) rankImg.classList.add("rank-diamond")

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

  // mover MVP para o meio
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

async function loadStats(){

  const res = await fetch("http://localhost:3000/stats")
  const data = await res.json()

  const container = document.getElementById("players_stats")

  data.players.forEach((p,i)=>{

    const div = document.createElement("div")

    div.innerHTML = `
      <h3>${i+1}. ${p.name}</h3>
      <p>KDA: ${p.kda}</p>
      <p>HS%: ${p.hs}</p>
      <p>Main: ${p.main}</p>
      <p>Last Match: ${p.lastMatch}</p>
    `

    container.appendChild(div)

  })

  const o = data.teamOverview

  document.getElementById("team_overview").innerHTML = `
    <h2>Team Overview</h2>
    <p>MVP: ${o.mvp}</p>
    <p>Highest KDA: ${o.highestKDA}</p>
    <p>Most Headshots: ${o.mostHeadshots}</p>
    <p>Most Wins: ${o.mostWins}</p>
  `

}

loadStats()

//rank imagens
function getRankImage(rank) {
  return (
    "/assets/images/ranks/" +
    rank.toLowerCase().replace(/\s+/g, "_") +
    "_" +
    "Rank" +
    ".png"
  );
}

//ranqueando ranks
const rankValue = {
  "Iron 1": 1,
  "Iron 2": 2,
  "Iron 3": 3,
  "Bronze 1": 4,
  "Bronze 2": 5,
  "Bronze 3": 6,
  "Silver 1": 7,
  "Silver 2": 8,
  "Silver 3": 9,
  "Gold 1": 10,
  "Gold 2": 11,
  "Gold 3": 12,
  "Platinum 1": 13,
  "Platinum 2": 14,
  "Platinum 3": 15,
  "Diamond 1": 16,
  "Diamond 2": 17,
  "Diamond 3": 18,
  "Ascendant 1": 19,
  "Ascendant 2": 20,
  "Ascendant 3": 21,
  "Immortal 1": 22,
  "Immortal 2": 23,
  "Immortal 3": 24,
"Radiant 1": 25,
};
