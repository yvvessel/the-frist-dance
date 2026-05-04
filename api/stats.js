export default async function handler(req, res) {
  const API_KEY = process.env.API_KEY;

  const players = [
    { name: "手机断电", tag: "777" },
    { name: "Ferazor", tag: "BR1" },
    { name: "yvv", tag: "B4EM" },
    { name: "tinyrick", tag: "7248" },
    { name: "T1n Doll", tag: "4328" },
  ];

  try {
    const results = await Promise.all(
      players.map(async (player) => {
        try {
          // buscar PUUID
          const accountRes = await fetch(
            `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
            { headers: { Authorization: API_KEY } }
          );

          const accountData = await accountRes.json();

          if (!accountData?.data?.puuid) {
            return createEmptyPlayer(player.name);
          }

          const puuid = accountData.data.puuid;

          // buscar partidas (paginação)
          let allMatches = [];
          let cursor = null;

          while (allMatches.length < 50) {
            const url = new URL(
              `https://api.henrikdev.xyz/valorant/v3/matches/br/${encodeURIComponent(player.name)}/${player.tag}`
            );

            url.searchParams.append("size", "10");

            if (cursor) url.searchParams.append("cursor", cursor);

            const response = await fetch(url, {
              headers: { Authorization: API_KEY }
            });

            const data = await response.json();

            if (!data?.data?.length) break;

            allMatches.push(...data.data);
            cursor = data?.meta?.cursor;

            if (!cursor) break;
          }

          // filtrar competitivo
          const matches = allMatches
            .filter(m => m.metadata?.mode === "Competitive")
            .slice(0, 20);

          // stats base
          let kills = 0, deaths = 0, assists = 0;
          let headshots = 0, shots = 0, wins = 0;

          const agentCount = {};

          matches.forEach((match) => {
            const p = match.players?.all_players?.find(pl => pl.puuid === puuid);
            if (!p) return;

            kills += p.stats.kills;
            deaths += p.stats.deaths;
            assists += p.stats.assists;

            headshots += p.stats.headshots;
            shots += p.stats.headshots + p.stats.bodyshots + p.stats.legshots;

            const won =
              (p.team === "Red" && match.teams.red.has_won) ||
              (p.team === "Blue" && match.teams.blue.has_won);

            if (won) wins++;

            const agent = p.character;
            agentCount[agent] = (agentCount[agent] || 0) + 1;
          });

          const matchCount = matches.length;

          const kda = deaths === 0
            ? kills + assists
            : (kills + assists) / deaths;

          const hs = shots === 0
            ? 0
            : (headshots / shots) * 100;

          const winrate = matchCount === 0
            ? 0
            : (wins / matchCount) * 100;

          // agente mais usado
          let main = "Unknown";
          if (Object.keys(agentCount).length) {
            main = Object.keys(agentCount).reduce((a, b) =>
              agentCount[a] > agentCount[b] ? a : b
            );
          }

          return {
            name: player.name,
            kda: Number(kda.toFixed(2)),
            hs: Number(hs.toFixed(1)),
            main,
            lastMatch: matches[0]?.metadata?.mode || "Unknown",
            wins,
            matches: matchCount,
            winrate: Number(winrate.toFixed(1))
          };

        } catch {
          return createEmptyPlayer(player.name);
        }
      })
    );

    // ordenar por KDA
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

  } catch {
    res.status(500).json({ error: "Erro ao gerar stats" });
  }
}

// fallback
function createEmptyPlayer(name) {
  return {
    name,
    kda: 0,
    hs: 0,
    main: "Unknown",
    lastMatch: "Unknown",
    wins: 0,
    matches: 0,
    winrate: 0
  };
}