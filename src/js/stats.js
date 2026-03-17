async function loadStats() {
  const res = await fetch("/api/stats");
  const data = await res.json();

  const container = document.getElementById("players_stats");

  container.innerHTML = "";

  data.players.forEach((p, i) => {
    const div = document.createElement("div");
    div.classList.add("player_stat");

    div.innerHTML = `
      <h3>${i + 1}. ${p.name}</h3>
      <p>KDA: ${p.kda.toFixed(2)}</p>
      <p>HS%: ${p.hs}%</p>
      <p>Ultimo Agente: ${p.main}</p>
      <p>Ultima partida: ${p.lastMatch}</p>
    `;

    container.appendChild(div);
  });

  const o = data.teamOverview;

  document.getElementById("team_overview").innerHTML = `
    <h2>Team Overview</h2>
    <p>MVP: ${o.mvp}</p>
    <p>Maior KDA: ${o.highestKDA}</p>
    <p>Pior Headshots: ${o.mostHeadshots}</p>
    <p>Mais Vitórias: ${o.mostWins}</p>
  `;
}

loadStats();
