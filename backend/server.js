require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());

const API_KEY = process.env.API_KEY;

const players = [
  { name: "Xanxes", tag: "SCCP" },
  { name: "Ferazor", tag: "BR1" },
  { name: "yvv", tag: "YSL" },
  { name: "tinyrick", tag: "7248" },
  { name: "T1n Doll", tag: "4328" },
];

app.get("/team", async (req, res) => {
  try {
    const results = await Promise.all(
      players.map(async (player) => {
        // buscar conta
        const accountResponse = await fetch(
          `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
          {
            headers: {
              Authorization: API_KEY,
            },
          },
        );

        const accountData = await accountResponse.json();

        if (!accountData.data) {
          return {
            name: player.name,
            rank: "Unranked",
            rr: 0,
          };
        }

        const puuid = accountData.data.puuid;

        // buscar rank
        const mmrResponse = await fetch(
          `https://api.henrikdev.xyz/valorant/v3/by-puuid/mmr/br/pc/${puuid}`,
          {
            headers: {
              Authorization: API_KEY,
            },
          },
        );

        const mmrData = await mmrResponse.json();

        const rank = mmrData?.data?.current?.tier?.name || "Unranked";
        const rr = mmrData?.data?.current?.rr || 0;

        return {
          name: player.name,
          rank: rank,
          rr: rr,
        };
      }),
    );

    res.json(results);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erro ao buscar dados do time",
    });
  }
});

//estatisticas
app.get("/stats", async (req, res) => {
  try {
    const results = await Promise.all(
      players.map(async (player) => {
        // pegar conta
        const accountResponse = await fetch(
          `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
          { headers: { Authorization: API_KEY } },
        );

        const accountData = await accountResponse.json();
        if (!accountData.data) {
          return {
            name: player.name,
            kda: 0,
            hs: 0,
            main: "Unknown",
            lastMatch: "Unknown",
            wins: 0,
          };
        }

        const puuid = accountData.data.puuid;

        // adicionar aqui
        let kills = 0;
        let deaths = 0;
        let assists = 0;
        let headshots = 0;
        let shots = 0;
        let wins = 0;

        const agentCount = {};

        // pegar partidas
        const matchesResponse = await fetch(
          `https://api.henrikdev.xyz/valorant/v3/matches/br/${encodeURIComponent(player.name)}/${player.tag}?size=10`,
          {
            headers: { Authorization: API_KEY },
          },
        );

        const matchesData = await matchesResponse.json();

        matchesData.data.forEach((match) => {
          if (!match.players || !match.players.all_players) return;

          const p = match.players.all_players.find((pl) => pl.puuid === puuid);

          if (!p) return;

          kills += p.stats.kills;
          deaths += p.stats.deaths;
          assists += p.stats.assists;

          headshots += p.stats.headshots;
          shots += p.stats.headshots + p.stats.bodyshots + p.stats.legshots;

          // contar vitórias
          const teamWon =
            (p.team === "Red" && match.teams.red.has_won) ||
            (p.team === "Blue" && match.teams.blue.has_won);

          if (teamWon) wins++;

          // agente mais jogado
          const agent = p.character;
          agentCount[agent] = (agentCount[agent] || 0) + 1;
        });

        const kda = deaths === 0 ? kills + assists : (kills + assists) / deaths;
        const hs = shots === 0 ? 0 : ((headshots / shots) * 100).toFixed(1);

        let main = "Unknown";

        if (Object.keys(agentCount).length > 0) {
          main = Object.keys(agentCount).reduce((a, b) =>
            agentCount[a] > agentCount[b] ? a : b,
          );
        }

        const lastRealMatch = matchesData.data.find(
          (m) => m.metadata?.mode !== "Custom Game",
        );

        const lastMatch = lastRealMatch?.metadata?.mode || "Unknown";

        return {
          name: player.name,
          kda: Number(kda),
          hs: Number(hs),
          main: main,
          lastMatch: lastMatch,
          wins: wins,
        };
      }),
    );

    // ordenar por KDA
    results.sort((a, b) => b.kda - a.kda);

    // team overview
    const overview = {
      mvp: results[0].name,
      highestKDA: results.reduce((a, b) => (a.kda > b.kda ? a : b)).name,
      mostHeadshots: results.reduce((a, b) => (a.hs > b.hs ? a : b)).name,
      mostWins: results.reduce((a, b) => (a.wins > b.wins ? a : b)).name,
    };

    res.json({
      players: results,
      teamOverview: overview,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar stats" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
