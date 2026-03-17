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

        const response = await fetch(
          `https://api.henrikdev.xyz/valorant/v2/mmr/br/${encodeURIComponent(player.name)}/${player.tag}`,
          {
            headers: {
              Authorization: API_KEY
            }
          }
        );

        const data = await response.json();

        return {
          name: player.name,
          rank: data?.data?.current_data?.currenttierpatched || "Unranked",
          rr: data?.data?.current_data?.ranking_in_tier || 0
        };

      })
    );

    res.status(200).json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar team" });
  }

}