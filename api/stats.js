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

          // 🔹 MATCHES
          const matchesResponse = await fetch(
            `https://api.henrikdev.xyz/valorant/v3/matches/br/${encodeURIComponent(player.name)}/${player.tag}?size=20`,
            { headers: { Authorization: API_KEY } }
          );

          const matchesData = await matchesResponse.json();

          const matches = matchesData?.data || [];

          // 🔥 apenas competitivo
          const competitiveMatches = matches.filter(
            (m) => m.metadata?.mode === "Competitive"
          );

          if (competitiveMatches.length === 0) {
            return fallbackPlayer(player.name);
          }

          let kills = 0;
          let deaths = 0;
          let assists = 0;
          let headshots = 0;
          let wins = 0;

          const agentStats = {};

          competitiveMatches.forEach((match) => {
            if (!match.players?.all_players) return;

            const p = match.players.all_players.find(
              (pl) => pl.puuid === puuid
            );
            if (!p) return;

            const k = p.stats.kills;
            const d = p.stats.deaths;
            const a = p.stats.assists;

            kills += k;
            deaths += d;
            assists += a;
            headshots += p.stats.headshots;

            const teamWon =
              (p.team === "Red" && match.teams.red.has_won) ||
              (p.team === "Blue" && match.teams.blue.has_won);

            if (teamWon) wins++;

            const agent = p.character;

            if (!agentStats[agent]) {
              agentStats[agent] = {
                matches: 0,
                kills: 0,
                deaths: 0,
                assists: 0,
              };
            }

            agentStats[agent].matches++;
            agentStats[agent].kills += k;
            agentStats[agent].deaths += d;
            agentStats[agent].assists += a;
          });

          const totalMatches = competitiveMatches.length;

          
          const kd = deaths === 0 ? kills : kills / deaths;
          const kda =
            deaths === 0
              ? kills + assists * 0.5
              : (kills + assists * 0.5) / deaths;

          
          const hs = kills === 0 ? 0 : (headshots / kills) * 100;

          
          const winrate = (wins / totalMatches) * 100;

          
          let main = "Unknown";
          let bestAgent = "Unknown";
          let bestAgentScore = 0;

          if (Object.keys(agentStats).length > 0) {
            main = Object.keys(agentStats).reduce((a, b) =>
              agentStats[a].matches > agentStats[b].matches ? a : b
            );

            
            bestAgent = Object.keys(agentStats).reduce((best, agent) => {
              const stats = agentStats[agent];
              const agentKDA =
                stats.deaths === 0
                  ? stats.kills
                  : (stats.kills + stats.assists * 0.5) / stats.deaths;

              if (agentKDA > bestAgentScore) {
                bestAgentScore = agentKDA;
                return agent;
              }
              return best;
            }, "Unknown");
          }

          
          const lastMatch = competitiveMatches[0]?.metadata?.mode || "Unknown";

          
          const score = kda * 2 + kd * 1.5 + hs * 0.3 + winrate * 0.5;

          return {
            name: player.name,
            kd: Number(kd.toFixed(2)),
            kda: Number(kda.toFixed(2)),
            hs: Number(hs.toFixed(1)),
            winrate: Number(winrate.toFixed(1)),
            wins,
            matches: totalMatches,
            main,
            bestAgent,
            lastMatch,
            score,
          };
        } catch (err) {
          console.error("Erro player:", player.name, err);
          return fallbackPlayer(player.name);
        }
      })
    );

    
    results.sort((a, b) => b.score - a.score);

    const overview = {
      mvp: results[0]?.name || "N/A",
      highestKDA: results.reduce((a, b) => (a.kda > b.kda ? a : b)).name,
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


function fallbackPlayer(name) {
  return {
    name,
    kd: 0,
    kda: 0,
    hs: 0,
    winrate: 0,
    wins: 0,
    matches: 0,
    main: "Unknown",
    bestAgent: "Unknown",
    lastMatch: "Unknown",
    score: 0,
  };
}