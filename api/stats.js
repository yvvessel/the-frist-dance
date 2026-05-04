async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    const data = await res.json();

    const container = document.getElementById("players_stats");
    if (!container) return;

    container.innerHTML = "";

    // render players
    data.players.forEach((p, i) => {
      const div = document.createElement("div");
      div.classList.add("player_stat");

      div.innerHTML = `
        <h3>${i + 1}. ${p.name}</h3>
        <p>KDA: ${p.kda}</p>
        <p>HS%: ${p.hs}%</p>
        <p>Winrate: ${p.winrate}%</p>
        <p>Partidas: ${p.matches}</p>
        <p>Main Agent: ${p.main}</p>
        <p>Modo: ${p.lastMatch}</p>
      `;

      container.appendChild(div);
    });

    // overview
    const o = data.teamOverview;
    const overview = document.getElementById("team_overview");

    if (overview) {
      overview.innerHTML = `
        <h2>Team Overview</h2>
        <p>MVP: ${o.mvp}</p>
        <p>Maior KDA: ${o.highestKDA}</p>
        <p>Mais HS: ${o.mostHeadshots}</p>
        <p>Mais Vitórias: ${o.mostWins}</p>
      `;
    }

  } catch (err) {
    console.error("Erro stats:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadStats);