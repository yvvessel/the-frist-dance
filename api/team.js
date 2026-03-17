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

        const accountResponse = await fetch(
  `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
  {
    headers: {
      Authorization: API_KEY
    }
  }
);

const accountData = await accountResponse.json();

console.log("ACCOUNT DATA:", player.name, accountData);

        if (!accountData.data) {
          console.log("ACCOUNT FAIL:", player.name, accountData);
          return { name: player.name, rank: "Unranked", rr: 0 };
        }

        const puuid = accountData.data.puuid;

        const mmrResponse = await fetch(
          `https://api.henrikdev.xyz/valorant/v3/by-puuid/mmr/br/pc/${puuid}`,
          {
            headers: {
              Authorization: API_KEY
            }
          }
        );

        const mmrData = await mmrResponse.json();

        return {
          name: player.name,
          rank: mmrData?.data?.current_data?.currenttierpatched || "Unranked",
          rr: mmrData?.data?.current_data?.ranking_in_tier || 0
        };
      })
    );
    console.log("API KEY:", process.env.API_KEY);
    res.status(200).json(results);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar team" });
  }
}