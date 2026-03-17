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

        // 🔹 PEGAR PUUID
        const accountRes = await fetch(
          `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
          { headers: { Authorization: API_KEY } }
        );

        const accountData = await accountRes.json();

        if (!accountData?.data?.puuid) {
          return {
            name: player.name,
            kda: 0,
            hs: 0,
            main: "Unknown",
            lastMatch: "Unknown",
            wins: 0,
            matches: 0,
            winrate: 0
          };
        }

        const puuid = accountData.data.puuid;

        // 🔥 PAGINAÇÃO (CURSOR)
        let allMatches = [];
        let cursor = null;

        while (allMatches.length < 50) {
          const url = new URL(
            `https://api.henrikdev.xyz/valorant/v3/matches/br/${encodeURIComponent(player.name)}/${player.tag}`
          );

          url.searchParams.append("size", "10");

          if (cursor) {
            url.searchParams.append("cursor", cursor);
          }

          const response = await fetch(url, {
            headers: { Authorization: API_KEY }
          });

          const data = await response.json();

          if (!data?.data || data.data.length === 0) break;

          allMatches.push(...data.data);

          cursor = data?.meta?.cursor;

          if (!cursor) break;
        }

        // 🔹 FILTRAR COMPETITIVE
        const matches = allMatches
          .filter(m => m.metadata?.mode === "Competitive")
          .slice(0, 20);

        let kills = 0;
        let deaths = 0;
        let assists = 0;
        let headshots = 0;
        let shots = 0;
        let wins = 0;

        const agentCount = {};

        matches.forEach((match) => {
          if (!match.players?.all_players) return;

          const p = match.players.all_players.find(pl => pl.puuid === puuid);
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

        let main = "Unknown";
        if (Object.keys(agentCount).length > 0) {
          main = Object.keys(agentCount).reduce((a, b) =>
            agentCount[a] > agentCount[b] ? a : b
          );
        }

        const lastMatch = matches[0]?.metadata?.mode || "Unknown";

        return {
          name: player.name,
          kda: Number(kda.toFixed(2)),
          hs: Number(hs.toFixed(1)),
          main,
          lastMatch,
          wins,
          matches: matchCount,
          winrate: Number(winrate.toFixed(1))
        };
      })
    );

    // 🔹 SORT POR KDA REAL
    results.sort((a, b) => b.kda - a.kda);

    const overview = {
      mvp: results[0]?.name,
      highestKDA: results[0]?.name,
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