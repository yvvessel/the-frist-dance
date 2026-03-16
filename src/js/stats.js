async function loadStats(){

  const res = await fetch("http://localhost:3000/stats")
  const data = await res.json()

  const container = document.getElementById("players_stats")

  container.innerHTML = ""

  data.players.forEach((p,i)=>{

    const div = document.createElement("div")
    div.classList.add("player_stat")

    div.innerHTML = `
      <h3>${i+1}. ${p.name}</h3>
      <p>KDA: ${p.kda.toFixed(2)}</p>
      <p>HS%: ${p.hs}%</p>
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