export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;

  const players = [
    { name: "Xanxes", tag: "SCCP" },
    { name: "Ferazor", tag: "BR1" },
    { name: "yvv", tag: "YSL" },
    { name: "tinyrick", tag: "7248" },
    { name: "T1n Doll", tag: "4328" },
  ];

  try {
    const results = await Promise.all(
      players.map(async (player) => {
        try {
          // 🔹 ACCOUNT
          const accountResponse = await fetch(
            `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
            { headers: { Authorization: API_KEY } }
          );

          const accountData = await accountResponse.json();

          if (!accountData?.data) {
            return fallbackPlayer(player.name);
          }

          const puuid = accountData.data.puuid;

          // 🔹 MATCHES (pega mais pra filtrar depois)
          const matchesResponse = await fetch(
            `https://api.henrikdev.xyz/valorant/v3/matches/br/${encodeURIComponent(player.name)}/${player.tag}?size=50`,
            { headers: { Authorization: API_KEY } }
          );

          const matchesData = await matchesResponse.json();

          const matches = matchesData?.data || [];

          // ✅ SOMENTE COMPETITIVO + LIMITE 20
          const competitiveMatches = matches
            .filter((m) => m.metadata?.mode === "Competitive")
            .slice(0, 20);

          if (competitiveMatches.length === 0) {
            return fallbackPlayer(player.name);
          }

          let kills = 0;
          let deaths = 0;
          let assists = 0;
          let headshots = 0;
          let shots = 0;
          let wins = 0;

          const agentCount = {};

          competitiveMatches.forEach((match) => {
            if (!match.players?.all_players) return;

            const p = match.players.all_players.find(
              (pl) => pl.puuid === puuid
            );
            if (!p) return;

            kills += p.stats.kills;
            deaths += p.stats.deaths;
            assists += p.stats.assists;

            headshots += p.stats.headshots;
            shots +=
              p.stats.headshots +
              p.stats.bodyshots +
              p.stats.legshots;

            const teamWon =
              (p.team === "Red" && match.teams.red.has_won) ||
              (p.team === "Blue" && match.teams.blue.has_won);

            if (teamWon) wins++;

            const agent = p.character;
            agentCount[agent] = (agentCount[agent] || 0) + 1;
          });

          const totalMatches = competitiveMatches.length;

          // ✅ KDA padrão
          const kda =
            deaths === 0 ? kills + assists : (kills + assists) / deaths;

          // ✅ HS correto
          const hs = shots === 0 ? 0 : (headshots / shots) * 100;

          // ✅ Winrate
          const winrate = (wins / totalMatches) * 100;

          // ✅ Main agent
          let main = "Unknown";
          if (Object.keys(agentCount).length > 0) {
            main = Object.keys(agentCount).reduce((a, b) =>
              agentCount[a] > agentCount[b] ? a : b
            );
          }

          return {
            name: player.name,
            kda: Number(kda.toFixed(2)),
            hs: Number(hs.toFixed(1)),
            winrate: Number(winrate.toFixed(1)),
            wins,
            matches: totalMatches,
            main,
            lastMatch: "Competitive",
          };
        } catch (err) {
          console.error("Erro player:", player.name, err);
          return fallbackPlayer(player.name);
        }
      })
    );

    // ✅ ordena por KDA
    results.sort((a, b) => b.kda - a.kda);

    const overview = {
      mvp: results[0]?.name || "N/A",
      highestKDA: results[0]?.name || "N/A",
      mostHeadshots: results.reduce((a, b) => (a.hs > b.hs ? a : b)).name,
      mostWins: results.reduce((a, b) => (a.wins > b.wins ? a : b)).name,
    };

    res.status(200).json({
      players: results,
      teamOverview: overview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar stats" });
  }
}

// 🔹 fallback seguro
function fallbackPlayer(name) {
  return {
    name,
    kda: 0,
    hs: 0,
    winrate: 0,
    wins: 0,
    matches: 0,
    main: "Unknown",
    lastMatch: "Unknown",
  };
}