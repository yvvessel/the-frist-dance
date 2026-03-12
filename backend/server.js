require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())

const API_KEY = process.env.API_KEY

const players = [
  { name: "Xanxes", tag: "SCCP" },
  { name: "Ferazor", tag: "BR1" },
  { name: "yvv", tag: "YSL" },
  { name: "tinyrick", tag: "7248" },
  { name: "T1n Doll", tag: "4328" }
]

app.get("/team", async (req, res) => {

  try {

    const results = await Promise.all(players.map(async (player) => {

      // buscar conta
      const accountResponse = await fetch(
        `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(player.name)}/${player.tag}`,
        {
          headers: {
            "Authorization": API_KEY
          }
        }
      )

      const accountData = await accountResponse.json()

      if (!accountData.data) {
        return {
          name: player.name,
          rank: "Unranked",
          rr: 0
        }
      }

      const puuid = accountData.data.puuid

      // buscar rank
      const mmrResponse = await fetch(
        `https://api.henrikdev.xyz/valorant/v3/by-puuid/mmr/br/pc/${puuid}`,
        {
          headers: {
            "Authorization": API_KEY
          }
        }
      )

      const mmrData = await mmrResponse.json()

      const rank = mmrData?.data?.current?.tier?.name || "Unranked"
      const rr = mmrData?.data?.current?.rr || 0

      return {
        name: player.name,
        rank: rank,
        rr: rr
      }

    }))

    res.json(results)

  } catch (error) {

    console.error(error)

    res.status(500).json({
      error: "Erro ao buscar dados do time"
    })

  }

})

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000")
})