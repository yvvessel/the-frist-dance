require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

const players = [
  { name: "Xanxes", tag: "SCCP" },
  { name: "Ferazor", tag: "BR1" },
  { name: "yvv", tag: "YSL" },
  { name: "tinyrick", tag: "7248" },
  { name: "T1n Doll", tag: "4328" }
]

app.use(cors())

const API_KEY = process.env.API_KEY

app.get("/team", async (req, res) => {

  try {

    const results = []

    for (const player of players) {

      // buscar conta
      const accountResponse = await fetch(
        `https://api.henrikdev.xyz/valorant/v1/account/${player.name}/${player.tag}`,
        {
          headers: {
            "Authorization": API_KEY
          }
        }
      )

      const accountData = await accountResponse.json()
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

      results.push({
        name: player.name,
        rank: mmrData.data.current.tier.name,
        rr: mmrData.data.current.rr
      })

    }

    res.json(results)

  } catch (error) {

    res.status(500).json({ error: "Erro ao buscar time" })

  }

})